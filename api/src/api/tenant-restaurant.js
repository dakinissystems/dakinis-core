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

  const items = (
    await dakinisQueryAll(
      `SELECT id, slug, name, unit, quantity, min_quantity, updated_at
       FROM tenant_stock_items WHERE business_id = ? ORDER BY name`,
      [businessId]
    )
  ).map(dakinisRowStockItem);

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
  ).map((b) => ({
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
