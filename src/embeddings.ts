// Geracao de embeddings via OpenAI (text-embedding-3-large a 1024 dims).
// Usado tanto na ingestao (embutir chunks) quanto na busca (embutir a pergunta).
import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { config } from "./config.ts";

const model = openai.embedding(config.embeddingModel, {
  dimensions: config.embeddingDimensions,
});

/** Embute varios textos (documentos). O AI SDK cuida do batching interno. */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model, values: texts });
  return embeddings;
}

/** Embute uma unica consulta (pergunta do usuario). */
export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({ model, value: text });
  return embedding;
}

/** Formata um vetor no literal aceito pelo pgvector (ex.: "[0.1,0.2,...]"). */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}
