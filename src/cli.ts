// CLI de busca lexical.
//
// Uso:
//   tsx src/cli.ts <termo> [termo2 ...] [--version ACF] [--limit N]
// Exemplos:
//   tsx src/cli.ts glória glorificado glorificar glorioso
//   tsx src/cli.ts amor --version ACF
//
// Retorna TODAS as referencias que contem qualquer um dos termos (OR),
// com o texto, em ordem canonica.
import { sql } from "./db.ts";
import { searchVersesLexical } from "./search.ts";

function parseArgs(argv: string[]): { terms: string[]; versionCode?: string; limit?: number } {
  const terms: string[] = [];
  let versionCode: string | undefined;
  let limit: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--version" || a === "-v") {
      versionCode = argv[++i];
    } else if (a === "--limit" || a === "-l") {
      limit = Number(argv[++i]);
    } else {
      terms.push(a);
    }
  }
  return { terms, versionCode, limit };
}

async function main(): Promise<void> {
  const { terms, versionCode, limit } = parseArgs(process.argv.slice(2));
  if (terms.length === 0) {
    console.error("Uso: tsx src/cli.ts <termo> [termo2 ...] [--version ACF] [--limit N]");
    process.exit(1);
  }

  const started = performance.now();
  const hits = await searchVersesLexical({ terms, versionCode, limit });
  const ms = (performance.now() - started).toFixed(1);

  for (const h of hits) {
    console.log(`${h.ref}  ${h.text}`);
  }
  console.log(
    `\n${hits.length} referência(s) para [${terms.join(", ")}]` +
      `${versionCode ? ` em ${versionCode.toUpperCase()}` : ""} (${ms} ms)`,
  );
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
