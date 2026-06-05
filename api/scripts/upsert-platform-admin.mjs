#!/usr/bin/env node
/**
 * Crea o actualiza un administrador de plataforma (role platform_admin).
 *
 * No guardes la contraseña en el repo. Pásala por entorno:
 *
 *   cd platform/core/api
 *   set DAKINIS_ADMIN_EMAIL=christiandvillar@gmail.com
 *   set DAKINIS_ADMIN_PASSWORD=tu_clave_segura
 *   set DB_DRIVER=postgres
 *   set DATABASE_URL=postgresql://...
 *   set POSTGRES_SCHEMA=dakinis_core_prod
 *   node scripts/upsert-platform-admin.mjs
 *
 * SQLite local:
 *   set DB_DRIVER=sqlite
 *   node scripts/upsert-platform-admin.mjs
 */
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import fs from "node:fs";
import { dakinisInitPostgresPool } from "../src/db/postgres.js";
import { dakinisQueryOne, dakinisRun } from "../src/db/query.js";
import { dakinisResolveDbDriver } from "../src/db/dialect.js";
import { dakinisSqlInsertIgnore } from "../src/db/dialect.js";

const PLATFORM_BUSINESS = {
  id: "biz_platform_0001",
  slug: "dakinis-platform",
  name: "Dakinis (plataforma)",
  type: "platform",
  plan: "platform"
};

function dakinisReadCredentials() {
  const email = String(process.env.DAKINIS_ADMIN_EMAIL || process.argv[2] || "")
    .trim()
    .toLowerCase();
  const password = String(process.env.DAKINIS_ADMIN_PASSWORD || process.argv[3] || "").trim();
  if (!email || !email.includes("@")) {
    throw new Error("Indica DAKINIS_ADMIN_EMAIL (o primer argumento: email)");
  }
  if (!password || password.length < 8) {
    throw new Error("Indica DAKINIS_ADMIN_PASSWORD (o segundo argumento) — mínimo 8 caracteres");
  }
  return { email, password };
}

async function dakinisEnsurePlatformBusiness() {
  const row = await dakinisQueryOne("SELECT id FROM business WHERE slug = ? OR id = ?", [
    PLATFORM_BUSINESS.slug,
    PLATFORM_BUSINESS.id
  ]);
  if (row?.id) return row.id;

  const insert = dakinisSqlInsertIgnore("business", ["id", "slug", "name", "type", "plan", "config_json"]);
  await dakinisRun(insert, [
    PLATFORM_BUSINESS.id,
    PLATFORM_BUSINESS.slug,
    PLATFORM_BUSINESS.name,
    PLATFORM_BUSINESS.type,
    PLATFORM_BUSINESS.plan,
    null
  ]);
  return PLATFORM_BUSINESS.id;
}

async function dakinisUpsertPostgres(email, passwordHash, platformTotpSecret) {
  await dakinisInitPostgresPool();
  const businessId = await dakinisEnsurePlatformBusiness();

  const existing = await dakinisQueryOne("SELECT id, role FROM users WHERE lower(email) = lower(?)", [
    email
  ]);

  const totpEnabled = platformTotpSecret ? 1 : 0;

  if (existing) {
    await dakinisRun(
      `UPDATE users SET business_id = ?, password_hash = ?, role = 'platform_admin',
        totp_secret = COALESCE(?, totp_secret), totp_enabled = ?
       WHERE id = ?`,
      [businessId, passwordHash, platformTotpSecret, totpEnabled, existing.id]
    );
    console.log(`[platform-admin] Usuario actualizado: ${email} (id=${existing.id}, role=platform_admin)`);
    return existing.id;
  }

  const userId = `usr_platform_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  await dakinisRun(
    `INSERT INTO users (id, business_id, email, password_hash, role, totp_secret, totp_enabled)
     VALUES (?, ?, ?, ?, 'platform_admin', ?, ?)`,
    [userId, businessId, email, passwordHash, platformTotpSecret, totpEnabled]
  );
  console.log(`[platform-admin] Usuario creado: ${email} (id=${userId}, role=platform_admin)`);
  return userId;
}

function dakinisUpsertSqlite(email, passwordHash, platformTotpSecret) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, "../..");
  const dbPath = process.env.SQLITE_PATH || path.join(projectRoot, "data", "dakinis.db");
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const schemaPath = path.join(projectRoot, "api/src/db/schema.sql");
  const db = new Database(dbPath);
  db.exec(fs.readFileSync(schemaPath, "utf8"));

  const biz = db
    .prepare("SELECT id FROM business WHERE slug = ? OR id = ?")
    .get(PLATFORM_BUSINESS.slug, PLATFORM_BUSINESS.id);
  let businessId = biz?.id;
  if (!businessId) {
    db.prepare(
      `INSERT INTO business (id, slug, name, type, plan, config_json) VALUES (?, ?, ?, ?, ?, NULL)`
    ).run(
      PLATFORM_BUSINESS.id,
      PLATFORM_BUSINESS.slug,
      PLATFORM_BUSINESS.name,
      PLATFORM_BUSINESS.type,
      PLATFORM_BUSINESS.plan
    );
    businessId = PLATFORM_BUSINESS.id;
  }

  const existing = db.prepare("SELECT id FROM users WHERE lower(email) = lower(?)").get(email);
  const totpEnabled = platformTotpSecret ? 1 : 0;

  if (existing) {
    db.prepare(
      `UPDATE users SET business_id = ?, password_hash = ?, role = 'platform_admin',
        totp_secret = COALESCE(?, totp_secret), totp_enabled = ?
       WHERE id = ?`
    ).run(businessId, passwordHash, platformTotpSecret, totpEnabled, existing.id);
    console.log(`[platform-admin] Usuario actualizado: ${email} (id=${existing.id})`);
  } else {
    const userId = `usr_platform_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    db.prepare(
      `INSERT INTO users (id, business_id, email, password_hash, role, totp_secret, totp_enabled)
       VALUES (?, ?, ?, ?, 'platform_admin', ?, ?)`
    ).run(userId, businessId, email, passwordHash, platformTotpSecret, totpEnabled);
    console.log(`[platform-admin] Usuario creado: ${email} (id=${userId})`);
  }

  db.close();
  console.log(`[platform-admin] Base SQLite: ${dbPath}`);
}

async function main() {
  const { email, password } = dakinisReadCredentials();
  const passwordHash = bcrypt.hashSync(password, 10);
  const platformTotpSecret = process.env.DAKINIS_PLATFORM_TOTP_SECRET?.trim() || null;

  if (platformTotpSecret) {
    console.log("[platform-admin] TOTP habilitado (DAKINIS_PLATFORM_TOTP_SECRET definido en servidor)");
  }

  const driver = dakinisResolveDbDriver();
  if (driver === "postgres") {
    await dakinisUpsertPostgres(email, passwordHash, platformTotpSecret);
  } else {
    dakinisUpsertSqlite(email, passwordHash, platformTotpSecret);
  }

  console.log("[platform-admin] Listo. Inicia sesión en Core → Panel plataforma (/admin).");
  if (platformTotpSecret) {
    console.log("[platform-admin] El login pedirá también el código TOTP de tu app autenticadora.");
  }
}

main().catch((err) => {
  console.error("[platform-admin] Error:", err.message || err);
  process.exit(1);
});
