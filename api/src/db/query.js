import {
  dakinisPgExec,
  dakinisPgQueryAll,
  dakinisPgQueryOne,
  dakinisPgRun,
  dakinisPgTransaction,
  dakinisIsPostgresDriver
} from "./postgres.js";

/** @type {import("better-sqlite3").Database | null} */
let sqliteDb = null;

export function dakinisGetSqliteDb() {
  if (!sqliteDb) {
    throw new Error("SQLite no inicializado.");
  }
  return sqliteDb;
}

export function dakinisSetSqliteDb(db) {
  sqliteDb = db;
}

/**
 * @param {string} sql
 * @param {unknown[]} [params]
 */
export async function dakinisQueryOne(sql, params = []) {
  if (dakinisIsPostgresDriver()) {
    return dakinisPgQueryOne(sql, params);
  }
  return dakinisGetSqliteDb().prepare(sql).get(...params);
}

/**
 * @param {string} sql
 * @param {unknown[]} [params]
 */
export async function dakinisQueryAll(sql, params = []) {
  if (dakinisIsPostgresDriver()) {
    return dakinisPgQueryAll(sql, params);
  }
  return dakinisGetSqliteDb().prepare(sql).all(...params);
}

/**
 * @param {string} sql
 * @param {unknown[]} [params]
 */
export async function dakinisRun(sql, params = []) {
  if (dakinisIsPostgresDriver()) {
    return dakinisPgRun(sql, params);
  }
  return dakinisGetSqliteDb().prepare(sql).run(...params);
}

/**
 * @param {string} sql
 */
export async function dakinisExec(sql) {
  if (dakinisIsPostgresDriver()) {
    return dakinisPgExec(sql);
  }
  dakinisGetSqliteDb().exec(sql);
}

/**
 * @param {(db: import("better-sqlite3").Database | { queryOne: typeof dakinisQueryOne, queryAll: typeof dakinisQueryAll, run: typeof dakinisRun }) => Promise<unknown> | unknown} fn
 */
export async function dakinisWithTransaction(fn) {
  if (dakinisIsPostgresDriver()) {
    return dakinisPgTransaction(fn);
  }
  const db = dakinisGetSqliteDb();
  const wrapped = db.transaction(() => fn(db));
  return wrapped();
}

/** @deprecated Usa dakinisQueryOne/All/Run — solo para init SQLite legacy. */
export function dakinisGetDb() {
  return dakinisGetSqliteDb();
}
