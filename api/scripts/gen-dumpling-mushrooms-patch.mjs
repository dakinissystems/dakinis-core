import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dakinisSerializeAllergenProfile } from "@dakinis/shared/catalog/restaurant-allergens.js";
import { DAKINIS_RESTAURANT_FULL_CATALOG } from "@dakinis/shared/catalog/restaurant-allergens.js";
import {
  DUMPLING_HOUSE_MENU_ITEMS,
  DUMPLING_HOUSE_PDF_ALLERGENS,
  DUMPLING_ALLERGEN_ES_TO_CATALOG,
  dumplingBuildConfigJson,
  dumplingAllergensForPdfKey,
  dumplingResolvePdfKey,
  dumplingDishAllergenNotes,
  dumplingMushroomCustomAllergenRow
} from "../../../../docs/supabase/seeds/dumpling-house-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedsDir = path.resolve(__dirname, "../../../../docs/supabase/seeds");

function catLabel(c) {
  return { combo: "Combo", entrante: "Entrante", plato: "Plato principal", arroz: "Arroz", noodle: "Noodles" }[c] || c;
}

const dishRows = [];
const catalogHits = new Map();

function addDish(displayName, category, pdfKey) {
  const allergens = dumplingAllergensForPdfKey(pdfKey);
  const notes = dumplingDishAllergenNotes(pdfKey);
  dishRows.push({
    id: `dish_${displayName.replace(/\s+/g, "_").toLowerCase().slice(0, 40)}`,
    name: displayName,
    category: catLabel(category),
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
      addDish(part, "combo", dumplingResolvePdfKey(part));
    }
    continue;
  }
  addDish(item.name, item.category, item.pdfKey || item.name);
}

for (const pdfName of Object.keys(DUMPLING_HOUSE_PDF_ALLERGENS)) {
  if (!dishRows.some((d) => d.name === pdfName) && DUMPLING_HOUSE_PDF_ALLERGENS[pdfName].length) {
    addDish(pdfName, "entrante", pdfName);
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

const allergiesJson = JSON.stringify(dakinisSerializeAllergenProfile(checklist, dishRows));
const configJson = JSON.stringify(dumplingBuildConfigJson());

function toB64(text) {
  return Buffer.from(text, "utf8").toString("base64");
}

/** Sin ";" en el literal: evita que el SQL Editor de Supabase parta el script. */
function sqlUpdateFromB64({ table, setCols, whereCol, whereVal, b64 }) {
  const sets = setCols
    .map((col) => `${col} = convert_from(decode('${b64}', 'base64'), 'UTF8')`)
    .join(",\n  ");
  return `-- 1 fila: WHERE ${whereCol} = '${whereVal}'
UPDATE ${table}
SET
  ${sets}
WHERE ${whereCol} = '${whereVal}';
`;
}

const sqlA = `-- Dumpling House — menú + hongos (config_json)
-- Proyecto Supabase Core (dakinis_core_prod). Ejecutar SOLO este archivo (Run).

${sqlUpdateFromB64({
  table: "dakinis_core_prod.business",
  setCols: ["config_json"],
  whereCol: "slug",
  whereVal: "dumpling-house",
  b64: toB64(configJson)
})}`;

const sqlB = `-- Dumpling House — alérgenos + hongos (allergies_json)
-- Proyecto Supabase Core. Ejecutar DESPUÉS de 05a (Run de este archivo solo).

${sqlUpdateFromB64({
  table: "dakinis_core_prod.tenant_restaurant_profile",
  setCols: ["allergies_json", "updated_at = now()"],
  whereCol: "business_id",
  whereVal: "biz_dumpling_house",
  b64: toB64(allergiesJson)
})}`;

// Fix updated_at - it's not base64, need separate handling
const sqlBFixed = `-- Dumpling House — alérgenos + hongos (allergies_json)
-- Proyecto Supabase Core. Ejecutar DESPUÉS de 05a (Run de este archivo solo).

UPDATE dakinis_core_prod.tenant_restaurant_profile
SET
  allergies_json = convert_from(decode('${toB64(allergiesJson)}', 'base64'), 'UTF8'),
  updated_at = now()
WHERE business_id = 'biz_dumpling_house';
`;

const sqlIndex = `-- Dumpling House — actualización hongos (UDON / Pad Thai / Noodles)
-- NO ejecutar este archivo entero en Supabase (el editor avisa por ";" dentro del JSON).
--
-- Ejecutar en orden, cada uno con Run:
--   1) 05a-dumpling-house-config-update.sql
--   2) 05b-dumpling-house-allergies-update.sql
--
-- Alternativa: node platform/core/api/scripts/seed-dumpling-house.mjs
`;

fs.writeFileSync(path.join(seedsDir, "05-dumpling-house-mushrooms-update.sql"), sqlIndex);
fs.writeFileSync(path.join(seedsDir, "05a-dumpling-house-config-update.sql"), sqlA);
fs.writeFileSync(path.join(seedsDir, "05b-dumpling-house-allergies-update.sql"), sqlBFixed);
console.log("written 05 (index), 05a, 05b");
