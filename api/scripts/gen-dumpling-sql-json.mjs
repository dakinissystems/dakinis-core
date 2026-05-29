import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DAKINIS_RESTAURANT_FULL_CATALOG, dakinisSerializeAllergenProfile } from "@dakinis/shared/catalog/restaurant-allergens.js";
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

function catLabel(c) {
  return { combo: "Combo", entrante: "Entrante", plato: "Plato principal", arroz: "Arroz", noodle: "Noodles" }[c] || c;
}

const dishRows = [];
const catalogHits = new Map();

function addDish(displayName, category, pdfKey) {
  const allergens = dumplingAllergensForPdfKey(pdfKey);
  const notes = allergens.length ? allergens.join(", ") : "Sin alérgenos declarados en carta";
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
  const notes = dishes?.size ? `Platos: ${[...dishes].sort().join("; ")}` : "";
  return {
    catalogId: c.id,
    name: c.name,
    category: c.category,
    present: Boolean(dishes?.size),
    severity: dishes?.size ? "alta" : "info",
    notes
  };
});

dishRows.push(dumplingMushroomCustomAllergenRow());

const out = {
  allergies: dakinisSerializeAllergenProfile(checklist, dishRows),
  config: dumplingBuildConfigJson()
};

const target = path.resolve(__dirname, "../../../../docs/supabase/seeds/_dumpling-payload.json");
fs.writeFileSync(target, JSON.stringify(out));
console.log("written", target, "rows", out.allergies.length);
