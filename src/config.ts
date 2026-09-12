// Carrega e valida a configuracao a partir do ambiente.
// Usa o carregador nativo de .env do Node (--env-file) quando disponivel; como
// fallback simples, le o .env manualmente para os scripts via tsx.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv(): void {
  if (process.env.DATABASE_URL) return; // ja carregado pelo ambiente
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // sem .env: seguimos so com o ambiente
  }
}

loadDotEnv();

export const config = {
  databaseUrl:
    process.env.DATABASE_URL ?? "postgres://biblia:biblia@localhost:5434/biblia",
  openaiApiKey: process.env.OPENAI_API_KEY,
  embeddingModel: process.env.EMBEDDING_MODEL ?? "text-embedding-3-large",
  embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? 1024),
  groqApiKey: process.env.GROQ_API_KEY,
  llmModel: process.env.LLM_MODEL ?? "llama-3.3-70b-versatile",
  port: Number(process.env.PORT ?? 3000),
} as const;

export const hasEmbeddings = Boolean(config.openaiApiKey);
export const hasLlm = Boolean(config.groqApiKey);
