import {
  dakinisBarbershopPremiumAdapter,
  dakinisClinicEstheticAdapter,
  dakinisRealEstateAdapter
} from "../index.js";
import { dakinisSystemModulesCatalog } from "./system-modules.js";

const dakinisAdapterCatalog = {
  clinica: dakinisClinicEstheticAdapter,
  peluqueria: dakinisBarbershopPremiumAdapter,
  inmobiliaria: dakinisRealEstateAdapter
};

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
