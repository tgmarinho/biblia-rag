# biblia-rag

Busca semântica poderosa e RAG sobre a Bíblia, em português, grego e hebraico.

O objetivo é permitir pesquisas rápidas (retorno instantâneo de versículos rankeados) e respostas em linguagem natural fundamentadas nas Escrituras, sempre com citação precisa de capítulo e versículo, e com link para o texto original (grego/hebraico) via referência e números de Strong.

## Visão geral da arquitetura

- **Armazenamento:** Postgres 16 + [pgvector](https://github.com/pgvector/pgvector) (via Docker), guardando metadados, texto, índice de full-text e embeddings no mesmo banco.
- **Embeddings:** [BGE-M3](https://huggingface.co/BAAI/bge-m3) (1024 dimensões), multilíngue, cobrindo português, grego e hebraico.
- **Busca híbrida:** vetorial (pgvector) combinada com textual (full-text search em português), fundidas por RRF (Reciprocal Rank Fusion).
- **Reranking:** cross-encoder [bge-reranker-v2-m3](https://huggingface.co/BAAI/bge-reranker-v2-m3) refina os melhores candidatos.
- **LLM (RAG):** provider plugável (Groq, Claude, OpenAI) para sintetizar respostas citando os versículos recuperados.
- **API:** dois modos - `search` (rápido, sem LLM) e `ask` (RAG completo).

## Estrutura do corpus

A Bíblia já vem estruturada em versículos, então adotamos granularidade múltipla:

- **Camada atômica (`verses`):** um versículo por linha, para citação exata e link com o original.
- **Camada de recuperação (`chunks`):** janelas de 3 a 7 versículos (ou por perícope) que são efetivamente embutidas e buscadas, preservando `verse_start`/`verse_end` para citar e expandir contexto.

## Fontes de dados

- Traduções em português: repositórios abertos (Almeida e variantes).
- Grego e hebraico + números de Strong + morfologia: [STEPBible-Data](https://github.com/STEPBible/STEPBible-Data) (Tyndale House, CC BY 4.0).

Atenção: algumas traduções em português têm direitos autorais e são de uso pessoal; não redistribua os textos protegidos.

## Status

Em construção. Consulte os arquivos de arquitetura e o `docker-compose` conforme forem adicionados.
