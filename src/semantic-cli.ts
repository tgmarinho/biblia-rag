// CLI de busca semantica / hibrida.
//
// Uso:
//   tsx src/semantic-cli.ts "atributos de Deus" [--modo hibrida|semantica] [--version ACF] [--limit N]
// Exemplos:
//   tsx src/semantic-cli.ts "atributos de Deus"
//   tsx src/semantic-cli.ts "o amor de Deus pelos perdidos" --modo semantica --limit 15
//
// Requer OPENAI_API_KEY no .env e chunks ja embutidos (rode: pnpm embed).
import { sql } from "./db.ts";
import { hasEmbeddings } from "./config.ts";
import { searchHybrid, searchSemantic, type ChunkHit } from "./search.ts";

interface Args {
  query: string;
  modo: "hibrida" | "semantica";
  versionCode?: string;
  limit?: number;
}

function parseArgs(argv: string[]): Args {
  const parts: string[] = [];
  let modo: "hibrida" | "semantica" = "hibrida";
  let versionCode: string | undefined;
  let limit: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--modo" || a === "-m") modo = argv[++i] === "semantica" ? "semantica" : "hibrida";
    else if (a === "--version" || a === "-v") versionCode = argv[++i];
    else if (a === "--limit" || a === "-l") limit = Number(argv[++i]);
    else parts.push(a);
  }
  return { query: parts.join(" "), modo, versionCode, limit };
}

async function main(): Promise<void> {
  const { query, modo, versionCode, limit } = parseArgs(process.argv.slice(2));
  if (!query) {
    console.error('Uso: tsx src/semantic-cli.ts "<pergunta>" [--modo hibrida|semantica] [--version ACF] [--limit N]');
    process.exit(1);
  }
  if (!hasEmbeddings) {
    console.error("OPENAI_API_KEY não configurada no .env. A busca semântica precisa dela.");
    process.exit(1);
  }

  const started = performance.now();
  const hits: ChunkHit[] =
    modo === "semantica"
      ? await searchSemantic({ query, versionCode, limit })
      : await searchHybrid({ query, versionCode, limit });
  const ms = (performance.now() - started).toFixed(0);

  for (const h of hits) {
    console.log(`[${h.score.toFixed(3)}] ${h.ref}  ${h.text}`);
  }
  console.log(`\n${hits.length} passagem(ns) para "${query}" (modo ${modo}, ${ms} ms)`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
