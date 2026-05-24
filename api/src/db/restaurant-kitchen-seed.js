import { randomUUID } from "node:crypto";
import {
  DAKINIS_RESTAURANT_FULL_CATALOG,
  dakinisSerializeAllergenProfile
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import {
  DAKINIS_RESTAURANT_DEFAULT_ITEMS,
  DAKINIS_RESTAURANT_DEFAULT_RECIPES
} from "@dakinis/shared/catalog/restaurant-kitchen.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisDemoAllergenProfileJson() {
  return JSON.stringify(
    dakinisSerializeAllergenProfile(
      [
        {
          catalogId: "gluten",
          name: "Gluten",
          category: "Cereales",
          present: true,
          severity: "alta",
          notes: "Harina, prepizzas y tapas"
        },
        {
          catalogId: "eggs",
          name: "Huevos",
          category: "Huevo",
          present: true,
          severity: "media",
          notes: "Empanadas"
        },
        ...DAKINIS_RESTAURANT_FULL_CATALOG.filter((c) => c.id !== "gluten" && c.id !== "eggs").map((c) => ({
          catalogId: c.id,
          name: c.name,
          category: c.category,
          present: false,
          notes: ""
        }))
      ],
      []
    )
  );
}

function dakinisEmptyAllergenProfileJson() {
  return JSON.stringify(
    dakinisSerializeAllergenProfile(
      DAKINIS_RESTAURANT_FULL_CATALOG.map((c) => ({
        catalogId: c.id,
        name: c.name,
        category: c.category,
        present: false,
        notes: ""
      })),
      []
    )
  );
}

/** Crea perfil + token QR si no existe (también cuando ya hay stock). */
export function dakinisEnsureRestaurantProfile(db, businessId) {
  const existing = db
    .prepare(
      `SELECT business_id, public_token, venue_name, allergies_json, updated_at
       FROM tenant_restaurant_profile WHERE business_id = ?`
    )
    .get(businessId);
  if (existing) return existing;

  const biz = db.prepare(`SELECT name, slug FROM business WHERE id = ?`).get(businessId);
  const token = randomUUID().replace(/-/g, "").slice(0, 24);
  const venueName = biz?.name || "Restaurante";
  const allergiesJson =
    biz?.slug === "restaurante-demo" ? dakinisDemoAllergenProfileJson() : dakinisEmptyAllergenProfileJson();

  db.prepare(
    `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json)
     VALUES (?, ?, ?, ?)`
  ).run(businessId, token, venueName, allergiesJson);

  return db
    .prepare(
      `SELECT business_id, public_token, venue_name, allergies_json, updated_at
       FROM tenant_restaurant_profile WHERE business_id = ?`
    )
    .get(businessId);
}

export function dakinisEnsureRestaurantKitchenSeed(db, businessId) {
  dakinisEnsureRestaurantProfile(db, businessId);

  const count = db.prepare(`SELECT COUNT(*) AS c FROM tenant_stock_items WHERE business_id = ?`).get(businessId).c;
  if (count > 0) return;

  const insertItem = db.prepare(
    `INSERT INTO tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
     VALUES (?, ?, ?, ?, ?, 0, ?)`
  );
  for (const item of DAKINIS_RESTAURANT_DEFAULT_ITEMS) {
    const id = dakinisNewId("stk");
    insertItem.run(id, businessId, item.slug, item.name, item.unit, item.minQuantity);
  }

  const insertRecipe = db.prepare(
    `INSERT INTO tenant_recipes (id, business_id, slug, name, output_label, output_quantity, output_unit, lines_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const recipe of DAKINIS_RESTAURANT_DEFAULT_RECIPES) {
    insertRecipe.run(
      dakinisNewId("rcp"),
      businessId,
      recipe.slug,
      recipe.name,
      recipe.outputLabel,
      recipe.outputQuantity,
      recipe.outputUnit,
      JSON.stringify(recipe.lines)
    );
  }
}

/** Backfill: restaurantes sin perfil (p. ej. stock creado antes del módulo QR). */
export function dakinisEnsureAllRestaurantProfiles(db) {
  const rows = db.prepare(`SELECT id FROM business WHERE type = 'restaurante'`).all();
  for (const row of rows) {
    dakinisEnsureRestaurantProfile(db, row.id);
  }
}

/** Versión async (PostgreSQL vía query layer). */
export async function dakinisEnsureAllRestaurantProfilesAsync() {
  const { dakinisQueryAll } = await import("./query.js");
  const { dakinisEnsureRestaurantProfileAsync } = await import("./restaurant-kitchen-async.js");
  const rows = await dakinisQueryAll(`SELECT id FROM business WHERE type = 'restaurante'`);
  for (const row of rows) {
    await dakinisEnsureRestaurantProfileAsync(row.id);
  }
}
