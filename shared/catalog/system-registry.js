import {
  dakinisBarbershopPremiumAdapter,
  dakinisClinicEstheticAdapter,
  dakinisRealEstateAdapter,
  dakinisRestauranteAdapter
} from "../index.js";
import { DAKINIS_HOSPITALITY_TYPES, dakinisHospitalityLabel } from "./hospitality.js";
import { dakinisSystemModulesCatalog } from "./system-modules.js";

const dakinisAdapterCatalog = {
  clinica: dakinisClinicEstheticAdapter,
  peluqueria: dakinisBarbershopPremiumAdapter,
  restaurante: dakinisRestauranteAdapter,
  inmobiliaria: dakinisRealEstateAdapter
};

for (const type of DAKINIS_HOSPITALITY_TYPES) {
  dakinisAdapterCatalog[type] = dakinisRestauranteAdapter;
}

export function dakinisGetSystemRegistry() {
  return Object.entries(dakinisSystemModulesCatalog).reduce((acc, [systemKey, moduleInfo]) => {
    if (!dakinisAdapterCatalog[systemKey]) return acc;
    acc[systemKey] = {
      label: moduleInfo.label,
      modules: moduleInfo.modules,
      config: dakinisAdapterCatalog[systemKey]
    };
    return acc;
  }, {});
}

/** Alias de ruta `/sistema/hosteleria` y tipos hospitality → mismo hub que restaurante. */
export function dakinisResolveHospitalitySystemKey(verticalKey) {
  const key = String(verticalKey || "").trim().toLowerCase();
  if (key === "hosteleria" || key === "hospitality") return "restaurante";
  if (DAKINIS_HOSPITALITY_TYPES.includes(key)) return "restaurante";
  return key;
}

export function dakinisHospitalitySystemLabel(type) {
  return dakinisHospitalityLabel(type);
}
