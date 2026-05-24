import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { dakinisResolveDbDriver } from "./dialect.js";
import { dakinisInitPostgresPool } from "./postgres.js";
import { dakinisSetSqliteDb } from "./query.js";
import { dakinisSeed } from "./seed.js";
import { dakinisSeedMinimalPostgres } from "./seed-minimal.js";
import { dakinisEnsureAllRestaurantProfiles, dakinisEnsureAllRestaurantProfilesAsync } from "./restaurant-kitchen-seed.js";

function dakinisMigrateUsersTotp(db) {
  const cols = db.prepare("PRAGMA table_info(users)").all();
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("totp_secret")) {
    db.exec("ALTER TABLE users ADD COLUMN totp_secret TEXT");
  }
  if (!names.has("totp_enabled")) {
    db.exec("ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0");
  }
}

function dakinisMigratePlatformUserId(db) {
  const cols = db.prepare("PRAGMA table_info(users)").all();
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("platform_user_id")) {
    db.exec("ALTER TABLE users ADD COLUMN platform_user_id TEXT");
    db.exec(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_platform_user_id ON users(platform_user_id)"
    );
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");

function dakinisInitSqlite() {
  const dbPath = process.env.SQLITE_PATH || path.join(projectRoot, "data", "dakinis.db");
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const schemaPath = path.join(__dirname, "schema.sql");
  db.exec(fs.readFileSync(schemaPath, "utf8"));
  dakinisMigrateUsersTotp(db);
  dakinisMigratePlatformUserId(db);
  dakinisSeed(db);
  dakinisEnsureAllRestaurantProfiles(db);

  dakinisSetSqliteDb(db);
  return db;
}

async function dakinisInitPostgres() {
  await dakinisInitPostgresPool();
  const seedDemo = String(process.env.CORE_SEED_DEMO ?? "true").toLowerCase() !== "false";
  if (seedDemo) {
    await dakinisSeedMinimalPostgres();
    await dakinisEnsureAllRestaurantProfilesAsync();
  }
}

/** @returns {Promise<"sqlite"|"postgres">} */
export async function dakinisInitDb() {
  const driver = dakinisResolveDbDriver();
  if (driver === "postgres") {
    await dakinisInitPostgres();
    return "postgres";
  }
  dakinisInitSqlite();
  return "sqlite";
}

export function dakinisGetDbDriver() {
  return dakinisResolveDbDriver();
}

export { dakinisGetDb, dakinisQueryOne, dakinisQueryAll, dakinisRun, dakinisExec, dakinisWithTransaction } from "./query.js";
