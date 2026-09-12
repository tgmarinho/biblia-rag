// Gera embeddings para os chunks que ainda nao tem (embedding IS NULL).
// Requer OPENAI_API_KEY no .env. Idempotente: pode rodar de novo para completar.
//
// Uso: tsx scripts/embed.ts [tamanho-do-lote]
import { sql } from "../src/db.ts";
import { hasEmbeddings } from "../src/config.ts";
import { embedTexts, toVectorLiteral } from "../src/embeddings.ts";

const BATCH = Number(process.argv[2] ?? 300);

async function main(): Promise<void> {
  if (!hasEmbeddings) {
    console.error("OPENAI_API_KEY não configurada no .env. Abortando.");
    process.exit(1);
  }

  const [pending] = await sql<{ n: number }[]>`
    SELECT count(*)::int AS n FROM chunks WHERE embedding IS NULL`;
  const total = pending?.n ?? 0;
  if (total === 0) {
    console.log("Nada a fazer: todos os chunks já têm embedding.");
    await sql.end();
    return;
  }
  console.log(`Chunks a embutir: ${total} (lotes de ${BATCH})`);

  let done = 0;
  const started = performance.now();

  while (true) {
    const rows = await sql<{ id: number; text: string }[]>`
      SELECT id, text FROM chunks WHERE embedding IS NULL ORDER BY id LIMIT ${BATCH}`;
    if (rows.length === 0) break;

    const vectors = await embedTexts(rows.map((r) => r.text));

    // Atualiza cada chunk dentro de uma transacao (postgres.js faz pipelining).
    await sql.begin((tx) =>
      rows.map((r, i) =>
        tx`UPDATE chunks SET embedding = ${toVectorLiteral(vectors[i]!)}::halfvec WHERE id = ${r.id}`,
      ),
    );

    done += rows.length;
    const rate = done / ((performance.now() - started) / 1000);
    process.stdout.write(`\r  ${done}/${total} (${rate.toFixed(0)}/s)   `);
  }

  console.log(`\nConcluído em ${((performance.now() - started) / 1000).toFixed(1)}s.`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
