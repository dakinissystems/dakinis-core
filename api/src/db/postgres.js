import pg from "pg";
import { dakinisResolveDbDriver, dakinisToPostgresPlaceholders } from "./dialect.js";
import { dakinisPostgresSchema } from "./schema-config.js";
import { dakinisBuildPgPoolConfig, dakinisIsSupabasePoolerUrl } from "./postgres-connection.js";
import { dakinisValidateDatabaseUrl, dakinisMaskDatabaseUrl } from "./validate-database-url.js";

const { Pool } = pg;

/** @type {import("pg").Pool | null} */
let pgPool = null;

async function dakinisEnsureUserCredentialColumns(schema) {
  const q = (sql) => pgPool.query(sql);
  await q(
    `ALTER TABLE ${schema}.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false`
  );
  await q(`ALTER TABLE ${schema}.users ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT`);
  await q(`ALTER TABLE ${schema}.users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ`);
  await q(`ALTER TABLE ${schema}.users ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ`);
}

export function dakinisGetPgPool() {
  if (!pgPool) {
    throw new Error("PostgreSQL no inicializado. Llama a dakinisInitPostgresPool() primero.");
  }
  return pgPool;
}

export async function dakinisInitPostgresPool() {
  const connectionString = String(process.env.DATABASE_URL || "").trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL requerido para DB_DRIVER=postgres");
  }

  const validation = dakinisValidateDatabaseUrl(connectionString);
  if (!validation.ok) {
    throw new Error(`DATABASE_URL inválida: ${validation.errors.join("; ")}`);
  }
  for (const w of validation.warnings) {
    console.warn("[db]", w);
  }

  const schema = dakinisPostgresSchema();
  pgPool = new Pool(dakinisBuildPgPoolConfig(connectionString, schema));
  pgPool.on("connect", (client) => {
    client.query(`SET search_path TO ${schema}, public`).catch(() => {});
  });
  await pgPool.query("SELECT 1");
  await dakinisEnsureUserCredentialColumns(schema);
  const businessCheck = await pgPool.query("SELECT to_regclass($1::text) AS reg", [
    `${schema}.business`
  ]);
  const hasBusiness = Boolean(businessCheck.rows[0]?.reg);
  if (!hasBusiness) {
    console.error(
      `[db] Tabla ${schema}.business no existe. Ejecuta docs/supabase/schemas/02-dakinis-core-prod.sql en Supabase y POSTGRES_SCHEMA=${schema} en Railway.`
    );
  }
  console.info(
    `[db] PostgreSQL connected schema=${schema} pooler=${dakinisIsSupabasePoolerUrl(connectionString)} businessTable=${hasBusiness ? "ok" : "MISSING"}`
  );
  return pgPool;
}

/**
 * @param {string} sql
 * @param {unknown[]} [params]
 */
export async function dakinisPgQueryOne(sql, params = []) {
  const res = await dakinisGetPgPool().query(dakinisToPostgresPlaceholders(sql), params);
  return res.rows[0] ?? undefined;
}

/**
 * @param {string} sql
 * @param {unknown[]} [params]
 */
export async function dakinisPgQueryAll(sql, params = []) {
  const res = await dakinisGetPgPool().query(dakinisToPostgresPlaceholders(sql), params);
  return res.rows;
}

/**
 * @param {string} sql
 * @param {unknown[]} [params]
 */
export async function dakinisPgRun(sql, params = []) {
  const res = await dakinisGetPgPool().query(dakinisToPostgresPlaceholders(sql), params);
  return { changes: res.rowCount ?? 0 };
}

/**
 * @param {string} sql
 */
export async function dakinisPgExec(sql) {
  await dakinisGetPgPool().query(sql);
}

/**
 * @param {(tx: { queryOne: typeof dakinisPgQueryOne, queryAll: typeof dakinisPgQueryAll, run: typeof dakinisPgRun }) => Promise<unknown>} fn
 */
export async function dakinisPgTransaction(fn) {
  const client = await dakinisGetPgPool().connect();
  try {
    await client.query("BEGIN");
    await client.query(`SET search_path TO ${dakinisPostgresSchema()}, public`);
    const tx = {
      queryOne: async (sql, params = []) => {
        const res = await client.query(dakinisToPostgresPlaceholders(sql), params);
        return res.rows[0] ?? undefined;
      },
      queryAll: async (sql, params = []) => {
        const res = await client.query(dakinisToPostgresPlaceholders(sql), params);
        return res.rows;
      },
      run: async (sql, params = []) => {
        const res = await client.query(dakinisToPostgresPlaceholders(sql), params);
        return { changes: res.rowCount ?? 0 };
      }
    };
    const result = await fn(tx);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function dakinisIsPostgresDriver() {
  return dakinisResolveDbDriver() === "postgres";
}
