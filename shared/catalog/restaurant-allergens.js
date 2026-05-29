/**
 * Alérgenos que deben poder declararse en restaurantes (UE — Reg. 1169/2011, Anexo II).
 * Uso: checklist en admin + cartel QR público.
 */

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
          notes: row.notes || ""
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
  "Plato principal",
  "Plato",
  "Arroz",
  "Noodles"
]);

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

    const key = String(row.id || row.name).toLowerCase();
    if (dishesMap.has(key)) continue;
    const parsed = dakinisParseDishAllergenNotes(row.notes);
    dishesMap.set(key, {
      id: row.id || key,
      name: row.name,
      category: row.category || "Plato",
      notes: row.notes || "",
      allergenTags: parsed.allergens,
      extraNotes: parsed.extra
    });
  }

  const dishes = [...dishesMap.values()].sort(
    (a, b) =>
      a.category.localeCompare(b.category, "es") || a.name.localeCompare(b.name, "es")
  );

  return { dishes, infoRows, catalogRows };
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
    rows.push({
      id: c.id || `custom_${Date.now()}`,
      name: c.name.trim(),
      category: c.category || "Otro",
      present: Boolean(c.present),
      severity: c.severity || "info",
      notes: String(c.notes || "").trim()
    });
  }
  return rows;
}
