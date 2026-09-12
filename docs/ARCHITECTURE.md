# Arquitetura

## Objetivo

Busca semântica rápida e RAG sobre a Bíblia (português + grego + hebraico), priorizando baixa latência na busca e na resposta ao usuário.

## Decisões

- **Banco:** Postgres 16 + pgvector (Docker).
  Metadados, texto, full-text e vetores no mesmo lugar, consultáveis por SQL.
- **Embeddings:** OpenAI `text-embedding-3-large` reduzido a 1024 dimensões (Matryoshka), armazenado em `halfvec(1024)`.
  Metade da memória do float32 e distância mais rápida, com qualidade quase idêntica.
  Custo de embutir todo o corpus: menos de US$ 1, uma vez.
- **Busca híbrida:** a parte vetorial (HNSW, cosseno) roda em paralelo com a parte lexical (Postgres FTS, GIN, config `portuguese`).
  A FTS não precisa de embedding, então buscas por palavra ou referência são instantâneas.
  As duas listas se fundem por RRF (Reciprocal Rank Fusion) numa única query SQL.
- **Rerank:** cross-encoder opcional, desligado no caminho quente por custar latência.
  Ligável quando precisão importa mais que velocidade.
- **LLM (modo RAG):** Groq (inferência mais rápida, plano free) com streaming.
  Provider plugável.
- **Stack:** TypeScript, `postgres.js`, Hono (API), Vercel AI SDK (`ai` + `@ai-sdk/openai` + `@ai-sdk/groq`).

## Granularidade do corpus

- `verses`: um versículo por linha (camada atômica, citação exata, link com o original).
- `chunks`: janelas de 3 a 7 versículos (unidade embutida e buscada), com `verse_start`/`verse_end`.

## Fases

1. **v1 (busca + RAG em PT):** carregar 1-2 versões PT, embutir, expor `search` e `ask`.
2. **v2 (originais):** grego (SBLGNT / STEPBible) e hebraico (STEPBible TAHOT), linkados por referência.
3. **v3 (interlinear):** `verse_words` + `strongs` para navegação palavra-a-palavra.

## Fluxo de uma pergunta

1. Embute a pergunta (API) em paralelo com a busca lexical (FTS, sem embedding).
2. Funde os candidatos por RRF numa única query SQL (top-k).
3. (Opcional) rerank cross-encoder.
4. (Modo `ask`) Groq sintetiza a resposta em streaming, sempre citando livro capítulo:versículo.
