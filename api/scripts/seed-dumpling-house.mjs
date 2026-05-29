#!/usr/bin/env node
/**
 * Crea tenant Dumpling House (negocio + usuario + perfil restaurante + menú + alérgenos).
 *
 * Uso (Postgres / Supabase pooler):
 *   cd platform/core/api
 *   set DB_DRIVER=postgres
 *   set POSTGRES_SCHEMA=dakinis_core_prod
 *   set DATABASE_URL=postgresql://...
 *   node scripts/seed-dumpling-house.mjs
 *
 * SQLite local (después de schema):
 *   set DB_DRIVER=sqlite
 *   node scripts/seed-dumpling-house.mjs
 */
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DAKINIS_RESTAURANT_FULL_CATALOG,
  dakinisSerializeAllergenProfile
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import { dakinisInitPostgresPool } from "../src/db/postgres.js";
import { dakinisQueryOne, dakinisRun, dakinisQueryAll } from "../src/db/query.js";
import { dakinisResolveDbDriver } from "../src/db/dialect.js";
import Database from "better-sqlite3";
import fs from "node:fs";
import {
  DUMPLING_HOUSE_MENU_ITEMS,
  DUMPLING_HOUSE_PDF_ALLERGENS,
  DUMPLING_HOUSE_TENANT,
  DUMPLING_ALLERGEN_ES_TO_CATALOG,
  dumplingBuildConfigJson,
  dumplingAllergensForPdfKey,
  dumplingResolvePdfKey,
  dumplingDishAllergenNotes,
  dumplingMushroomCustomAllergenRow
} from "../../../../docs/supabase/seeds/dumpling-house-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STOCK_ITEMS = [
  { slug: "harina-trigo", name: "Harina de trigo", unit: "kg", quantity: 25, minQuantity: 5 },
  { slug: "arroz", name: "Arroz", unit: "kg", quantity: 20, minQuantity: 5 },
  { slug: "cerdo", name: "Cerdo", unit: "kg", quantity: 15, minQuantity: 3 },
  { slug: "pollo", name: "Pollo", unit: "kg", quantity: 15, minQuantity: 3 },
  { slug: "ternera", name: "Ternera", unit: "kg", quantity: 10, minQuantity: 2 },
  { slug: "pato", name: "Pato", unit: "kg", quantity: 8, minQuantity: 2 },
  { slug: "langostino", name: "Langostino", unit: "kg", quantity: 6, minQuantity: 2 },
  { slug: "verduras", name: "Verduras mix", unit: "kg", quantity: 12, minQuantity: 3 },
  { slug: "soja-salsa", name: "Salsa de soja", unit: "L", quantity: 4, minQuantity: 1 },
  { slug: "sesamo", name: "Sésamo", unit: "kg", quantity: 2, minQuantity: 0.5 }
];

function dakinisCategoryLabel(cat) {
  const map = {
    combo: "Combo",
    entrante: "Entrante",
    plato: "Plato principal",
    arroz: "Arroz",
    noodle: "Noodles"
  };
  return map[cat] || cat;
}

function dakinisBuildAllergenProfile() {
  const dishRows = [];
  const catalogHits = new Map();

  function addDish(displayName, category, pdfKey) {
    const allergens = dumplingAllergensForPdfKey(pdfKey);
    const notes = allergens.length ? allergens.join(", ") : "Sin alérgenos declarados en carta";
    dishRows.push({
      id: `dish_${displayName.replace(/\s+/g, "_").toLowerCase().slice(0, 40)}`,
      name: displayName,
      category: dakinisCategoryLabel(category),
      present: true,
      severity: allergens.length ? "alta" : "info",
      notes
    });
    for (const es of allergens) {
      const catalogId = DUMPLING_ALLERGEN_ES_TO_CATALOG[es];
      if (!catalogId) continue;
      const list = catalogHits.get(catalogId) || new Set();
      list.add(displayName);
      catalogHits.set(catalogId, list);
    }
  }

  for (const item of DUMPLING_HOUSE_MENU_ITEMS) {
    if (item.category === "combo") {
      for (const part of item.comboIncludes || []) {
        if (/REFRESCO|AGUA/i.test(part)) continue;
        const pdfKey = dumplingResolvePdfKey(part);
        addDish(part, "combo", pdfKey);
      }
      continue;
    }
    const pdfKey = item.pdfKey || item.name;
    addDish(item.name, item.category, pdfKey);
  }

  for (const pdfName of Object.keys(DUMPLING_HOUSE_PDF_ALLERGENS)) {
    if (!dishRows.some((d) => d.notes.includes(pdfName) || d.name === pdfName)) {
      const allergens = DUMPLING_HOUSE_PDF_ALLERGENS[pdfName];
      if (allergens.length) {
        addDish(pdfName, "entrante", pdfName);
      }
    }
  }

  const checklist = DAKINIS_RESTAURANT_FULL_CATALOG.map((c) => {
    const dishes = catalogHits.get(c.id);
    return {
      catalogId: c.id,
      name: c.name,
      category: c.category,
      present: Boolean(dishes?.size),
      severity: dishes?.size ? "alta" : "info",
      notes: dishes?.size ? `Platos: ${[...dishes].sort().join("; ")}` : ""
    };
  });

  dishRows.push(dumplingMushroomCustomAllergenRow());

  return dakinisSerializeAllergenProfile(checklist, dishRows);
}

async function dakinisUpsertPostgres() {
  await dakinisInitPostgresPool();
  const t = DUMPLING_HOUSE_TENANT;
  const passwordHash = bcrypt.hashSync(t.password, 10);
  const configJson = JSON.stringify(dumplingBuildConfigJson());
  const allergiesJson = JSON.stringify(dakinisBuildAllergenProfile());

  const existing = await dakinisQueryOne(`SELECT id FROM business WHERE slug = ?`, [t.slug]);
  if (existing) {
    console.log(`[seed] Tenant ${t.slug} ya existe (id=${existing.id}). Actualizando perfil y config.`);
    await dakinisRun(
      `UPDATE business SET name = ?, type = ?, plan = ?, config_json = ? WHERE slug = ?`,
      [t.name, t.type, t.plan, configJson, t.slug]
    );
    const biz = await dakinisQueryOne(`SELECT id FROM business WHERE slug = ?`, [t.slug]);
    await dakinisRun(
      `UPDATE tenant_restaurant_profile SET venue_name = ?, allergies_json = ?, updated_at = NOW() WHERE business_id = ?`,
      [t.venueName, allergiesJson, biz.id]
    );
    console.log(`[seed] Actualizado business_id=${biz.id}`);
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
    `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json)
     VALUES (?, ?, ?, ?)`,
    [t.businessId, t.publicToken, t.venueName, allergiesJson]
  );

  for (const item of STOCK_ITEMS) {
    const id = `stk_${item.slug}_${t.businessId.slice(-8)}`;
    await dakinisRun(
      `INSERT INTO tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (business_id, slug) DO UPDATE SET name = EXCLUDED.name, quantity = EXCLUDED.quantity`,
      [id, t.businessId, item.slug, item.name, item.unit, item.quantity, item.minQuantity]
    );
  }

  console.log("[seed] Dumpling House creado en Postgres.");
  console.log(`  slug: ${t.slug}`);
  console.log(`  login: ${t.email} / ${t.password}`);
  console.log(`  QR token: ${t.publicToken} → /alergenos/${t.publicToken}`);
}

function dakinisUpsertSqlite() {
  const apiRoot = path.resolve(__dirname, "..");
  const dbPath = process.env.SQLITE_PATH || path.join(apiRoot, "data", "dakinis.db");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`SQLite no encontrado: ${dbPath}. Ejecuta el API una vez o define SQLITE_PATH.`);
  }
  const db = new Database(dbPath);
  const t = DUMPLING_HOUSE_TENANT;
  const passwordHash = bcrypt.hashSync(t.password, 10);
  const configJson = JSON.stringify(dumplingBuildConfigJson());
  const allergiesJson = JSON.stringify(dakinisBuildAllergenProfile());

  db.prepare(
    `INSERT OR REPLACE INTO business (id, slug, name, type, plan, config_json) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(t.businessId, t.slug, t.name, t.type, t.plan, configJson);

  db.prepare(
    `INSERT OR REPLACE INTO users (id, business_id, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')`
  ).run(t.userId, t.businessId, t.email, passwordHash);

  const prof = db
    .prepare(`SELECT business_id FROM tenant_restaurant_profile WHERE business_id = ?`)
    .get(t.businessId);
  if (prof) {
    db.prepare(
      `UPDATE tenant_restaurant_profile SET venue_name = ?, allergies_json = ?, updated_at = datetime('now') WHERE business_id = ?`
    ).run(t.venueName, allergiesJson, t.businessId);
  } else {
    db.prepare(
      `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json) VALUES (?, ?, ?, ?)`
    ).run(t.businessId, t.publicToken, t.venueName, allergiesJson);
  }

  for (const item of STOCK_ITEMS) {
    const id = `stk_${item.slug}_${randomUUID().replace(/-/g, "").slice(0, 8)}`;
    db.prepare(
      `INSERT OR IGNORE INTO tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, t.businessId, item.slug, item.name, item.unit, item.quantity, item.minQuantity);
  }

  db.close();
  console.log("[seed] Dumpling House creado en SQLite:", dbPath);
  console.log(`  login: ${t.email} / ${t.password}`);
}

async function main() {
  const driver = dakinisResolveDbDriver();
  if (driver === "postgres") {
    await dakinisUpsertPostgres();
  } else {
    dakinisUpsertSqlite();
  }
}

main().catch((err) => {
  console.error("[seed] Error:", err.message || err);
  process.exit(1);
});
