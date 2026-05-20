import { randomUUID } from "node:crypto";
import { dakinisGetDb } from "../db/index.js";
import { dakinisEnsureRestaurantKitchenSeed } from "../db/restaurant-kitchen-seed.js";
import {
  DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  DAKINIS_RESTAURANT_EXTRA_ALLERGENS,
  dakinisAllergensForPublicDisplay,
  dakinisMergeAllergenChecklist,
  dakinisSerializeAllergenProfile
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import {
  dakinisRestaurantMaxBatchesPerRecipe,
  dakinisRestaurantPlanConsumption,
  dakinisRestaurantPlanOutputs,
  dakinisRestaurantValidatePlan
} from "@dakinis/shared/catalog/restaurant-kitchen.js";
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

function dakinisRowStockItem(r) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    unit: r.unit,
    quantity: r.quantity,
    minQuantity: r.min_quantity,
    updatedAt: r.updated_at
  };
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

function dakinisStockMapBySlug(db, businessId) {
  const rows = db
    .prepare(`SELECT slug, quantity FROM tenant_stock_items WHERE business_id = ?`)
    .all(businessId);
  const map = {};
  for (const r of rows) map[r.slug] = r.quantity;
  return map;
}

function dakinisListRecipes(db, businessId) {
  return db
    .prepare(
      `SELECT id, slug, name, output_label, output_quantity, output_unit, lines_json, created_at
       FROM tenant_recipes WHERE business_id = ? ORDER BY name`
    )
    .all(businessId)
    .map(dakinisRowRecipe);
}

function dakinisAdjustStock(db, businessId, itemId, delta, reason, referenceId) {
  db.prepare(
    `UPDATE tenant_stock_items SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ? AND business_id = ?`
  ).run(delta, itemId, businessId);
  db.prepare(
    `INSERT INTO tenant_stock_movements (id, business_id, stock_item_id, delta, reason, reference_id)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(dakinisNewId("sm"), businessId, itemId, delta, reason, referenceId ?? null);
}

export function dakinisHandleRestaurantKitchenGet(req) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;

  const db = dakinisGetDb();
  const businessId = req.dakinisBusiness.id;
  dakinisEnsureRestaurantKitchenSeed(db, businessId);

  const items = db
    .prepare(
      `SELECT id, slug, name, unit, quantity, min_quantity, updated_at
       FROM tenant_stock_items WHERE business_id = ? ORDER BY name`
    )
    .all(businessId)
    .map(dakinisRowStockItem);

  const recipes = dakinisListRecipes(db, businessId);
  const stockBySlug = dakinisStockMapBySlug(db, businessId);
  const recipeSlugs = recipes.map((r) => ({ ...r, slug: r.slug, lines: r.lines }));
  const maxPerRecipe = dakinisRestaurantMaxBatchesPerRecipe(stockBySlug, recipeSlugs);

  const profile = db
    .prepare(`SELECT public_token, venue_name, allergies_json, updated_at FROM tenant_restaurant_profile WHERE business_id = ?`)
    .get(businessId);

  let savedAllergies = [];
  try {
    savedAllergies = JSON.parse(profile?.allergies_json || "[]");
  } catch {
    savedAllergies = [];
  }

  const { checklist: allergenChecklist, customAllergies } = dakinisMergeAllergenChecklist(savedAllergies);
  const presentCount = allergenChecklist.filter((a) => a.present).length + customAllergies.filter((a) => a.present).length;

  const batches = db
    .prepare(
      `SELECT id, label, plan_json, outputs_json, notes, created_at
       FROM tenant_production_batches WHERE business_id = ?
       ORDER BY datetime(created_at) DESC LIMIT 20`
    )
    .all(businessId)
    .map((b) => ({
      id: b.id,
      label: b.label,
      plan: JSON.parse(b.plan_json || "[]"),
      outputs: JSON.parse(b.outputs_json || "[]"),
      notes: b.notes,
      createdAt: b.created_at
    }));

  return dakinisJsonSuccess(
    {
      items,
      recipes,
      maxPerRecipe,
      productionHistory: batches,
      profile: profile
        ? {
            publicToken: profile.public_token,
            venueName: profile.venue_name,
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
            publicPath: `/alergenos/${profile.public_token}`
          }
        : null
    },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export function dakinisHandleRestaurantStockPurchasePost(req, rawBody) {
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

  const db = dakinisGetDb();
  const businessId = req.dakinisBusiness.id;
  dakinisEnsureRestaurantKitchenSeed(db, businessId);

  const label = typeof body.label === "string" ? body.label.trim() : "Compra / pedido";
  const refId = dakinisNewId("pur");

  for (const line of lines) {
    const slug = typeof line.itemSlug === "string" ? line.itemSlug.trim() : "";
    const qty = Number(line.quantity);
    if (!slug || !Number.isFinite(qty) || qty <= 0) continue;
    const row = db
      .prepare(`SELECT id FROM tenant_stock_items WHERE business_id = ? AND slug = ?`)
      .get(businessId, slug);
    if (!row) continue;
    dakinisAdjustStock(db, businessId, row.id, qty, label || "compra", refId);
  }

  return dakinisHandleRestaurantKitchenGet(req);
}

export function dakinisHandleRestaurantProductionSimulatePost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const plan = Array.isArray(body.plan) ? body.plan : [];
  const db = dakinisGetDb();
  const businessId = req.dakinisBusiness.id;
  dakinisEnsureRestaurantKitchenSeed(db, businessId);

  const recipes = dakinisListRecipes(db, businessId);
  const stockBySlug = dakinisStockMapBySlug(db, businessId);
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

export function dakinisHandleRestaurantProductionPost(req, rawBody) {
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

  const db = dakinisGetDb();
  const businessId = req.dakinisBusiness.id;
  dakinisEnsureRestaurantKitchenSeed(db, businessId);

  const recipes = dakinisListRecipes(db, businessId);
  const stockBySlug = dakinisStockMapBySlug(db, businessId);
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
    const row = db
      .prepare(`SELECT id FROM tenant_stock_items WHERE business_id = ? AND slug = ?`)
      .get(businessId, slug);
    if (!row) continue;
    dakinisAdjustStock(db, businessId, row.id, -qty, label, batchId);
  }

  const outputs = dakinisRestaurantPlanOutputs(plan, recipes);
  db.prepare(
    `INSERT INTO tenant_production_batches (id, business_id, label, plan_json, outputs_json, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    batchId,
    businessId,
    label,
    JSON.stringify(plan),
    JSON.stringify(outputs),
    typeof body.notes === "string" ? body.notes.trim() : ""
  );

  return dakinisHandleRestaurantKitchenGet(req);
}

export function dakinisHandleRestaurantProfilePatch(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const db = dakinisGetDb();
  const businessId = req.dakinisBusiness.id;
  dakinisEnsureRestaurantKitchenSeed(db, businessId);

  const venueName =
    typeof body.venueName === "string" && body.venueName.trim()
      ? body.venueName.trim()
      : undefined;
  const checklist = Array.isArray(body.allergenChecklist) ? body.allergenChecklist : null;
  const customAllergies = Array.isArray(body.customAllergies) ? body.customAllergies : null;
  const legacyAllergies = Array.isArray(body.allergies) ? body.allergies : null;

  const current = db
    .prepare(`SELECT venue_name, allergies_json FROM tenant_restaurant_profile WHERE business_id = ?`)
    .get(businessId);

  const nextVenue = venueName ?? current?.venue_name ?? "Restaurante";
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

  db.prepare(
    `UPDATE tenant_restaurant_profile SET venue_name = ?, allergies_json = ?, updated_at = datetime('now')
     WHERE business_id = ?`
  ).run(nextVenue, nextAllergies, businessId);

  return dakinisHandleRestaurantKitchenGet(req);
}

export function dakinisHandlePublicRestaurantAllergiesGet(token) {
  const t = typeof token === "string" ? token.trim() : "";
  if (!t) return dakinisJsonError(400, "VALIDATION_ERROR", "token invalido");

  const db = dakinisGetDb();
  const profile = db
    .prepare(
      `SELECT p.venue_name, p.allergies_json, p.updated_at, b.name AS business_name, b.slug
       FROM tenant_restaurant_profile p
       JOIN business b ON b.id = p.business_id
       WHERE p.public_token = ?`
    )
    .get(t);

  if (!profile) {
    return dakinisJsonError(404, "NOT_FOUND", "Cartel de alergias no encontrado");
  }

  let savedAllergies = [];
  try {
    savedAllergies = JSON.parse(profile.allergies_json || "[]");
  } catch {
    savedAllergies = [];
  }

  const presentAllergies = dakinisAllergensForPublicDisplay(savedAllergies);
  const { checklist, customAllergies } = dakinisMergeAllergenChecklist(savedAllergies);

  return dakinisJsonSuccess(
    {
      venueName: profile.venue_name || profile.business_name,
      businessSlug: profile.slug,
      allergies: presentAllergies,
      presentAllergies,
      absentCount:
        checklist.filter((a) => !a.present).length +
        customAllergies.filter((c) => !c.present).length,
      updatedAt: profile.updated_at
    },
    "restaurante",
    { public: true }
  );
}
