#!/usr/bin/env node
/**
 * Tenant Fermina Food — comida argentina, comandas, stock.
 *   cd platform/core/api && node scripts/seed-fermina-food.mjs
 */
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DAKINIS_RESTAURANT_FULL_CATALOG,
  dakinisSerializeAllergenProfile
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import {
  DAKINIS_FERMINA_DEFAULT_RECIPES,
  DAKINIS_FERMINA_DISH_ALLERGEN_ROWS
} from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { dakinisInitPostgresPool } from "../src/db/postgres.js";
import { dakinisQueryOne, dakinisRun } from "../src/db/query.js";
import { dakinisResolveDbDriver } from "../src/db/dialect.js";
import Database from "better-sqlite3";
import fs from "node:fs";
import {
  FERMINA_HOUSE_TENANT,
  FERMINA_STOCK_ITEMS,
  ferminaBuildAllergenProfile,
  ferminaBuildConfigJson
} from "../../../../docs/supabase/seeds/fermina-food-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function dakinisBuildAllergiesJson() {
  const present = ferminaBuildAllergenProfile();
  const byId = new Map(present.map((p) => [p.catalogId, p]));
  const checklist = DAKINIS_RESTAURANT_FULL_CATALOG.map((c) => {
    const hit = byId.get(c.id);
    return hit
      ? { ...hit, present: true }
      : {
          catalogId: c.id,
          name: c.name,
          category: c.category,
          present: false,
          severity: "info",
          notes: ""
        };
  });
  return dakinisSerializeAllergenProfile(checklist, DAKINIS_FERMINA_DISH_ALLERGEN_ROWS);
}

async function dakinisUpsertFerminaRecipes(businessId, run) {
  await run(`DELETE FROM tenant_recipes WHERE business_id = ?`, [businessId]);
  for (const recipe of DAKINIS_FERMINA_DEFAULT_RECIPES) {
    const id = `rcp_${recipe.slug}_${businessId.slice(-8)}`;
    await run(
      `INSERT INTO tenant_recipes (id, business_id, slug, name, output_label, output_quantity, output_unit, lines_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        businessId,
        recipe.slug,
        recipe.name,
        recipe.outputLabel,
        recipe.outputQuantity,
        recipe.outputUnit,
        JSON.stringify(recipe.lines)
      ]
    );
  }
}

async function dakinisUpsertPostgres() {
  await dakinisInitPostgresPool();
  const t = FERMINA_HOUSE_TENANT;
  const passwordHash = bcrypt.hashSync(t.password, 10);
  const configJson = JSON.stringify(ferminaBuildConfigJson());
  const allergiesJson = JSON.stringify(dakinisBuildAllergiesJson());

  const existing = await dakinisQueryOne(`SELECT id FROM business WHERE slug = ?`, [t.slug]);
  if (existing) {
    await dakinisRun(
      `UPDATE business SET name = ?, type = ?, plan = ?, config_json = ? WHERE slug = ?`,
      [t.name, t.type, t.plan, configJson, t.slug]
    );
    const biz = await dakinisQueryOne(`SELECT id FROM business WHERE slug = ?`, [t.slug]);
    await dakinisRun(
      `UPDATE tenant_restaurant_profile SET venue_name = ?, allergies_json = ?, updated_at = NOW() WHERE business_id = ?`,
      [t.venueName, allergiesJson, biz.id]
    );
    await dakinisUpsertFerminaRecipes(biz.id, dakinisRun);
    console.log(`[seed] Fermina actualizada (${biz.id})`);
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

  for (const item of FERMINA_STOCK_ITEMS) {
    const id = `stk_${item.slug}_${t.businessId.slice(-8)}`;
    await dakinisRun(
      `INSERT INTO tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (business_id, slug) DO UPDATE SET name = EXCLUDED.name, quantity = EXCLUDED.quantity`,
      [id, t.businessId, item.slug, item.name, item.unit, item.quantity, item.minQuantity]
    );
  }

  await dakinisUpsertFerminaRecipes(t.businessId, dakinisRun);
  console.log("[seed] Fermina Food creada.");
  console.log(`  login: ${t.email} / ${t.password}`);
  console.log(`  panel: /sistema/restaurante (slug ${t.slug})`);
  console.log(`  QR: /alergenos/${t.publicToken}`);
}

function dakinisUpsertSqlite() {
  const apiRoot = path.resolve(__dirname, "..");
  const dbPath = process.env.SQLITE_PATH || path.join(apiRoot, "data", "dakinis.db");
  if (!fs.existsSync(dbPath)) throw new Error(`SQLite no encontrado: ${dbPath}`);
  const db = new Database(dbPath);
  const t = FERMINA_HOUSE_TENANT;
  const passwordHash = bcrypt.hashSync(t.password, 10);
  const configJson = JSON.stringify(ferminaBuildConfigJson());
  const allergiesJson = JSON.stringify(dakinisBuildAllergiesJson());

  db.prepare(
    `INSERT OR REPLACE INTO business (id, slug, name, type, plan, config_json) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(t.businessId, t.slug, t.name, t.type, t.plan, configJson);
  db.prepare(
    `INSERT OR REPLACE INTO users (id, business_id, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`
  ).run(t.userId, t.businessId, t.email, passwordHash);

  const prof = db.prepare(`SELECT business_id FROM tenant_restaurant_profile WHERE business_id = ?`).get(t.businessId);
  if (prof) {
    db.prepare(
      `UPDATE tenant_restaurant_profile SET venue_name = ?, allergies_json = ?, updated_at = datetime('now') WHERE business_id = ?`
    ).run(t.venueName, allergiesJson, t.businessId);
  } else {
    db.prepare(
      `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json) VALUES (?, ?, ?, ?)`
    ).run(t.businessId, t.publicToken, t.venueName, allergiesJson);
  }

  for (const item of FERMINA_STOCK_ITEMS) {
    const id = `stk_${item.slug}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const hit = db
      .prepare(`SELECT id FROM tenant_stock_items WHERE business_id = ? AND slug = ?`)
      .get(t.businessId, item.slug);
    if (hit) {
      db.prepare(`UPDATE tenant_stock_items SET quantity = ?, name = ? WHERE id = ?`).run(
        item.quantity,
        item.name,
        hit.id
      );
    } else {
      db.prepare(
        `INSERT INTO tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(id, t.businessId, item.slug, item.name, item.unit, item.quantity, item.minQuantity);
    }
  }

  db.prepare(`DELETE FROM tenant_recipes WHERE business_id = ?`).run(t.businessId);
  for (const recipe of DAKINIS_FERMINA_DEFAULT_RECIPES) {
    const id = `rcp_${recipe.slug}_${t.businessId.slice(-8)}`;
    db.prepare(
      `INSERT INTO tenant_recipes (id, business_id, slug, name, output_label, output_quantity, output_unit, lines_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      t.businessId,
      recipe.slug,
      recipe.name,
      recipe.outputLabel,
      recipe.outputQuantity,
      recipe.outputUnit,
      JSON.stringify(recipe.lines)
    );
  }

  db.close();
  console.log("[seed] Fermina Food en SQLite:", dbPath);
}

async function main() {
  if (dakinisResolveDbDriver() === "postgres") {
    await dakinisUpsertPostgres();
  } else {
    dakinisUpsertSqlite();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
