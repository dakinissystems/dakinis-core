import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { dakinisResolveDbDriver } from "./dialect.js";
import { dakinisShouldSeedDemo } from "./schema-config.js";
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

function dakinisMigrateAiUsage(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      user_id TEXT,
      usage_type TEXT NOT NULL DEFAULT 'advisor',
      year_month TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES business(id)
    );
    CREATE INDEX IF NOT EXISTS idx_ai_usage_business_month ON ai_usage(business_id, usage_type, year_month);
  `);
}

/** Demo restaurante → Pro para probar Copilot IA en dev. */
function dakinisMigrateDemoProPlan(db) {
  db.prepare(`UPDATE business SET plan = 'pro' WHERE slug = 'restaurante-demo' AND plan != 'pro'`).run();
}

function dakinisMigrateHospitalityTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenant_menu_categories (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (business_id) REFERENCES business(id)
    );
    CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON tenant_menu_categories(business_id);

    CREATE TABLE IF NOT EXISTS tenant_menu_items (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      category_id TEXT,
      name TEXT NOT NULL,
      name_es TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      station TEXT,
      meta_json TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (business_id) REFERENCES business(id),
      FOREIGN KEY (category_id) REFERENCES tenant_menu_categories(id)
    );
    CREATE INDEX IF NOT EXISTS idx_menu_items_business ON tenant_menu_items(business_id);

    CREATE TABLE IF NOT EXISTS tenant_menu_prices (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'salon',
      price_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'EUR',
      UNIQUE (business_id, item_id, channel),
      FOREIGN KEY (business_id) REFERENCES business(id),
      FOREIGN KEY (item_id) REFERENCES tenant_menu_items(id)
    );
    CREATE INDEX IF NOT EXISTS idx_menu_prices_business ON tenant_menu_prices(business_id);

    CREATE TABLE IF NOT EXISTS tenant_menu_modifiers (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0,
      allergen_tags_json TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (business_id) REFERENCES business(id)
    );
    CREATE INDEX IF NOT EXISTS idx_menu_modifiers_business ON tenant_menu_modifiers(business_id);

    CREATE TABLE IF NOT EXISTS tenant_menu_item_modifiers (
      item_id TEXT NOT NULL,
      modifier_id TEXT NOT NULL,
      required INTEGER NOT NULL DEFAULT 0,
      max_qty INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (item_id, modifier_id),
      FOREIGN KEY (item_id) REFERENCES tenant_menu_items(id),
      FOREIGN KEY (modifier_id) REFERENCES tenant_menu_modifiers(id)
    );

    CREATE TABLE IF NOT EXISTS tenant_tables (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      zone TEXT NOT NULL DEFAULT '',
      label TEXT NOT NULL,
      x REAL NOT NULL DEFAULT 0,
      y REAL NOT NULL DEFAULT 0,
      seats INTEGER NOT NULL DEFAULT 2,
      status TEXT NOT NULL DEFAULT 'libre',
      meta_json TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (business_id) REFERENCES business(id)
    );
    CREATE INDEX IF NOT EXISTS idx_tables_business ON tenant_tables(business_id);

    CREATE TABLE IF NOT EXISTS tenant_table_sessions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      opened_at TEXT NOT NULL DEFAULT (datetime('now')),
      closed_at TEXT,
      cart_json TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      waiter_user_id TEXT,
      FOREIGN KEY (business_id) REFERENCES business(id),
      FOREIGN KEY (table_id) REFERENCES tenant_tables(id)
    );
    CREATE INDEX IF NOT EXISTS idx_table_sessions_business ON tenant_table_sessions(business_id);
    CREATE INDEX IF NOT EXISTS idx_table_sessions_open ON tenant_table_sessions(business_id, table_id, closed_at);

    CREATE TABLE IF NOT EXISTS tenant_price_lists (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      key TEXT NOT NULL,
      name TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT '',
      is_default INTEGER NOT NULL DEFAULT 0,
      markup_pct REAL,
      markup_fixed_cents INTEGER,
      round_to_cents INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      UNIQUE (business_id, key),
      FOREIGN KEY (business_id) REFERENCES business(id)
    );
    CREATE INDEX IF NOT EXISTS idx_price_lists_business ON tenant_price_lists(business_id);

    CREATE TABLE IF NOT EXISTS tenant_price_list_items (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      price_list_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'EUR',
      UNIQUE (price_list_id, item_id),
      FOREIGN KEY (business_id) REFERENCES business(id),
      FOREIGN KEY (price_list_id) REFERENCES tenant_price_lists(id),
      FOREIGN KEY (item_id) REFERENCES tenant_menu_items(id)
    );
    CREATE INDEX IF NOT EXISTS idx_price_list_items_business ON tenant_price_list_items(business_id);

    CREATE TABLE IF NOT EXISTS tenant_delivery_integrations (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      api_key TEXT,
      refresh_token TEXT,
      store_id TEXT,
      location TEXT,
      webhook_secret TEXT,
      status TEXT NOT NULL DEFAULT 'disconnected',
      last_sync_at TEXT,
      last_error TEXT,
      meta_json TEXT NOT NULL DEFAULT '{}',
      UNIQUE (business_id, provider),
      FOREIGN KEY (business_id) REFERENCES business(id)
    );
    CREATE INDEX IF NOT EXISTS idx_delivery_integrations_business ON tenant_delivery_integrations(business_id);

    CREATE TABLE IF NOT EXISTS tenant_delivery_jobs (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      job_type TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES business(id)
    );
    CREATE INDEX IF NOT EXISTS idx_delivery_jobs_business ON tenant_delivery_jobs(business_id, status);
  `);
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
  dakinisMigrateAiUsage(db);
  dakinisMigrateHospitalityTables(db);
  dakinisMigrateDemoProPlan(db);
  dakinisSeed(db);
  dakinisEnsureAllRestaurantProfiles(db);

  dakinisSetSqliteDb(db);
  return db;
}

async function dakinisInitPostgres() {
  await dakinisInitPostgresPool();
  if (dakinisShouldSeedDemo()) {
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
