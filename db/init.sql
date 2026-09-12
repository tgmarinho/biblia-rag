-- Esquema do biblia-rag.
-- Executado automaticamente na primeira subida do container Postgres.

CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- Tabela canonica de livros: mapeia todos os esquemas de codigo (OSIS, USFM,
-- abreviacoes PT) para um id unico e uma ordem canonica. E o ponto de ligacao
-- entre versoes PT, grego e hebraico.
-- ---------------------------------------------------------------------------
CREATE TABLE books (
  id             INTEGER PRIMARY KEY,          -- ordem canonica (1 = Genesis)
  osis           TEXT NOT NULL UNIQUE,         -- ex.: "Gen", "John"
  usfm           TEXT NOT NULL,                -- ex.: "GEN", "JHN"
  abbrev_pt      TEXT NOT NULL,                -- ex.: "gn", "jo"
  name_pt        TEXT NOT NULL,                -- ex.: "Genesis", "Joao"
  name_en        TEXT NOT NULL,
  testament      TEXT NOT NULL CHECK (testament IN ('OT', 'NT')),
  chapter_count  INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- Versoes/traducoes (PT, grego, hebraico).
-- ---------------------------------------------------------------------------
CREATE TABLE versions (
  id          SERIAL PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,            -- ex.: "ACF", "NVI", "SBLGNT", "WLC"
  name        TEXT NOT NULL,
  language    TEXT NOT NULL,                   -- "pt", "grc" (grego koine), "hbo" (hebraico)
  license     TEXT,
  copyrighted BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------------------------------------------------------
-- Camada atomica: um versiculo por linha. Serve para citacao exata e para
-- linkar PT <-> original por referencia.
-- ---------------------------------------------------------------------------
CREATE TABLE verses (
  id          BIGSERIAL PRIMARY KEY,
  version_id  INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  book_id     INTEGER NOT NULL REFERENCES books(id),
  chapter     INTEGER NOT NULL,
  verse       INTEGER NOT NULL,
  text        TEXT NOT NULL,
  tsv         tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', text)) STORED,
  UNIQUE (version_id, book_id, chapter, verse)
);

CREATE INDEX verses_ref_idx ON verses (book_id, chapter, verse);

-- Busca textual no nivel de versiculo: recall completo por palavra (ex.: "gloria",
-- "glorificado" - o stemming do portugues agrupa as variacoes da mesma raiz).
CREATE INDEX verses_tsv_idx ON verses USING gin (tsv);

-- ---------------------------------------------------------------------------
-- Camada de recuperacao: janelas de versiculos (a unidade que e embutida e
-- buscada). verse_start/verse_end permitem citar e expandir o contexto.
-- ---------------------------------------------------------------------------
CREATE TABLE chunks (
  id           BIGSERIAL PRIMARY KEY,
  version_id   INTEGER NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  book_id      INTEGER NOT NULL REFERENCES books(id),
  chapter      INTEGER NOT NULL,
  verse_start  INTEGER NOT NULL,
  verse_end    INTEGER NOT NULL,
  heading      TEXT,
  text         TEXT NOT NULL,
  embedding    halfvec(1024),
  tsv          tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', text)) STORED
);

-- Busca vetorial (cosseno) via HNSW: retorno em poucos ms mesmo no corpus todo.
CREATE INDEX chunks_embedding_idx ON chunks
  USING hnsw (embedding halfvec_cosine_ops);

-- Busca textual (full-text) via GIN.
CREATE INDEX chunks_tsv_idx ON chunks USING gin (tsv);

CREATE INDEX chunks_ref_idx ON chunks (version_id, book_id, chapter, verse_start);

-- ---------------------------------------------------------------------------
-- Lexico de Strong (H* hebraico, G* grego) e interlinear palavra-a-palavra.
-- Populados na fase 2 (grego/hebraico).
-- ---------------------------------------------------------------------------
CREATE TABLE strongs (
  code          TEXT PRIMARY KEY,              -- ex.: "H0430", "G0025"
  language      TEXT NOT NULL,                 -- "hbo" | "grc"
  lemma         TEXT,
  transliteration TEXT,
  gloss         TEXT,
  definition    TEXT
);

CREATE TABLE verse_words (
  id            BIGSERIAL PRIMARY KEY,
  verse_id      BIGINT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL,
  surface       TEXT NOT NULL,                 -- forma como aparece no texto
  strongs_code  TEXT REFERENCES strongs(code),
  morph         TEXT
);

CREATE INDEX verse_words_verse_idx ON verse_words (verse_id, position);
CREATE INDEX verse_words_strongs_idx ON verse_words (strongs_code);
