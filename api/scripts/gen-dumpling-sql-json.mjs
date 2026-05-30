import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DAKINIS_RESTAURANT_FULL_CATALOG, dakinisSerializeAllergenProfile } from "@dakinis/shared/catalog/restaurant-allergens.js";
import {
  dumplingBuildConfigJson,
  dumplingBuildDedupedDishRows,
  dumplingMushroomCustomAllergenRow
} from "../../../../docs/supabase/seeds/dumpling-house-data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { dishRows, catalogHits } = dumplingBuildDedupedDishRows();

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

const out = {
  allergies: dakinisSerializeAllergenProfile(checklist, [...dishRows, dumplingMushroomCustomAllergenRow()]),
  config: dumplingBuildConfigJson()
};

const target = path.resolve(__dirname, "../../../../docs/supabase/seeds/.dumpling-generated.json");
fs.writeFileSync(target, JSON.stringify(out, null, 2));
console.log(`Wrote ${target} (${dishRows.length} unique dishes)`);
