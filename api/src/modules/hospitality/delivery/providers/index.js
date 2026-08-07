import { ManualProvider } from "./ManualProvider.js";
import { GlovoProvider } from "./GlovoProvider.js";
import { UberEatsProvider } from "./UberEatsProvider.js";
import { JustEatProvider } from "./JustEatProvider.js";
import { FailureProvider, StressProvider, ReplayProvider } from "./QaProviders.js";
import {
  dakinisDeliveryRegistry,
  dakinisGetDeliveryProvider,
  dakinisListDeliveryProviders,
  dakinisRegisterDeliveryProvider
} from "../DeliveryRegistry.js";

dakinisDeliveryRegistry.register(ManualProvider);
dakinisDeliveryRegistry.register(GlovoProvider);
dakinisDeliveryRegistry.register(UberEatsProvider);
dakinisDeliveryRegistry.register(JustEatProvider);

/** QA — disponibles en registry; no aparecen en catálogo comercial salvo enable. */
dakinisDeliveryRegistry.register(FailureProvider);
dakinisDeliveryRegistry.register(StressProvider);
dakinisDeliveryRegistry.register(ReplayProvider);

export {
  ManualProvider,
  GlovoProvider,
  UberEatsProvider,
  JustEatProvider,
  FailureProvider,
  StressProvider,
  ReplayProvider,
  dakinisDeliveryRegistry,
  dakinisGetDeliveryProvider,
  dakinisListDeliveryProviders,
  dakinisRegisterDeliveryProvider
};
