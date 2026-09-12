// Busca sobre a Biblia.
//
// - searchVersesLexical: busca textual (full-text) no nivel de versiculo.
//   Retorna TODOS os acertos (recall completo), ordenados canonicamente.
//   Nao precisa de embedding/chave: e instantanea (indice GIN).
import { sql } from "./db.ts";
import { BOOK_BY_ID } from "./books.ts";
import { embedQuery, toVectorLiteral } from "./embeddings.ts";

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

// ---------------------------------------------------------------------------
// Busca semantica e hibrida (nivel de chunk = janela de versiculos).
// Cada chunk carrega verse_start/verse_end para citar a passagem.
// ---------------------------------------------------------------------------

export interface ChunkHit {
  bookId: number;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  text: string;
  ref: string; // ex.: "Jo 1:1-5"
  score: number;
}

function formatChunkRef(bookId: number, chapter: number, start: number, end: number): string {
  const book = BOOK_BY_ID.get(bookId);
  const range = start === end ? `${start}` : `${start}-${end}`;
  return `${book?.abbrevPt ?? bookId} ${chapter}:${range}`;
}

export interface SemanticOptions {
  query: string;
  versionCode?: string;
  limit?: number;
}

/** Busca por significado: embute a pergunta e ordena por distancia de cosseno. */
export async function searchSemantic(opts: SemanticOptions): Promise<ChunkHit[]> {
  const limit = opts.limit ?? 20;
  const vec = toVectorLiteral(await embedQuery(opts.query));
  const rows = await sql<
    {
      book_id: number;
      chapter: number;
      verse_start: number;
      verse_end: number;
      text: string;
      distance: number;
    }[]
  >`
    SELECT c.book_id, c.chapter, c.verse_start, c.verse_end, c.text,
           (c.embedding <=> ${vec}::halfvec) AS distance
    FROM chunks c
    JOIN versions ve ON ve.id = c.version_id
    WHERE c.embedding IS NOT NULL
      ${opts.versionCode ? sql`AND ve.code = ${opts.versionCode.toUpperCase()}` : sql``}
    ORDER BY c.embedding <=> ${vec}::halfvec
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    bookId: r.book_id,
    chapter: r.chapter,
    verseStart: r.verse_start,
    verseEnd: r.verse_end,
    text: r.text,
    ref: formatChunkRef(r.book_id, r.chapter, r.verse_start, r.verse_end),
    score: 1 - Number(r.distance), // similaridade de cosseno (0..1)
  }));
}

export interface HybridOptions {
  query: string;
  versionCode?: string;
  limit?: number;
  rrfK?: number; // constante do RRF (padrao 60)
}

/**
 * Busca hibrida: funde a lista lexical (FTS) com a semantica (vetor) por RRF
 * (Reciprocal Rank Fusion), tudo em uma unica query SQL.
 */
export async function searchHybrid(opts: HybridOptions): Promise<ChunkHit[]> {
  const limit = opts.limit ?? 20;
  const k = opts.rrfK ?? 60;
  const pool = Math.max(limit * 4, 50); // candidatos por lista antes da fusao
  const vec = toVectorLiteral(await embedQuery(opts.query));
  const versionFilter = opts.versionCode
    ? sql`AND ve.code = ${opts.versionCode.toUpperCase()}`
    : sql``;

  const rows = await sql<
    {
      book_id: number;
      chapter: number;
      verse_start: number;
      verse_end: number;
      text: string;
      score: number;
    }[]
  >`
    WITH semantic AS (
      SELECT c.id, row_number() OVER (ORDER BY c.embedding <=> ${vec}::halfvec) AS rank
      FROM chunks c
      JOIN versions ve ON ve.id = c.version_id
      WHERE c.embedding IS NOT NULL ${versionFilter}
      ORDER BY c.embedding <=> ${vec}::halfvec
      LIMIT ${pool}
    ),
    lexical AS (
      SELECT c.id, row_number() OVER (
               ORDER BY ts_rank(c.tsv, websearch_to_tsquery('portuguese', ${opts.query})) DESC
             ) AS rank
      FROM chunks c
      JOIN versions ve ON ve.id = c.version_id
      WHERE c.tsv @@ websearch_to_tsquery('portuguese', ${opts.query}) ${versionFilter}
      LIMIT ${pool}
    ),
    fused AS (
      SELECT id, sum(1.0 / (${k} + rank)) AS score
      FROM (
        SELECT id, rank FROM semantic
        UNION ALL
        SELECT id, rank FROM lexical
      ) r
      GROUP BY id
      ORDER BY score DESC
      LIMIT ${limit}
    )
    SELECT c.book_id, c.chapter, c.verse_start, c.verse_end, c.text, f.score
    FROM fused f
    JOIN chunks c ON c.id = f.id
    ORDER BY f.score DESC
  `;
  return rows.map((r) => ({
    bookId: r.book_id,
    chapter: r.chapter,
    verseStart: r.verse_start,
    verseEnd: r.verse_end,
    text: r.text,
    ref: formatChunkRef(r.book_id, r.chapter, r.verse_start, r.verse_end),
    score: Number(r.score),
  }));
}
