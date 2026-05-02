import {
  dakinisBarbershopPremiumAdapter,
  dakinisClinicEstheticAdapter,
  dakinisRealEstateAdapter,
  dakinisRestauranteAdapter
} from "@dakinis/shared";

const adapterMap = {
  clinica: dakinisClinicEstheticAdapter,
  peluqueria: dakinisBarbershopPremiumAdapter,
  restaurante: dakinisRestauranteAdapter,
  inmobiliaria: dakinisRealEstateAdapter,
  platform: {},
  custom: {}
};

export function dakinisResolveAdapter(adapterKey) {
  return adapterMap[adapterKey] || adapterMap.custom;
}
