/** Etiquetas para tipos predefinidos del catálogo (clave API en minúsculas). */
import { DAKINIS_CORE_INDUSTRY_KEYS, DAKINIS_INDUSTRY_TEMPLATES } from "./business-templates.js";

const DAKINIS_KNOWN_TYPE_LABELS = {
  clinica: "Clínica",
  peluqueria: "Peluquería",
  restaurante: "Restaurante",
  inmobiliaria: "Inmobiliaria",
  platform: "Plataforma",
  ...Object.fromEntries(
    DAKINIS_CORE_INDUSTRY_KEYS.filter((k) => !["clinica", "peluqueria", "restaurante", "inmobiliaria"].includes(k)).map(
      (k) => [k, DAKINIS_INDUSTRY_TEMPLATES[k]?.label || k]
    )
  )
};

const PRESET_TYPES = new Set([...DAKINIS_CORE_INDUSTRY_KEYS]);

/**
 * Texto para UI: tipos conocidos con nombre legible; otros → cada palabra con mayúscula inicial.
 * @param {string} type
 * @returns {string}
 */
export function dakinisFormatBusinessTypeLabel(type) {
  if (!type || typeof type !== "string") return "";
  const key = type.trim().toLowerCase();
  if (DAKINIS_KNOWN_TYPE_LABELS[key]) {
    return DAKINIS_KNOWN_TYPE_LABELS[key];
  }
  return key
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normaliza un tipo enviado por formulario a clave API (minúsculas, guiones).
 * @param {string} raw
 * @returns {string}
 */
export function dakinisNormalizeBusinessTypeKey(raw) {
  if (typeof raw !== "string") return "";
  const lower = raw.trim().toLowerCase().replace(/\s+/g, "-");
  return lower
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Valida tipo para persistencia: presets del catálogo, `platform` si allowPlatform, o clave personalizada tipo slug.
 * @param {string} type
 * @param {{ allowPlatform?: boolean }} [options]
 * @returns {boolean}
 */
export function dakinisIsValidBusinessTypeKey(type, options = {}) {
  const { allowPlatform = false } = options;
  if (!type || typeof type !== "string") return false;
  const t = type.trim().toLowerCase();
  if (allowPlatform && t === "platform") return true;
  if (PRESET_TYPES.has(t)) return true;
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(t) && t.length >= 2 && t.length <= 48;
}
