import {
  dakinisBarbershopPremiumAdapter,
  dakinisClinicEstheticAdapter,
  dakinisRealEstateAdapter,
  dakinisRestauranteAdapter,
  dakinisGenericServiceAdapter
} from "@dakinis/shared";
import { DAKINIS_CORE_INDUSTRY_KEYS } from "@dakinis/shared/catalog/business-templates.js";

const adapterMap = {
  clinica: dakinisClinicEstheticAdapter,
  peluqueria: dakinisBarbershopPremiumAdapter,
  restaurante: dakinisRestauranteAdapter,
  inmobiliaria: dakinisRealEstateAdapter,
  platform: {},
  custom: dakinisGenericServiceAdapter
};

for (const key of DAKINIS_CORE_INDUSTRY_KEYS) {
  if (!adapterMap[key]) adapterMap[key] = dakinisGenericServiceAdapter;
}

export function dakinisResolveAdapter(adapterKey) {
  return adapterMap[adapterKey] || adapterMap.custom;
}
