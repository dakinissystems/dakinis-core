/**
 * Alérgenos que deben poder declararse en restaurantes (UE — Reg. 1169/2011, Anexo II).
 * Uso: checklist en admin + cartel QR público.
 */

import { dakinisDumplingResolvePdfKey } from "./dumpling-pdf-aliases.js";
import {
  dakinisParseMushroomTypesFromNotes,
  dakinisResolveMushroomSelection
} from "./restaurant-mushrooms.js";

export const DAKINIS_RESTAURANT_ALLERGEN_CATALOG = [
  { id: "gluten", name: "Gluten", category: "Cereales", hint: "Trigo, centeno, cebada, avena, harina, pan, pasta, tapas" },
  { id: "crustaceans", name: "Crustáceos", category: "Marisco", hint: "Gambas, langostinos, cangrejo, etc." },
  { id: "eggs", name: "Huevos", category: "Huevo", hint: "Huevo y derivados (mayonesa, masas, empanadas)" },
  { id: "fish", name: "Pescado", category: "Pescado", hint: "Pescado y productos a base de pescado" },
  { id: "peanuts", name: "Cacahuetes", category: "Frutos secos", hint: "Cacahuetes y derivados" },
  { id: "soy", name: "Soja", category: "Soja", hint: "Soja y derivados (salsa, tofu, lecitina)" },
  { id: "milk", name: "Leche", category: "Lácteos", hint: "Leche y derivados (mantequilla, queso, nata)" },
  { id: "nuts", name: "Frutos de cáscara", category: "Frutos secos", hint: "Almendras, avellanas, nueces, anacardos, etc." },
  { id: "celery", name: "Apio", category: "Verdura", hint: "Apio y productos que lo contengan" },
  { id: "mustard", name: "Mostaza", category: "Condimento", hint: "Mostaza y derivados" },
  { id: "sesame", name: "Sésamo", category: "Semillas", hint: "Sésamo y aceite de sésamo" },
  { id: "sulphites", name: "Sulfitos", category: "Conservantes", hint: "SO₂ >10 mg/kg o mg/l (vinos, conservas)" },
  { id: "lupin", name: "Altramuz", category: "Legumbre", hint: "Altramuz y harinas" },
  { id: "molluscs", name: "Moluscos", category: "Marisco", hint: "Mejillones, almejas, pulpo, calamares, etc." }
];

/** Intolerancias frecuentes (no obligatorias UE, útiles en carta). */
export const DAKINIS_RESTAURANT_EXTRA_ALLERGENS = [
  { id: "lactose", name: "Lactosa", category: "Intolerancia", hint: "Intolerancia a la lactosa (no alérgico estricto)" },
  { id: "vegan", name: "Vegano / vegetariano", category: "Preferencia", hint: "Platos sin ingredientes de origen animal" }
];

export const DAKINIS_RESTAURANT_FULL_CATALOG = [
  ...DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  ...DAKINIS_RESTAURANT_EXTRA_ALLERGENS
];

/**
 * @param {Array} saved — filas guardadas en allergies_json
 * @returns {Array} checklist con present true/false
 */
export function dakinisMergeAllergenChecklist(saved = []) {
  const byCatalog = new Map();
  const custom = [];

  for (const row of saved) {
    if (!row || typeof row !== "object") continue;
    if (row.catalogId) {
      byCatalog.set(row.catalogId, row);
      continue;
    }
    if (row.name) {
      const name = String(row.name).trim();
      const match = DAKINIS_RESTAURANT_FULL_CATALOG.find(
        (c) => c.name.toLowerCase() === name.toLowerCase() || c.id === name.toLowerCase()
      );
      if (match) {
        byCatalog.set(match.id, {
          ...row,
          catalogId: match.id,
          present: row.present !== false
        });
      } else {
        custom.push({
          id: row.id || `custom_${name}`,
          catalogId: null,
          name,
          category: row.category || "Otro",
          hint: row.hint || "",
          present: row.present !== false,
          severity: row.severity || "info",
          notes: row.notes || "",
          mushroomTypes: dakinisResolveMushroomSelection(row.mushroomTypes, row.notes),
          canonicalKey: row.canonicalKey || null
        });
      }
    }
  }

  const checklist = DAKINIS_RESTAURANT_FULL_CATALOG.map((item) => {
    const hit = byCatalog.get(item.id);
    return {
      catalogId: item.id,
      name: item.name,
      category: item.category,
      hint: item.hint,
      present: hit ? Boolean(hit.present) : false,
      severity: hit?.severity || "alta",
      notes: hit?.notes || ""
    };
  });

  return { checklist, customAllergies: custom };
}

/** Solo alérgenos marcados como presentes en el local (cartel QR). */
export function dakinisAllergensForPublicDisplay(saved = []) {
  const { checklist, customAllergies } = dakinisMergeAllergenChecklist(saved);
  const present = [
    ...checklist.filter((a) => a.present),
    ...customAllergies.filter((a) => a.present && a.name)
  ];
  return present.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

/** Categorías de filas customAllergies que son platos de carta (no fila resumen UE). */
export const DAKINIS_RESTAURANT_DISH_CATEGORIES = new Set([
  "Combo",
  "Entrante",
  "Clásico",
  "Plato principal",
  "Plato",
  "Arroz",
  "Noodles"
]);

/**
 * Nombre legible en cartel QR: quita cantidades al inicio (2 ROLLITO…) y al final (4 UDS, 8UDS).
 * @param {string} name
 * @returns {string}
 */
export function dakinisFormatPublicDishName(name = "") {
  let s = String(name).trim();
  if (!s) return "";
  s = s.replace(/^\d+\s+/, "");
  s = s.replace(/\s+\d+\s*UDS?\b/gi, "");
  return s.replace(/\s{2,}/g, " ").trim() || String(name).trim();
}

/** Clave para deduplicar platos con el mismo nombre visible. */
export function dakinisPublicDishDisplayKey(name = "") {
  return dakinisFormatPublicDishName(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

const PDF_STYLE_NAME_RE =
  /^(GYOZA|SIUMAI|MINI PAN|BAO DE|BAO CREMA|WANTUN|HAKAO|PADTHAI|UDON CON|NOODLES VEGETAL|ROLLITO VIETNAMITA|ROLLITO LANGOSTINO Y MANGO|ROLLITO VEGETAL \d)/i;

/**
 * Elige el nombre de carta más corto / legible al fusionar duplicados.
 * @param {string} candidate
 * @param {string} current
 */
export function dakinisPreferPublicDishLabel(candidate, current) {
  const c = dakinisFormatPublicDishName(candidate);
  const cur = dakinisFormatPublicDishName(current);
  if (!cur) return true;
  if (!c) return false;
  if (PDF_STYLE_NAME_RE.test(cur) && !PDF_STYLE_NAME_RE.test(c)) return true;
  if (!PDF_STYLE_NAME_RE.test(cur) && PDF_STYLE_NAME_RE.test(c)) return false;
  if (c.length !== cur.length) return c.length < cur.length;
  return c.localeCompare(cur, "es") < 0;
}

/**
 * Clave única de plato (ficha PDF / menú). Usa canonicalKey guardado en seed.
 * @param {object} row
 */
export function dakinisDishRowCanonicalKey(row) {
  if (row?.canonicalKey) return String(row.canonicalKey).toLowerCase().trim();
  return dakinisDumplingResolvePdfKey(row?.name || "").toLowerCase().trim();
}

/**
 * Separa notas de plato: "Huevo, Soja, Gluten. Hongos que pueden…"
 * @returns {{ allergens: string[], extra: string }}
 */
export function dakinisParseDishAllergenNotes(notes = "") {
  const raw = String(notes || "").trim();
  if (!raw) return { allergens: [], extra: "" };
  if (/sin alérgenos declarados/i.test(raw)) return { allergens: [], extra: raw };

  let allergenPart = raw;
  let extra = "";
  const dot = raw.indexOf(". ");
  if (dot > 0) {
    allergenPart = raw.slice(0, dot);
    extra = raw.slice(dot + 2).trim();
  }
  const allergens = allergenPart
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { allergens, extra };
}

/**
 * Vista pública: platos (carta) vs avisos (ej. hongos) vs resumen UE por alérgeno.
 * @param {Array} presentList — salida de dakinisAllergensForPublicDisplay
 */
export function dakinisSplitPublicAllergenDisplay(presentList = []) {
  const dishesMap = new Map();
  const infoRows = [];
  const catalogRows = [];

  for (const row of presentList) {
    if (!row?.name) continue;
    if (row.catalogId) {
      catalogRows.push(row);
      continue;
    }
    if (row.category === "Ingredientes" || row.id === "custom_hongos_noodles") {
      infoRows.push(row);
      continue;
    }
    if (!DAKINIS_RESTAURANT_DISH_CATEGORIES.has(row.category) && !String(row.id || "").startsWith("dish_")) {
      infoRows.push(row);
      continue;
    }

    const key = dakinisDishRowCanonicalKey(row);
    const parsed = dakinisParseDishAllergenNotes(row.notes);
    const mushroomTags = dakinisParseMushroomTypesFromNotes(parsed.extra);
    const entry = {
      id: row.id || `dish_${key.replace(/\s+/g, "_").slice(0, 48)}`,
      name: row.name,
      canonicalKey: row.canonicalKey || key,
      displayName: dakinisFormatPublicDishName(row.name),
      category: row.category || "Plato",
      notes: row.notes || "",
      allergenTags: parsed.allergens,
      extraNotes: parsed.extra,
      mushroomTags
    };
    const prev = dishesMap.get(key);
    if (!prev || dakinisPreferPublicDishLabel(entry.name, prev.name)) {
      entry.displayName = dakinisFormatPublicDishName(entry.name);
      dishesMap.set(key, entry);
    } else if (prev && entry.allergenTags.length > prev.allergenTags.length) {
      prev.allergenTags = entry.allergenTags;
      prev.extraNotes = entry.extraNotes;
      prev.mushroomTags = entry.mushroomTags;
      prev.notes = entry.notes;
    }
  }

  return {
    dishes: dakinisEnrichPublicDishesList([...dishesMap.values()]),
    infoRows,
    catalogRows
  };
}

/**
 * displayName, dedupe por nombre visible y orden A–Z (vista QR).
 * @param {Array} dishList
 */
export function dakinisEnrichPublicDishesList(dishList = []) {
  const map = new Map();
  for (const d of dishList) {
    if (!d?.name) continue;
    const key = dakinisDishRowCanonicalKey(d);
    const entry = {
      ...d,
      canonicalKey: d.canonicalKey || key,
      displayName: d.displayName || dakinisFormatPublicDishName(d.name)
    };
    const prev = map.get(key);
    if (!prev || dakinisPreferPublicDishLabel(entry.name, prev.name)) {
      entry.displayName = dakinisFormatPublicDishName(entry.name);
      map.set(key, entry);
    } else if (prev && (entry.allergenTags?.length ?? 0) > (prev.allergenTags?.length ?? 0)) {
      prev.allergenTags = entry.allergenTags;
      prev.extraNotes = entry.extraNotes;
      prev.mushroomTags = entry.mushroomTags;
      prev.notes = entry.notes;
    }
  }
  return [...map.values()].sort((a, b) => a.displayName.localeCompare(b.displayName, "es"));
}

/** Serializa checklist + custom para guardar en profile. */
export function dakinisSerializeAllergenProfile(checklist = [], customAllergies = []) {
  const rows = checklist.map((a) => ({
    catalogId: a.catalogId,
    name: a.name,
    category: a.category,
    present: Boolean(a.present),
    severity: a.severity || "alta",
    notes: String(a.notes || "").trim()
  }));
  for (const c of customAllergies) {
    if (!c.name?.trim()) continue;
    const row = {
      id: c.id || `custom_${Date.now()}`,
      name: c.name.trim(),
      category: c.category || "Otro",
      present: Boolean(c.present),
      severity: c.severity || "info",
      notes: String(c.notes || "").trim()
    };
    if (Array.isArray(c.mushroomTypes) && c.mushroomTypes.length) {
      row.mushroomTypes = c.mushroomTypes.map((s) => String(s).trim()).filter(Boolean);
    }
    if (c.canonicalKey) row.canonicalKey = String(c.canonicalKey).trim();
    rows.push(row);
  }
  return rows;
}
