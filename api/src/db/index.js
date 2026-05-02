import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { dakinisSeed } from "./seed.js";

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../../..");

let dbInstance = null;

export function dakinisGetDb() {
  if (!dbInstance) {
    throw new Error("Base de datos no inicializada. Llama a dakinisInitDb() al arrancar el servidor.");
  }
  return dbInstance;
}

export function dakinisInitDb() {
  const dbPath = process.env.SQLITE_PATH || path.join(projectRoot, "data", "dakinis.db");
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");

  const schemaPath = path.join(__dirname, "schema.sql");
  dbInstance.exec(fs.readFileSync(schemaPath, "utf8"));
  dakinisMigrateUsersTotp(dbInstance);
  dakinisSeed(dbInstance);

  return dbInstance;
}
