// Conexao unica com o Postgres via postgres.js (driver mais rapido do Node).
import postgres from "postgres";
import { config } from "./config.ts";

export const sql = postgres(config.databaseUrl, {
  max: 10,
  prepare: true,
});

export type Sql = typeof sql;
