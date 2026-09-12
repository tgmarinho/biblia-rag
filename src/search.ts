// Busca sobre a Biblia.
//
// - searchVersesLexical: busca textual (full-text) no nivel de versiculo.
//   Retorna TODOS os acertos (recall completo), ordenados canonicamente.
//   Nao precisa de embedding/chave: e instantanea (indice GIN).
import { sql } from "./db.ts";
import { BOOK_BY_ID } from "./books.ts";

export interface VerseHit {
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
  ref: string; // ex.: "Jo 1:14"
}

/** Monta uma tsquery em OR a partir de palavras soltas (ex.: gloria | glorificado). */
function orTsQuery(terms: string[]): string {
  const cleaned = terms
    .map((t) => t.trim())
    .filter(Boolean)
    // remove operadores de tsquery para evitar erro de sintaxe
    .map((t) => t.replace(/[&|!():*<>]/g, " ").trim())
    .filter(Boolean);
  if (cleaned.length === 0) throw new Error("nenhum termo de busca valido");
  return cleaned.join(" | ");
}

function formatRef(bookId: number, chapter: number, verse: number): string {
  const book = BOOK_BY_ID.get(bookId);
  return `${book?.abbrevPt ?? bookId} ${chapter}:${verse}`;
}

export interface LexicalOptions {
  terms: string[];
  versionCode?: string;
  limit?: number; // omitido = todos
}

export async function searchVersesLexical(opts: LexicalOptions): Promise<VerseHit[]> {
  const query = orTsQuery(opts.terms);
  const rows = await sql<
    { book_id: number; chapter: number; verse: number; text: string }[]
  >`
    SELECT v.book_id, v.chapter, v.verse, v.text
    FROM verses v
    JOIN versions ve ON ve.id = v.version_id
    WHERE v.tsv @@ to_tsquery('portuguese', ${query})
      ${opts.versionCode ? sql`AND ve.code = ${opts.versionCode.toUpperCase()}` : sql``}
    ORDER BY v.book_id, v.chapter, v.verse
    ${opts.limit ? sql`LIMIT ${opts.limit}` : sql``}
  `;
  return rows.map((r) => ({
    bookId: r.book_id,
    chapter: r.chapter,
    verse: r.verse,
    text: r.text,
    ref: formatRef(r.book_id, r.chapter, r.verse),
  }));
}
