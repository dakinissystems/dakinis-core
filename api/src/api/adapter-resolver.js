import {
  dakinisBarbershopPremiumAdapter,
  dakinisClinicEstheticAdapter,
  dakinisRealEstateAdapter,
  dakinisRestauranteAdapter
} from "@dakinis/shared";
import { DAKINIS_HOSPITALITY_TYPES } from "@dakinis/shared/catalog/hospitality.js";

const adapterMap = {
  clinica: dakinisClinicEstheticAdapter,
  peluqueria: dakinisBarbershopPremiumAdapter,
  restaurante: dakinisRestauranteAdapter,
  inmobiliaria: dakinisRealEstateAdapter,
  platform: {},
  custom: {}
};

for (const type of DAKINIS_HOSPITALITY_TYPES) {
  adapterMap[type] = dakinisRestauranteAdapter;
}

export function dakinisResolveAdapter(adapterKey) {
  return adapterMap[adapterKey] || adapterMap.custom;
}
