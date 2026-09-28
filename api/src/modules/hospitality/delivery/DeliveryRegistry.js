/**
 * DeliveryRegistry — registro de conectores de canal.
 *
 * Instalar un proveedor nuevo:
 *   dakinisDeliveryRegistry.register(new BoltProvider())
 * sin tocar OrderService / DeliveryService.
 *
 * @typedef {import("./DeliveryProvider.js").DeliveryProvider} DeliveryProvider
 */

import { dakinisAssertDeliveryProvider, dakinisProviderResilience } from "./DeliveryProvider.js";

/** @type {Map<string, DeliveryProvider>} */
const REGISTRY = new Map();

export const dakinisDeliveryRegistry = {
  /**
   * @param {DeliveryProvider} provider
   */
  register(provider) {
    if (!dakinisAssertDeliveryProvider(provider)) {
      throw new Error(`DeliveryProvider inválido: ${provider?.id}`);
    }
    REGISTRY.set(String(provider.id).toLowerCase(), provider);
    return this;
  },

  /**
   * @param {string} providerId
   * @returns {DeliveryProvider|null}
   */
  resolve(providerId) {
    const id = String(providerId || "").toLowerCase();
    if (id === "uber") return REGISTRY.get("ubereats") || null;
    return REGISTRY.get(id) || null;
  },

  /**
   * @returns {DeliveryProvider[]}
   */
  list() {
    return [...REGISTRY.values()];
  },

  /**
   * Health agregado de todos los providers registrados (sin tenant).
   * Para health por tenant usar dakinisListDeliveryProviderHealth(businessId).
   */
  async health() {
    const out = [];
    for (const provider of REGISTRY.values()) {
      const resilience = dakinisProviderResilience(provider);
      try {
        const h = await provider.health({ businessId: "", integration: null });
        out.push({
          provider: provider.id,
          status: h.status || (h.ok ? "connected" : "error"),
          ok: !!h.ok,
          detail: h.detail || null,
          resilience
        });
      } catch (err) {
        out.push({
          provider: provider.id,
          status: "error",
          ok: false,
          detail: err instanceof Error ? err.message : String(err),
          resilience
        });
      }
    }
    return out;
  },

  size() {
    return REGISTRY.size;
  },

  clearForTests() {
    REGISTRY.clear();
  }
};

/** Alias histórico */
export function dakinisGetDeliveryProvider(providerId) {
  return dakinisDeliveryRegistry.resolve(providerId);
}

export function dakinisListDeliveryProviders() {
  return dakinisDeliveryRegistry.list();
}

export function dakinisRegisterDeliveryProvider(provider) {
  return dakinisDeliveryRegistry.register(provider);
}
