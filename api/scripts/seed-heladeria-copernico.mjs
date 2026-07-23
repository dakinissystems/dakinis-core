#!/usr/bin/env node
/**
 * Tenant Heladería Copérnico — plan pro (full) sin coste Stripe + menú cartas.
 *   cd platform/core/api && node scripts/seed-heladeria-copernico.mjs
 * Prod:
 *   railway run --service "Core Back" -- node scripts/seed-heladeria-copernico.mjs
 */
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dakinisInitPostgresPool } from "../src/db/postgres.js";
import { dakinisQueryOne, dakinisRun } from "../src/db/query.js";
import { dakinisResolveDbDriver } from "../src/db/dialect.js";
import {
  COPERNICO_HOUSE_TENANT,
  copernicoBuildConfigJson,
} from "../../../../docs/supabase/seeds/heladeria-copernico-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function dakinisUpsertPostgres() {
  await dakinisInitPostgresPool();
  const t = COPERNICO_HOUSE_TENANT;
  const passwordHash = bcrypt.hashSync(t.password, 10);
  const configJson = JSON.stringify(copernicoBuildConfigJson());
  // allergies_json must be an array of allergen rows (see dakinisMergeAllergenChecklist)
  const allergiesJson = JSON.stringify([]);

  const existing = await dakinisQueryOne(`SELECT id FROM business WHERE slug = ?`, [t.slug]);
  if (existing) {
    await dakinisRun(
      `UPDATE business SET name = ?, type = ?, plan = ?, config_json = ? WHERE slug = ?`,
      [t.name, t.type, t.plan, configJson, t.slug]
    );
    const biz = await dakinisQueryOne(`SELECT id FROM business WHERE slug = ?`, [t.slug]);
    const prof = await dakinisQueryOne(
      `SELECT business_id FROM tenant_restaurant_profile WHERE business_id = ?`,
      [biz.id]
    );
    if (prof) {
      await dakinisRun(
        `UPDATE tenant_restaurant_profile SET venue_name = ?, allergies_json = ?, updated_at = NOW() WHERE business_id = ?`,
        [t.venueName, allergiesJson, biz.id]
      );
    } else {
      await dakinisRun(
        `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json) VALUES (?, ?, ?, ?)`,
        [biz.id, t.publicToken, t.venueName, allergiesJson]
      );
    }
    const user = await dakinisQueryOne(`SELECT id FROM users WHERE email = ?`, [t.email]);
    if (user) {
      await dakinisRun(`UPDATE users SET password_hash = ?, role = 'admin', business_id = ? WHERE id = ?`, [
        passwordHash,
        biz.id,
        user.id,
      ]);
    } else {
      await dakinisRun(
        `INSERT INTO users (id, business_id, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`,
        [t.userId, biz.id, t.email, passwordHash]
      );
    }
    console.log(`[seed] Heladería Copérnico actualizada (${biz.id}) plan=${t.plan}`);
    console.log(`  login: ${t.email} / ${t.password}`);
    console.log(`  items: ${copernicoBuildConfigJson().menu.items.length}`);
    return;
  }

  await dakinisRun(
    `INSERT INTO business (id, slug, name, type, plan, config_json) VALUES (?, ?, ?, ?, ?, ?)`,
    [t.businessId, t.slug, t.name, t.type, t.plan, configJson]
  );
  await dakinisRun(
    `INSERT INTO users (id, business_id, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`,
    [t.userId, t.businessId, t.email, passwordHash]
  );
  await dakinisRun(
    `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json) VALUES (?, ?, ?, ?)`,
    [t.businessId, t.publicToken, t.venueName, allergiesJson]
  );
  console.log("[seed] Heladería Copérnico creada.");
  console.log(`  login: ${t.email} / ${t.password}`);
  console.log(`  slug: ${t.slug} · plan: ${t.plan} (full, sin Stripe)`);
  console.log(`  menu items: ${copernicoBuildConfigJson().menu.items.length}`);
  console.log(`  QR alérgenos: /alergenos/${t.publicToken}`);
}

async function main() {
  if (dakinisResolveDbDriver() !== "postgres") {
    throw new Error("Heladería Copérnico seed requiere DATABASE_URL postgres (Core Back)");
  }
  await dakinisUpsertPostgres();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
