import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import productsCatalog from "../../../../../packages/shared-brand/src/products.json" with { type: "json" };
import hubModulesCatalog from "../../../../../packages/shared-brand/src/hub-modules.json" with { type: "json" };
import { dakinisGetDbDriver } from "../db/index.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";

const CATALOG_KV_KEY = "ecosystem_catalog";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const brandDir = path.resolve(__dirname, "../../../../../packages/shared-brand/src");

let tableReady = false;

function dakinisDefaultCatalog() {
  return {
    products: structuredClone(productsCatalog),
    hubModules: structuredClone(hubModulesCatalog)
  };
}

async function dakinisEnsurePlatformKvTable() {
  if (tableReady) return;
  const driver = dakinisGetDbDriver();
  if (driver === "postgres") {
    await dakinisRun(
      `CREATE TABLE IF NOT EXISTS platform_kv (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
    );
  } else {
    await dakinisRun(
      `CREATE TABLE IF NOT EXISTS platform_kv (
        key TEXT PRIMARY KEY,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );
  }
  tableReady = true;
}

/**
 * @returns {Promise<{ products: unknown[], hubModules: unknown[], source: string, updatedAt?: string }>}
 */
export async function dakinisGetEcosystemCatalog() {
  await dakinisEnsurePlatformKvTable();
  const row = await dakinisQueryOne("SELECT value_json, updated_at FROM platform_kv WHERE key = ?", [
    CATALOG_KV_KEY
  ]);
  if (row?.value_json) {
    try {
      const parsed = JSON.parse(row.value_json);
      if (Array.isArray(parsed?.products)) {
        return {
          products: parsed.products,
          hubModules: Array.isArray(parsed.hubModules) ? parsed.hubModules : dakinisDefaultCatalog().hubModules,
          source: "database",
          updatedAt: row.updated_at
        };
      }
    } catch {
      /* fallback */
    }
  }
  return {
    ...dakinisDefaultCatalog(),
    source: "@dakinis/shared-brand"
  };
}

/**
 * @param {{ products: unknown[], hubModules?: unknown[] }} body
 */
export async function dakinisSaveEcosystemCatalog(body) {
  if (!body || !Array.isArray(body.products)) {
    const err = new Error("products array required");
    err.code = "VALIDATION_ERROR";
    throw err;
  }
  const hubModules = Array.isArray(body.hubModules)
    ? body.hubModules
    : dakinisDefaultCatalog().hubModules;

  for (const p of body.products) {
    if (!p || typeof p !== "object" || !p.id || !p.name) {
      const err = new Error("each product needs id and name");
      err.code = "VALIDATION_ERROR";
      throw err;
    }
  }

  await dakinisEnsurePlatformKvTable();
  const payload = JSON.stringify({ products: body.products, hubModules });
  const nowIso = new Date().toISOString();
  const existing = await dakinisQueryOne("SELECT key FROM platform_kv WHERE key = ?", [CATALOG_KV_KEY]);
  if (existing) {
    await dakinisRun("UPDATE platform_kv SET value_json = ?, updated_at = ? WHERE key = ?", [
      payload,
      nowIso,
      CATALOG_KV_KEY
    ]);
  } else {
    await dakinisRun("INSERT INTO platform_kv (key, value_json, updated_at) VALUES (?, ?, ?)", [
      CATALOG_KV_KEY,
      payload,
      nowIso
    ]);
  }

  try {
    const productsPath = path.join(brandDir, "products.json");
    const hubPath = path.join(brandDir, "hub-modules.json");
    fs.writeFileSync(productsPath, `${JSON.stringify(body.products, null, 2)}\n`, "utf8");
    fs.writeFileSync(hubPath, `${JSON.stringify(hubModules, null, 2)}\n`, "utf8");
  } catch (err) {
    console.warn("[catalog] could not write shared-brand JSON files:", err instanceof Error ? err.message : err);
  }

  const row = await dakinisQueryOne("SELECT updated_at FROM platform_kv WHERE key = ?", [CATALOG_KV_KEY]);
  return {
    products: body.products,
    hubModules,
    source: "database",
    updatedAt: row?.updated_at,
    filesSynced: true
  };
}
