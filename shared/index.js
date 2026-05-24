export { dakinisCreateConfig, dakinisValidateConfig, DAKINIS_DEFAULT_CONFIG } from "./core/config.js";
export { dakinisCreatePlatformModules } from "./core/factory.js";
export {
  dakinisRegisterModule,
  dakinisGetRegisteredModules,
  dakinisGetModule,
  dakinisBootstrapCoreModules
} from "./core/modules/registry.js";

export { dakinisClinicEstheticAdapter } from "./adapters/clinic-esthetic.js";
export { dakinisBarbershopPremiumAdapter } from "./adapters/barbershop-premium.js";
export { dakinisRealEstateAdapter } from "./adapters/real-estate.js";
export { dakinisRestauranteAdapter } from "./adapters/restaurante.js";
