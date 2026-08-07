import { ManualProvider } from "./ManualProvider.js";
import { GlovoProvider } from "./GlovoProvider.js";
import { UberEatsProvider } from "./UberEatsProvider.js";
import { JustEatProvider } from "./JustEatProvider.js";
import { dakinisAssertDeliveryProvider } from "../DeliveryProvider.js";

const REGISTRY = new Map();

function dakinisRegister(provider) {
  if (!dakinisAssertDeliveryProvider(provider)) {
    throw new Error(`DeliveryProvider inválido: ${provider?.id}`);
  }
  REGISTRY.set(provider.id, provider);
}

dakinisRegister(ManualProvider);
dakinisRegister(GlovoProvider);
dakinisRegister(UberEatsProvider);
dakinisRegister(JustEatProvider);

export function dakinisGetDeliveryProvider(providerId) {
  const id = String(providerId || "").toLowerCase();
  if (id === "uber") return REGISTRY.get("ubereats");
  return REGISTRY.get(id) || null;
}

export function dakinisListDeliveryProviders() {
  return [...REGISTRY.values()];
}

export { ManualProvider, GlovoProvider, UberEatsProvider, JustEatProvider };
