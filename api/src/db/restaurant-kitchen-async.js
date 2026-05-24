import { randomUUID } from "node:crypto";
import {
  DAKINIS_RESTAURANT_FULL_CATALOG,
  dakinisSerializeAllergenProfile
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import { dakinisQueryOne, dakinisRun } from "./query.js";

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

export async function dakinisEnsureRestaurantProfileAsync(businessId) {
  const existing = await dakinisQueryOne(
    `SELECT business_id, public_token, venue_name, allergies_json, updated_at
     FROM tenant_restaurant_profile WHERE business_id = ?`,
    [businessId]
  );
  if (existing) return existing;

  const biz = await dakinisQueryOne(`SELECT name, slug FROM business WHERE id = ?`, [businessId]);
  const token = randomUUID().replace(/-/g, "").slice(0, 24);
  const venueName = biz?.name || "Restaurante";
  const allergiesJson =
    biz?.slug === "restaurante-demo" ? dakinisDemoAllergenProfileJson() : dakinisEmptyAllergenProfileJson();

  await dakinisRun(
    `INSERT INTO tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json)
     VALUES (?, ?, ?, ?)`,
    [businessId, token, venueName, allergiesJson]
  );

  return dakinisQueryOne(
    `SELECT business_id, public_token, venue_name, allergies_json, updated_at
     FROM tenant_restaurant_profile WHERE business_id = ?`,
    [businessId]
  );
}
