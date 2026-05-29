/**
 * Declaración opcional de hongos (no alérgeno UE obligatorio).
 * Se guarda en customAllergies (fila «Hongos») y en notas de platos noodle.
 */

export const DAKINIS_MUSHROOM_INFO_ROW_ID = "custom_hongos_noodles";

/** Tipos habituales en cartas asiáticas (Dumpling House y similares). */
export const DAKINIS_RESTAURANT_MUSHROOM_OPTIONS = [
  { id: "shiitake", name: "Shiitake" },
  { id: "porcini", name: "Porcini" },
  { id: "trufa", name: "Trufa" },
  { id: "champinon", name: "Champiñon" },
  { id: "matsutake", name: "Matsutake" },
  { id: "enoki", name: "Enoki" },
  { id: "huitlacoche", name: "Huitlacoche" },
  { id: "girgola", name: "Gírgola" }
];

const MUSHROOM_DISH_CLAUSE_RE =
  /Hongos que pueden estar presentes:\s*[^.]+\.\s*(?:Aplica a[^.]+\.\s*)?/gi;

const MUSHROOM_LIST_PREFIX_RE = /^Hongos que pueden estar presentes:\s*/i;

/**
 * @param {string} name
 * @returns {boolean}
 */
export function dakinisIsKnownMushroomName(name) {
  const n = String(name || "").trim().toLowerCase();
  return DAKINIS_RESTAURANT_MUSHROOM_OPTIONS.some((o) => o.name.toLowerCase() === n);
}

/**
 * @param {string[]|undefined} mushroomTypes
 * @param {string} [notes]
 * @returns {string[]}
 */
export function dakinisResolveMushroomSelection(mushroomTypes, notes = "") {
  if (Array.isArray(mushroomTypes) && mushroomTypes.length) {
    return mushroomTypes.map((s) => String(s).trim()).filter(Boolean);
  }
  return dakinisParseMushroomTypesFromNotes(notes);
}

/**
 * Extrae nombres de hongo desde la primera frase de notas (lista separada por comas).
 * @param {string} notes
 * @returns {string[]}
 */
export function dakinisParseMushroomTypesFromNotes(notes = "") {
  const raw = String(notes || "").trim();
  if (!raw) return [];

  let head = raw.split(/\.\s+/)[0].trim();
  head = head.replace(MUSHROOM_LIST_PREFIX_RE, "").trim();
  if (!head) return [];

  const knownNames = new Set(DAKINIS_RESTAURANT_MUSHROOM_OPTIONS.map((o) => o.name.toLowerCase()));
  const picked = [];

  for (const part of head.split(/,\s*/)) {
    const name = part.trim();
    if (!name) continue;
    if (knownNames.has(name.toLowerCase())) {
      const opt = DAKINIS_RESTAURANT_MUSHROOM_OPTIONS.find(
        (o) => o.name.toLowerCase() === name.toLowerCase()
      );
      if (opt && !picked.includes(opt.name)) picked.push(opt.name);
    }
  }

  if (picked.length) return picked;

  return head
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Texto del cartel / fila «Hongos».
 * @param {string[]} selected
 * @param {string} [appliesHint]
 */
export function dakinisBuildMushroomInfoNotes(
  selected = [],
  appliesHint = "Pueden estar presentes en UDON, Pad Thai y Noodles."
) {
  if (!selected.length) return "";
  const list = selected.join(", ");
  return `${list}. ${appliesHint}`;
}

/**
 * Frase en notas de plato noodle.
 * @param {string[]} selected
 */
export function dakinisBuildDishMushroomClause(selected = []) {
  if (!selected.length) return "";
  return `Hongos que pueden estar presentes: ${selected.join(", ")}. Aplica a UDON, Pad Thai y Noodles.`;
}

/**
 * @param {string} notes
 * @returns {string}
 */
export function dakinisStripMushroomClauseFromDishNotes(notes = "") {
  return String(notes || "")
    .replace(MUSHROOM_DISH_CLAUSE_RE, "")
    .replace(/\s*\.\s*\./g, ".")
    .replace(/^\.\s*/, "")
    .replace(/\s+\./g, ".")
    .trim();
}

/**
 * @param {string} notes
 * @param {string[]} selected
 * @returns {string}
 */
export function dakinisApplyMushroomClauseToDishNotes(notes = "", selected = []) {
  const base = dakinisStripMushroomClauseFromDishNotes(notes);
  const clause = dakinisBuildDishMushroomClause(selected);
  if (!clause) return base;
  if (!base) return clause;
  return `${base}. ${clause}`;
}

/**
 * @param {boolean} [notes]
 * @returns {boolean}
 */
export function dakinisDishNotesMentionMushrooms(notes = "") {
  return /hongos que pueden estar presentes/i.test(String(notes || ""));
}

/**
 * @param {Array} customAllergies
 * @returns {{ index: number, row: object } | null}
 */
export function dakinisFindMushroomInfoRow(customAllergies = []) {
  const idx = customAllergies.findIndex(
    (c) =>
      c?.id === DAKINIS_MUSHROOM_INFO_ROW_ID ||
      (String(c?.name || "").toLowerCase() === "hongos" && c?.category === "Ingredientes")
  );
  if (idx < 0) return null;
  return { index: idx, row: customAllergies[idx] };
}

/**
 * Actualiza fila Hongos y notas de platos que ya mencionan hongos.
 * @param {Array} customAllergies
 * @param {string[]} selected
 * @param {{ appliesHint?: string }} [opts]
 * @returns {Array}
 */
export function dakinisSyncMushroomsInCustomAllergies(customAllergies = [], selected = [], opts = {}) {
  const next = customAllergies.map((c) => ({ ...c }));
  const hit = dakinisFindMushroomInfoRow(next);

  if (hit) {
    const appliesHint =
      opts.appliesHint ||
      (hit.row.notes?.includes("UDON") ? hit.row.notes.split(". ").slice(1).join(". ") : null) ||
      "Pueden estar presentes en UDON, Pad Thai y Noodles.";
    next[hit.index] = {
      ...next[hit.index],
      present: selected.length > 0,
      mushroomTypes: selected,
      notes: selected.length ? dakinisBuildMushroomInfoNotes(selected, appliesHint) : ""
    };
  }

  for (let i = 0; i < next.length; i++) {
    if (i === hit?.index) continue;
    if (!dakinisDishNotesMentionMushrooms(next[i].notes)) continue;
    next[i] = {
      ...next[i],
      notes: dakinisApplyMushroomClauseToDishNotes(next[i].notes, selected)
    };
  }

  return next;
}

/**
 * Crea fila «Hongos» si no existe (p. ej. restaurante nuevo).
 * @param {Array} customAllergies
 * @param {string[]} [selected]
 */
export function dakinisEnsureMushroomInfoRow(customAllergies = [], selected = []) {
  if (dakinisFindMushroomInfoRow(customAllergies)) {
    return dakinisSyncMushroomsInCustomAllergies(customAllergies, selected);
  }
  const allNames = selected.length
    ? selected
    : DAKINIS_RESTAURANT_MUSHROOM_OPTIONS.map((o) => o.name);
  return [
    ...customAllergies,
    {
      id: DAKINIS_MUSHROOM_INFO_ROW_ID,
      name: "Hongos",
      category: "Ingredientes",
      present: allNames.length > 0,
      severity: "info",
      mushroomTypes: allNames,
      notes: dakinisBuildMushroomInfoNotes(allNames)
    }
  ];
}
