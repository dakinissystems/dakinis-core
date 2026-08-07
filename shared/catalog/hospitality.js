/**
 * Dominio Hospitality — verticales de hostelería que comparten el mismo core
 * (carta, mesas, comandas, cocina, stock). `restaurante` sigue siendo la clave canónica de UI.
 */

export const DAKINIS_HOSPITALITY_TYPES = Object.freeze([
  "restaurante",
  "burger",
  "pizzeria",
  "bar",
  "cafeteria",
  "heladeria",
  "foodtruck"
]);

const DAKINIS_HOSPITALITY_TYPE_SET = new Set(DAKINIS_HOSPITALITY_TYPES);

export const DAKINIS_HOSPITALITY_LABELS = Object.freeze({
  restaurante: "Restaurante",
  burger: "Hamburguesería",
  pizzeria: "Pizzería",
  bar: "Bar",
  cafeteria: "Cafetería",
  heladeria: "Heladería",
  foodtruck: "Food truck"
});

/** @param {string} type */
export function dakinisIsHospitalityBusiness(type) {
  return DAKINIS_HOSPITALITY_TYPE_SET.has(String(type || "").trim().toLowerCase());
}

/** @param {string} type */
export function dakinisHospitalityLabel(type) {
  const key = String(type || "").trim().toLowerCase();
  return DAKINIS_HOSPITALITY_LABELS[key] || key;
}

/**
 * Settings mínimas por vertical (Fase 1: labels + estaciones stub para KDS futuro).
 * @param {string} type
 */
export function dakinisHospitalityDefaults(type) {
  const key = String(type || "").trim().toLowerCase();
  const label = dakinisHospitalityLabel(key);
  const stationsByType = {
    burger: ["parrilla", "freidora", "bar", "postres"],
    pizzeria: ["horno", "freidora", "bar", "postres"],
    bar: ["barra", "cocina"],
    cafeteria: ["barra", "cocina", "pasteleria"],
    heladeria: ["mostrador", "obrador"],
    foodtruck: ["plancha", "freidora", "caja"],
    restaurante: ["cocina", "barra", "postres"]
  };
  return {
    vertical: key || "restaurante",
    label,
    defaultStations: stationsByType[key] || stationsByType.restaurante,
    features: {
      floor: true,
      menu: true,
      kitchen: true,
      inventory: true,
      invoices: true
    }
  };
}

/** Opciones para selects de admin (sin duplicar restaurante si ya está en catálogo). */
export function dakinisHospitalityTypeOptions() {
  return DAKINIS_HOSPITALITY_TYPES.map((key) => ({
    value: key,
    label: DAKINIS_HOSPITALITY_LABELS[key]
  }));
}

/** Adapter key canónico para registry / resolve. */
export function dakinisHospitalityAdapterKey(type) {
  return dakinisIsHospitalityBusiness(type) ? "restaurante" : String(type || "").toLowerCase();
}
