import { randomUUID } from "node:crypto";
import { dakinisSqlOrderCreatedAtDesc, dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisQueryOne, dakinisQueryAll, dakinisRun } from "../db/query.js";
import { dakinisEnsureAllRestaurantProfilesAsync } from "../db/restaurant-kitchen-seed.js";
import { dakinisEnsureRestaurantProfileAsync } from "../db/restaurant-kitchen-async.js";
import {
  DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  DAKINIS_RESTAURANT_EXTRA_ALLERGENS,
  dakinisAllergensForPublicDisplay,
  dakinisMergeAllergenChecklist,
  dakinisSerializeAllergenProfile,
  dakinisSplitPublicAllergenDisplay
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import {
  DAKINIS_DUMPLING_DEFAULT_RECIPES,
  DAKINIS_DUMPLING_HOUSE_SLUG,
  DAKINIS_DUMPLING_STOCK_ITEMS,
  DAKINIS_FERMINA_DEFAULT_RECIPES,
  DAKINIS_FERMINA_DISH_ALLERGEN_ROWS,
  DAKINIS_FERMINA_DEMO_PURCHASE,
  DAKINIS_FERMINA_DEMO_PRODUCTION,
  DAKINIS_FERMINA_HOUSE_SLUG,
  DAKINIS_FERMINA_STOCK_ITEMS,
  DAKINIS_RESTAURANT_DEFAULT_ITEMS,
  DAKINIS_RESTAURANT_DEFAULT_RECIPES,
  dakinisRestaurantMaxBatchesPerRecipe,
  dakinisRestaurantPlanConsumption,
  dakinisRestaurantPlanOutputs,
  dakinisRestaurantValidatePlan
} from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES } from "@dakinis/shared/catalog/restaurant-floor.js";
import {
  dakinisNormalizeStockScanCode,
  dakinisResolveStockItemSlug,
  dakinisSlugFromBarcode,
  dakinisSlugFromName
} from "@dakinis/shared/catalog/stock-barcodes.js";
import {
  DAKINIS_DEFAULT_STOCK_LOCATIONS,
  dakinisDaysUntilExpiry,
  dakinisExpirySeverity
} from "@dakinis/shared/catalog/inventory-lots.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisRequireTenantJwt } from "./tenant-supply.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisRestaurantOnly(business) {
  if (String(business.type).toLowerCase() !== "restaurante") {
    return dakinisJsonError(403, "FORBIDDEN", "Modulo cocina/stock solo para negocios tipo restaurante");
  }
  return null;
}

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisRowStockItem(r, barcode) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    unit: r.unit,
    quantity: r.quantity,
    minQuantity: r.min_quantity,
    barcode: barcode || undefined,
    updatedAt: r.updated_at
  };
}

async function dakinisLoadBusinessConfig(businessId) {
  const biz = await dakinisQueryOne(`SELECT config_json FROM business WHERE id = ?`, [businessId]);
  try {
    return JSON.parse(biz?.config_json || "{}");
  } catch {
    return {};
  }
}

async function dakinisSaveBusinessConfig(businessId, config) {
  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [JSON.stringify(config), businessId]);
}

/** Solo claves slug seguras (evita prototype / remote property injection). */
const DAKINIS_SAFE_STOCK_SLUG_RE = /^[a-z0-9-]{1,64}$/;

function dakinisIsSafeStockSlug(slug) {
  const key = String(slug || "");
  return DAKINIS_SAFE_STOCK_SLUG_RE.test(key) && !["__proto__", "constructor", "prototype"].includes(key);
}

function dakinisStockBarcodesFromConfig(config) {
  const map = config?.stockBarcodes;
  if (!map || typeof map !== "object" || Array.isArray(map)) return Object.create(null);
  // Map + allowlist: evita remote property injection al copiar claves de config.
  const next = new Map();
  for (const key of Object.keys(map)) {
    if (!dakinisIsSafeStockSlug(key)) continue;
    const val = map[key];
    if (typeof val === "string" && val.trim()) next.set(key, val.trim());
  }
  return Object.assign(Object.create(null), Object.fromEntries(next));
}

function dakinisPutStockBarcode(barcodes, slug, barcode) {
  if (!dakinisIsSafeStockSlug(slug)) return barcodes;
  const value = String(barcode || "").trim();
  if (!value) return barcodes;
  // Map evita asignar propiedades dinámicas sobre un Object heredado.
  const next = new Map(Object.entries(barcodes || {}));
  next.set(slug, value);
  return Object.assign(Object.create(null), Object.fromEntries(next));
}

async function dakinisMaybeCreateLotOnReceive(businessId, { productName, productBarcode, expiryDate, quantity }) {
  const expiry = String(expiryDate || "").trim();
  if (!expiry) return null;

  const config = await dakinisLoadBusinessConfig(businessId);
  const inv = config.inventory && typeof config.inventory === "object" ? config.inventory : {};
  const locations =
    Array.isArray(inv.locations) && inv.locations.length
      ? inv.locations
      : DAKINIS_DEFAULT_STOCK_LOCATIONS.map((loc, i) => ({
          id: `loc_${loc.slug}`,
          slug: loc.slug,
          name: loc.name,
          kind: loc.kind,
          sortOrder: loc.sortOrder ?? i + 1
        }));
  const lots = Array.isArray(inv.lots) ? [...inv.lots] : [];
  const loc = locations[0];
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
  const lot = {
    id: dakinisNewId("lot"),
    labelCode: `LOT-${year}-${seq}`,
    productName: String(productName || "Producto").trim() || "Producto",
    productBarcode: String(productBarcode || "").trim(),
    supplierLot: "",
    supplier: "",
    expiryDate: expiry,
    quantityRemaining: Number(quantity) > 0 ? Number(quantity) : 1,
    locationId: loc?.id || null,
    locationName: loc?.name || "Almacén"
  };
  const daysUntilExpiry = dakinisDaysUntilExpiry(lot.expiryDate);
  const enriched = {
    ...lot,
    daysUntilExpiry,
    expirySeverity: dakinisExpirySeverity(lot.expiryDate)
  };
  await dakinisSaveBusinessConfig(businessId, {
    ...config,
    inventory: { ...inv, locations, lots: [enriched, ...lots] }
  });
  return enriched;
}

function dakinisRowRecipe(r) {
  let lines = [];
  try {
    lines = JSON.parse(r.lines_json || "[]");
  } catch {
    lines = [];
  }
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    outputLabel: r.output_label,
    outputQuantity: r.output_quantity,
    outputUnit: r.output_unit,
    lines,
    createdAt: r.created_at
  };
}

async function dakinisStockMapBySlug(businessId) {
  const rows = await dakinisQueryAll(`SELECT slug, quantity FROM tenant_stock_items WHERE business_id = ?`, [
    businessId
  ]);
  const map = {};
  for (const r of rows) map[r.slug] = r.quantity;
  return map;
}

async function dakinisListRecipes(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT id, slug, name, output_label, output_quantity, output_unit, lines_json, created_at
       FROM tenant_recipes WHERE business_id = ? ORDER BY name`,
    [businessId]
  );
  return rows.map(dakinisRowRecipe);
}

async function dakinisAdjustStock(businessId, itemId, delta, reason, referenceId) {
  await dakinisRun(
    `UPDATE tenant_stock_items SET quantity = quantity + ?, updated_at = ${dakinisSqlTimestampNow()} WHERE id = ? AND business_id = ?`,
    [delta, itemId, businessId]
  );
  await dakinisRun(
    `INSERT INTO tenant_stock_movements (id, business_id, stock_item_id, delta, reason, reference_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [dakinisNewId("sm"), businessId, itemId, delta, reason, referenceId ?? null]
  );
}

async function dakinisEnsureRestaurantKitchenSeedAsync(businessId) {
  await dakinisEnsureRestaurantProfileAsync(businessId);

  const biz = await dakinisQueryOne(`SELECT slug FROM business WHERE id = ?`, [businessId]);
  const isDumpling = biz?.slug === DAKINIS_DUMPLING_HOUSE_SLUG;
  const isFermina = biz?.slug === DAKINIS_FERMINA_HOUSE_SLUG;
  const defaultItems = isFermina
    ? DAKINIS_FERMINA_STOCK_ITEMS
    : isDumpling
      ? DAKINIS_DUMPLING_STOCK_ITEMS
      : DAKINIS_RESTAURANT_DEFAULT_ITEMS;
  const defaultRecipes = isFermina
    ? DAKINIS_FERMINA_DEFAULT_RECIPES
    : isDumpling
      ? DAKINIS_DUMPLING_DEFAULT_RECIPES
      : DAKINIS_RESTAURANT_DEFAULT_RECIPES;

  const countRow = await dakinisQueryOne(`SELECT COUNT(*) AS c FROM tenant_stock_items WHERE business_id = ?`, [
    businessId
  ]);
  if (Number(countRow?.c) === 0) {
    for (const item of defaultItems) {
      const id = dakinisNewId("stk");
      await dakinisRun(
        `INSERT INTO tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [id, businessId, item.slug, item.name, item.unit, item.minQuantity]
      );
    }
  }

  const recipeRows = await dakinisQueryAll(`SELECT slug FROM tenant_recipes WHERE business_id = ?`, [businessId]);
  const recipeSlugs = recipeRows.map((r) => r.slug);
  const hasManuRecipes = recipeSlugs.some((s) => s === "pizza-prepizza" || s === "empanadas-docena");
  const needsRecipes =
    recipeSlugs.length === 0 || ((isDumpling || isFermina) && hasManuRecipes);

  if (needsRecipes) {
    if (recipeSlugs.length > 0) {
      await dakinisRun(`DELETE FROM tenant_recipes WHERE business_id = ?`, [businessId]);
    }
    for (const recipe of defaultRecipes) {
      await dakinisRun(
        `INSERT INTO tenant_recipes (id, business_id, slug, name, output_label, output_quantity, output_unit, lines_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dakinisNewId("rcp"),
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
}

export async function dakinisHandleRestaurantKitchenGet(req) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureRestaurantKitchenSeedAsync(businessId);

  const config = await dakinisLoadBusinessConfig(businessId);
  const barcodes = dakinisStockBarcodesFromConfig(config);

  const items = (
    await dakinisQueryAll(
      `SELECT id, slug, name, unit, quantity, min_quantity, updated_at
       FROM tenant_stock_items WHERE business_id = ? ORDER BY name`,
      [businessId]
    )
  ).map((r) => dakinisRowStockItem(r, barcodes[r.slug]));

  const recipes = await dakinisListRecipes(businessId);
  const stockBySlug = await dakinisStockMapBySlug(businessId);
  const recipeSlugs = recipes.map((r) => ({ ...r, slug: r.slug, lines: r.lines }));
  const maxPerRecipe = dakinisRestaurantMaxBatchesPerRecipe(stockBySlug, recipeSlugs);

  await dakinisEnsureRestaurantProfileAsync(businessId);

  const profile = await dakinisQueryOne(
    `SELECT public_token, venue_name, allergies_json, updated_at FROM tenant_restaurant_profile WHERE business_id = ?`,
    [businessId]
  );

  let savedAllergies = [];
  try {
    savedAllergies = JSON.parse(profile?.allergies_json || "[]");
  } catch {
    savedAllergies = [];
  }

  const { checklist: allergenChecklist, customAllergies } = dakinisMergeAllergenChecklist(savedAllergies);
  const presentCount = allergenChecklist.filter((a) => a.present).length + customAllergies.filter((a) => a.present).length;

  const batches = (
    await dakinisQueryAll(
      `SELECT id, label, plan_json, outputs_json, notes, created_at
       FROM tenant_production_batches WHERE business_id = ?
       ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")} LIMIT 20`,
      [businessId]
    )
  ).map((b) => {
    let plan = [];
    let outputs = [];
    try {
      plan = JSON.parse(b.plan_json || "[]");
    } catch {
      plan = [];
    }
    try {
      outputs = JSON.parse(b.outputs_json || "[]");
    } catch {
      outputs = [];
    }
    return {
      id: b.id,
      label: b.label,
      plan: Array.isArray(plan) ? plan : [],
      outputs: Array.isArray(outputs) ? outputs : [],
      notes: b.notes,
      createdAt: b.created_at
    };
  });

  const floor = await dakinisLoadRestaurantFloor(businessId);

  return dakinisJsonSuccess(
    {
      items,
      recipes,
      maxPerRecipe,
      productionHistory: batches,
      floor,
      profile: profile
        ? {
            publicToken: profile.public_token,
            venueName: profile.venue_name,
            businessSlug: req.dakinisBusiness.slug,
            allergies: savedAllergies,
            allergenChecklist,
            customAllergies,
            allergenCatalog: {
              mandatory: DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
              extra: DAKINIS_RESTAURANT_EXTRA_ALLERGENS
            },
            presentAllergenCount: presentCount,
            totalCatalogCount: DAKINIS_RESTAURANT_ALLERGEN_CATALOG.length,
            updatedAt: profile.updated_at,
            publicPath: `/alergenos/${profile.public_token}`,
            publicPathBySlug: `/alergenos/${req.dakinisBusiness.slug}`
          }
        : null
    },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

async function dakinisLoadRestaurantFloor(businessId) {
  const biz = await dakinisQueryOne(`SELECT config_json FROM business WHERE id = ?`, [businessId]);
  let config = {};
  try {
    config = JSON.parse(biz?.config_json || "{}");
  } catch {
    config = {};
  }
  const tables = Array.isArray(config?.floor?.tables) && config.floor.tables.length
    ? config.floor.tables
    : DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((t) => ({ ...t }));
  const sessions =
    config?.floor?.sessions && typeof config.floor.sessions === "object" && !Array.isArray(config.floor.sessions)
      ? config.floor.sessions
      : {};
  return { tables, sessions };
}

export async function dakinisHandleRestaurantFloorGet(req) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const floor = await dakinisLoadRestaurantFloor(req.dakinisBusiness.id);
  return dakinisJsonSuccess(floor, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantFloorPatch(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const businessId = req.dakinisBusiness.id;
  const biz = await dakinisQueryOne(`SELECT config_json FROM business WHERE id = ?`, [businessId]);
  let config = {};
  try {
    config = JSON.parse(biz?.config_json || "{}");
  } catch {
    config = {};
  }

  const prev = config.floor && typeof config.floor === "object" ? config.floor : {};
  const nextTables = Array.isArray(body.tables) ? body.tables : prev.tables;
  const nextSessions =
    body.sessions && typeof body.sessions === "object" && !Array.isArray(body.sessions)
      ? body.sessions
      : prev.sessions || {};

  config.floor = {
    tables:
      Array.isArray(nextTables) && nextTables.length
        ? nextTables
        : DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((t) => ({ ...t })),
    sessions: nextSessions
  };

  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [JSON.stringify(config), businessId]);
  return dakinisJsonSuccess(config.floor, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantStockItemsPost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const barcode = dakinisNormalizeStockScanCode(body.barcode);
  const unit = typeof body.unit === "string" && body.unit.trim() ? body.unit.trim() : "u";
  const minQuantity = Number(body.minQuantity);
  const initialQuantity = Number(body.initialQuantity);
  const expiryDate = typeof body.expiryDate === "string" ? body.expiryDate.trim() : "";

  if (!name) return dakinisJsonError(400, "VALIDATION_ERROR", "name es obligatorio");
  if (!barcode) return dakinisJsonError(400, "VALIDATION_ERROR", "barcode es obligatorio");

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureRestaurantKitchenSeedAsync(businessId);

  const slug = dakinisSlugFromBarcode(barcode) || dakinisSlugFromName(name);
  if (!slug || !dakinisIsSafeStockSlug(slug)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "No se pudo generar slug valido");
  }

  const existing = await dakinisQueryOne(
    `SELECT id, slug, name, unit, quantity, min_quantity, updated_at
       FROM tenant_stock_items WHERE business_id = ? AND slug = ?`,
    [businessId, slug]
  );
  if (existing) {
    return dakinisJsonError(409, "CONFLICT", "Ya existe un insumo con este codigo");
  }

  const id = dakinisNewId("stk");
  const qty = Number.isFinite(initialQuantity) && initialQuantity > 0 ? initialQuantity : 0;
  const minQ = Number.isFinite(minQuantity) && minQuantity >= 0 ? minQuantity : 0;

  await dakinisRun(
    `INSERT INTO tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, businessId, slug, name, unit, qty, minQ]
  );

  if (qty > 0) {
    await dakinisRun(
      `INSERT INTO tenant_stock_movements (id, business_id, stock_item_id, delta, reason, reference_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [dakinisNewId("sm"), businessId, id, qty, "alta-escaneo", null]
    );
  }

  const config = await dakinisLoadBusinessConfig(businessId);
  const barcodes = dakinisPutStockBarcode(dakinisStockBarcodesFromConfig(config), slug, barcode);
  await dakinisSaveBusinessConfig(businessId, { ...config, stockBarcodes: barcodes });

  if (expiryDate) {
    await dakinisMaybeCreateLotOnReceive(businessId, {
      productName: name,
      productBarcode: barcode,
      expiryDate,
      quantity: qty > 0 ? qty : 1
    });
  }

  const row = await dakinisQueryOne(
    `SELECT id, slug, name, unit, quantity, min_quantity, updated_at
       FROM tenant_stock_items WHERE id = ?`,
    [id]
  );
  return dakinisJsonSuccess(
    { item: dakinisRowStockItem(row, barcode) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantStockScanPost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const barcode = dakinisNormalizeStockScanCode(body.barcode);
  const qty = Number(body.quantity);
  const direction = String(body.direction || "in").toLowerCase() === "out" ? "out" : "in";
  if (!barcode) return dakinisJsonError(400, "VALIDATION_ERROR", "barcode es obligatorio");
  if (!Number.isFinite(qty) || qty <= 0) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "quantity debe ser > 0");
  }

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureRestaurantKitchenSeedAsync(businessId);

  const config = await dakinisLoadBusinessConfig(businessId);
  const barcodes = dakinisStockBarcodesFromConfig(config);
  const rows = await dakinisQueryAll(
    `SELECT id, slug, name, unit, quantity, min_quantity, updated_at
       FROM tenant_stock_items WHERE business_id = ?`,
    [businessId]
  );
  const items = rows.map((r) => dakinisRowStockItem(r, barcodes[r.slug]));
  const slug = dakinisResolveStockItemSlug(barcode, items);
  if (!slug) {
    return dakinisJsonError(404, "BARCODE_UNKNOWN", "Codigo no reconocido");
  }

  const row = rows.find((r) => r.slug === slug);
  if (!row) return dakinisJsonError(404, "BARCODE_UNKNOWN", "Codigo no reconocido");

  const delta = direction === "out" ? -qty : qty;
  if (direction === "out" && Number(row.quantity) + delta < -1e-9) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "Stock insuficiente");
  }

  await dakinisAdjustStock(
    businessId,
    row.id,
    delta,
    direction === "out" ? "salida-escaneo" : "entrada-escaneo",
    null
  );

  const updated = await dakinisQueryOne(
    `SELECT id, slug, name, unit, quantity, min_quantity, updated_at
       FROM tenant_stock_items WHERE id = ?`,
    [row.id]
  );
  return dakinisJsonSuccess(
    { item: dakinisRowStockItem(updated, barcodes[slug] || barcode) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantStockPurchasePost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (lines.length === 0) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "lines[] con itemSlug y quantity");
  }

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureRestaurantKitchenSeedAsync(businessId);

  const label = typeof body.label === "string" ? body.label.trim() : "Compra / pedido";
  const refId = dakinisNewId("pur");

  for (const line of lines) {
    const slug = typeof line.itemSlug === "string" ? line.itemSlug.trim() : "";
    const qty = Number(line.quantity);
    if (!slug || !Number.isFinite(qty) || qty <= 0) continue;
    const row = await dakinisQueryOne(`SELECT id FROM tenant_stock_items WHERE business_id = ? AND slug = ?`, [
      businessId,
      slug
    ]);
    if (!row) continue;
    await dakinisAdjustStock(businessId, row.id, qty, label || "compra", refId);
  }

  return dakinisHandleRestaurantKitchenGet(req);
}

export async function dakinisHandleRestaurantProductionSimulatePost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const plan = Array.isArray(body.plan) ? body.plan : [];
  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureRestaurantKitchenSeedAsync(businessId);

  const recipes = await dakinisListRecipes(businessId);
  const stockBySlug = await dakinisStockMapBySlug(businessId);
  const validation = dakinisRestaurantValidatePlan(plan, recipes, stockBySlug);

  return dakinisJsonSuccess(
    {
      plan,
      validation,
      outputs: validation.ok ? dakinisRestaurantPlanOutputs(plan, recipes) : [],
      consumption: dakinisRestaurantPlanConsumption(plan, recipes)
    },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantProductionPost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const plan = Array.isArray(body.plan) ? body.plan : [];
  if (plan.length === 0) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "plan[] con recipeSlug y batches");
  }

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureRestaurantKitchenSeedAsync(businessId);

  const recipes = await dakinisListRecipes(businessId);
  const stockBySlug = await dakinisStockMapBySlug(businessId);
  const validation = dakinisRestaurantValidatePlan(plan, recipes, stockBySlug);
  if (!validation.ok) {
    return dakinisJsonError(409, "INSUFFICIENT_STOCK", "Stock insuficiente para el plan", {
      shortages: validation.shortages
    });
  }

  const needed = validation.needed;
  const batchId = dakinisNewId("pb");
  const label = typeof body.label === "string" ? body.label.trim() : "Produccion";

  for (const [slug, qty] of Object.entries(needed)) {
    const row = await dakinisQueryOne(`SELECT id FROM tenant_stock_items WHERE business_id = ? AND slug = ?`, [
      businessId,
      slug
    ]);
    if (!row) continue;
    await dakinisAdjustStock(businessId, row.id, -qty, label, batchId);
  }

  const outputs = dakinisRestaurantPlanOutputs(plan, recipes);
  await dakinisRun(
    `INSERT INTO tenant_production_batches (id, business_id, label, plan_json, outputs_json, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      batchId,
      businessId,
      label,
      JSON.stringify(plan),
      JSON.stringify(outputs),
      typeof body.notes === "string" ? body.notes.trim() : ""
    ]
  );

  return dakinisHandleRestaurantKitchenGet(req);
}

export async function dakinisHandleRestaurantProfilePatch(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureRestaurantKitchenSeedAsync(businessId);
  await dakinisEnsureRestaurantProfileAsync(businessId);

  const venueName =
    typeof body.venueName === "string" && body.venueName.trim()
      ? body.venueName.trim()
      : undefined;
  const checklist = Array.isArray(body.allergenChecklist) ? body.allergenChecklist : null;
  const customAllergies = Array.isArray(body.customAllergies) ? body.customAllergies : null;
  const legacyAllergies = Array.isArray(body.allergies) ? body.allergies : null;

  const current = await dakinisQueryOne(
    `SELECT venue_name, allergies_json FROM tenant_restaurant_profile WHERE business_id = ?`,
    [businessId]
  );

  if (!current) {
    return dakinisJsonError(500, "PROFILE_ERROR", "No se pudo crear el perfil del restaurante");
  }

  const nextVenue = venueName ?? current.venue_name ?? "Restaurante";
  let nextAllergies = current?.allergies_json ?? "[]";
  if (checklist || customAllergies) {
    nextAllergies = JSON.stringify(
      dakinisSerializeAllergenProfile(checklist || [], customAllergies || [])
    );
  } else if (legacyAllergies) {
    nextAllergies = JSON.stringify(
      dakinisSerializeAllergenProfile(
        dakinisMergeAllergenChecklist(legacyAllergies).checklist,
        dakinisMergeAllergenChecklist(legacyAllergies).customAllergies
      )
    );
  }

  await dakinisRun(
    `UPDATE tenant_restaurant_profile SET venue_name = ?, allergies_json = ?, updated_at = ${dakinisSqlTimestampNow()}
     WHERE business_id = ?`,
    [nextVenue, nextAllergies, businessId]
  );

  return dakinisHandleRestaurantKitchenGet(req);
}

async function dakinisLoadPublicAllergenProfile(key) {
  return dakinisQueryOne(
    `SELECT p.public_token, p.venue_name, p.allergies_json, p.updated_at, b.name AS business_name, b.slug
       FROM tenant_restaurant_profile p
       JOIN business b ON b.id = p.business_id
       WHERE p.public_token = ? OR lower(b.slug) = lower(?)`,
    [key, key]
  );
}

async function dakinisProvisionPublicAllergenProfile(key) {
  const biz = await dakinisQueryOne(
    `SELECT id, name, slug, type FROM business WHERE lower(slug) = lower(?) OR id = ? LIMIT 1`,
    [key, key]
  );

  if (!biz || String(biz.type).toLowerCase() !== "restaurante") {
    return null;
  }

  await dakinisEnsureRestaurantKitchenSeedAsync(biz.id);

  return dakinisQueryOne(
    `SELECT p.public_token, p.venue_name, p.allergies_json, p.updated_at, b.name AS business_name, b.slug
       FROM tenant_restaurant_profile p
       JOIN business b ON b.id = p.business_id
       WHERE p.business_id = ?`,
    [biz.id]
  );
}

export async function dakinisHandlePublicRestaurantAllergiesGet(token) {
  let t = typeof token === "string" ? token.trim() : "";
  try {
    t = decodeURIComponent(t).trim();
  } catch {
    /* keep raw */
  }
  if (!t) return dakinisJsonError(400, "VALIDATION_ERROR", "token invalido");

  await dakinisEnsureAllRestaurantProfilesAsync();

  let profile = await dakinisLoadPublicAllergenProfile(t);
  if (!profile) {
    profile = await dakinisProvisionPublicAllergenProfile(t);
  }

  if (!profile) {
    return dakinisJsonError(404, "NOT_FOUND", "Cartel de alergias no encontrado para este enlace.", {
      token: t,
      hint: "Usa el enlace del panel Cocina/stock o /alergenos/restaurante-demo si eres el tenant demo."
    });
  }

  let savedAllergies = [];
  try {
    savedAllergies = JSON.parse(profile.allergies_json || "[]");
  } catch {
    savedAllergies = [];
  }

  if (profile.slug === DAKINIS_FERMINA_HOUSE_SLUG) {
    const hasDishRows = savedAllergies.some(
      (r) => r?.present !== false && String(r?.id || "").startsWith("dish_")
    );
    if (!hasDishRows) {
      savedAllergies = [...savedAllergies, ...DAKINIS_FERMINA_DISH_ALLERGEN_ROWS];
    }
  }

  const presentAllergies = dakinisAllergensForPublicDisplay(savedAllergies);
  const { dishes, infoRows, catalogRows } = dakinisSplitPublicAllergenDisplay(presentAllergies);
  const { checklist, customAllergies } = dakinisMergeAllergenChecklist(savedAllergies);

  return dakinisJsonSuccess(
    {
      venueName: profile.venue_name || profile.business_name,
      businessSlug: profile.slug,
      publicToken: profile.public_token,
      publicPath: `/alergenos/${profile.public_token}`,
      allergies: presentAllergies,
      presentAllergies,
      dishes,
      infoRows,
      catalogRows,
      absentCount:
        checklist.filter((a) => !a.present).length +
        customAllergies.filter((c) => !c.present).length,
      updatedAt: profile.updated_at
    },
    "restaurante",
    { public: true }
  );
}
