import {
  dakinisBarbershopPremiumAdapter,
  dakinisClinicEstheticAdapter,
  dakinisRealEstateAdapter
} from "../index.js";

const adapterMap = {
  clinica: dakinisClinicEstheticAdapter,
  peluqueria: dakinisBarbershopPremiumAdapter,
  inmobiliaria: dakinisRealEstateAdapter,
  custom: {}
};

export function dakinisResolveAdapter(adapterKey) {
  return adapterMap[adapterKey] || adapterMap.custom;
}
