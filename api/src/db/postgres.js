import pg from "pg";
import { dakinisResolveDbDriver, dakinisToPostgresPlaceholders } from "./dialect.js";

const { Pool } = pg;

/** @type {import("pg").Pool | null} */
let pgPool = null;

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
  pgPool = new Pool({ connectionString, max: 20 });
  pgPool.on("connect", (client) => {
    client.query("SET search_path TO dakinis_core, public").catch(() => {});
  });
  await pgPool.query("SELECT 1");
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
    await client.query("SET search_path TO dakinis_core, public");
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
