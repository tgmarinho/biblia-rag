// Ingestao de uma versao PT a partir do dataset damarals/biblias (formato JSON).
//
// Uso:
//   tsx scripts/ingest-pt.ts <CODIGO> [caminho-do-json]
// Exemplos:
//   tsx scripts/ingest-pt.ts ACF
//   tsx scripts/ingest-pt.ts NVI ~/Downloads/biblias-github/biblias/inst/json/NVI.json
//
// O JSON e um array de livros em ordem canonica:
//   [{ abbrev, name, chapters: [ [v1, v2, ...], ... ] }, ...]
// Popula: books (se vazio), versions, verses e chunks (janelas de versiculos).
// NAO gera embeddings aqui - isso e feito por scripts/embed.ts (requer OPENAI_API_KEY).
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { sql } from "../src/db.ts";
import { BOOKS } from "../src/books.ts";

const CHUNK_SIZE = 5; // versiculos por janela
const CHUNK_OVERLAP = 1; // versiculos repetidos entre janelas vizinhas

interface VersionMeta {
  name: string;
  license: string;
  copyrighted: boolean;
}

const VERSIONS: Record<string, VersionMeta> = {
  ACF: { name: "Almeida Corrigida Fiel", license: "Sociedade Bíblica Trinitariana", copyrighted: true },
  ARA: { name: "Almeida Revista e Atualizada", license: "SBB", copyrighted: true },
  ARC: { name: "Almeida Revista e Corrigida", license: "SBB", copyrighted: true },
  AS21: { name: "Almeida Século 21", license: "Vida Nova", copyrighted: true },
  JFAA: { name: "João Ferreira de Almeida Atualizada", license: "domínio público", copyrighted: false },
  KJA: { name: "King James Atualizada", license: "Abba Press", copyrighted: true },
  KJF: { name: "King James Fiel", license: "BV Books", copyrighted: true },
  NAA: { name: "Nova Almeida Atualizada", license: "SBB", copyrighted: true },
  NBV: { name: "Nova Bíblia Viva", license: "Mundo Cristão", copyrighted: true },
  NTLH: { name: "Nova Tradução na Linguagem de Hoje", license: "SBB", copyrighted: true },
  NVI: { name: "Nova Versão Internacional", license: "Biblica", copyrighted: true },
  NVT: { name: "Nova Versão Transformadora", license: "Mundo Cristão", copyrighted: true },
  TB: { name: "Tradução Brasileira", license: "domínio público", copyrighted: false },
};

interface RawBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

async function seedBooks(): Promise<void> {
  const rows = await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM books`;
  if ((rows[0]?.count ?? 0) > 0) return;
  await sql`INSERT INTO books ${sql(
    BOOKS.map((b) => ({
      id: b.id,
      osis: b.osis,
      usfm: b.usfm,
      abbrev_pt: b.abbrevPt,
      name_pt: b.namePt,
      name_en: b.nameEn,
      testament: b.testament,
      chapter_count: b.chapterCount,
    })),
  )}`;
  console.log(`  livros: ${BOOKS.length} inseridos`);
}

function buildChunks(verses: string[]): { start: number; end: number; text: string }[] {
  const chunks: { start: number; end: number; text: string }[] = [];
  const step = Math.max(1, CHUNK_SIZE - CHUNK_OVERLAP);
  for (let i = 0; i < verses.length; i += step) {
    const slice = verses.slice(i, i + CHUNK_SIZE);
    if (slice.length === 0) break;
    chunks.push({
      start: i + 1,
      end: i + slice.length,
      text: slice.join(" "),
    });
    if (i + CHUNK_SIZE >= verses.length) break; // ultima janela ja cobriu o fim
  }
  return chunks;
}

async function main(): Promise<void> {
  const code = (process.argv[2] ?? "ACF").toUpperCase();
  const meta = VERSIONS[code];
  if (!meta) {
    console.error(`Versão desconhecida: ${code}. Conhecidas: ${Object.keys(VERSIONS).join(", ")}`);
    process.exit(1);
  }
  const defaultPath = resolve(homedir(), "Downloads/biblias-github/biblias/inst/json", `${code}.json`);
  const jsonPath = process.argv[3] ? resolve(process.argv[3]) : defaultPath;

  console.log(`Ingerindo ${code} (${meta.name}) de ${jsonPath}`);
  const data = JSON.parse(readFileSync(jsonPath, "utf8")) as RawBook[];
  if (data.length !== BOOKS.length) {
    console.warn(`  aviso: ${data.length} livros no JSON, esperado ${BOOKS.length}`);
  }

  await seedBooks();

  // (re)cria a versao do zero para tornar a ingestao idempotente
  await sql`DELETE FROM versions WHERE code = ${code}`;
  const inserted = await sql<{ id: number }[]>`
    INSERT INTO versions (code, name, language, license, copyrighted)
    VALUES (${code}, ${meta.name}, 'pt', ${meta.license}, ${meta.copyrighted})
    RETURNING id`;
  const versionId = inserted[0]?.id;
  if (versionId === undefined) throw new Error("falha ao inserir versão");

  let verseCount = 0;
  let chunkCount = 0;

  for (let bookIdx = 0; bookIdx < data.length; bookIdx++) {
    const book = data[bookIdx]!;
    const bookId = bookIdx + 1; // ordem canonica

    const verseRows: { version_id: number; book_id: number; chapter: number; verse: number; text: string }[] = [];
    const chunkRows: {
      version_id: number;
      book_id: number;
      chapter: number;
      verse_start: number;
      verse_end: number;
      text: string;
    }[] = [];

    book.chapters.forEach((verses, chapterIdx) => {
      const chapter = chapterIdx + 1;
      verses.forEach((text, verseIdx) => {
        verseRows.push({ version_id: versionId, book_id: bookId, chapter, verse: verseIdx + 1, text });
      });
      for (const c of buildChunks(verses)) {
        chunkRows.push({
          version_id: versionId,
          book_id: bookId,
          chapter,
          verse_start: c.start,
          verse_end: c.end,
          text: c.text,
        });
      }
    });

    if (verseRows.length) {
      await sql`INSERT INTO verses ${sql(verseRows)}`;
      verseCount += verseRows.length;
    }
    if (chunkRows.length) {
      await sql`INSERT INTO chunks ${sql(chunkRows)}`;
      chunkCount += chunkRows.length;
    }
  }

  console.log(`  versículos: ${verseCount}`);
  console.log(`  chunks: ${chunkCount}`);
  console.log("Concluído.");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
