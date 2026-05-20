import { randomUUID } from "node:crypto";
import { dakinisSerializeAllergenProfile } from "@dakinis/shared/catalog/restaurant-allergens.js";
import {
  DAKINIS_RESTAURANT_DEFAULT_ITEMS,
  DAKINIS_RESTAURANT_DEFAULT_RECIPES
} from "@dakinis/shared/catalog/restaurant-kitchen.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export function dakinisEnsureRestaurantKitchenSeed(db, businessId) {
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

  const token = randomUUID().replace(/-/g, "").slice(0, 24);
  db.prepare(
    `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json)
     VALUES (?, ?, ?, ?)`
  ).run(
    businessId,
    token,
    "Restaurante Premium Demo",
    JSON.stringify(
      dakinisSerializeAllergenProfile(
        [
          { catalogId: "gluten", name: "Gluten", category: "Cereales", present: true, severity: "alta", notes: "Harina, prepizzas y tapas" },
          { catalogId: "eggs", name: "Huevos", category: "Huevo", present: true, severity: "media", notes: "Empanadas" },
          { catalogId: "milk", name: "Leche", category: "Lácteos", present: false, notes: "" },
          { catalogId: "crustaceans", name: "Crustáceos", category: "Marisco", present: false, notes: "" },
          { catalogId: "fish", name: "Pescado", category: "Pescado", present: false, notes: "" },
          { catalogId: "peanuts", name: "Cacahuetes", category: "Frutos secos", present: false, notes: "" },
          { catalogId: "soy", name: "Soja", category: "Soja", present: false, notes: "" },
          { catalogId: "nuts", name: "Frutos de cáscara", category: "Frutos secos", present: false, notes: "" },
          { catalogId: "celery", name: "Apio", category: "Verdura", present: false, notes: "" },
          { catalogId: "mustard", name: "Mostaza", category: "Condimento", present: false, notes: "" },
          { catalogId: "sesame", name: "Sésamo", category: "Semillas", present: false, notes: "" },
          { catalogId: "sulphites", name: "Sulfitos", category: "Conservantes", present: false, notes: "" },
          { catalogId: "lupin", name: "Altramuz", category: "Legumbre", present: false, notes: "" },
          { catalogId: "molluscs", name: "Moluscos", category: "Marisco", present: false, notes: "" }
        ],
        []
      )
    )
  );
}
