/**
 * Interfaz DeliveryProvider — conector de canal (Integration Platform).
 *
 * Pipeline del core (el provider NO orquesta esto):
 *   Channel → Import → Normalize → Validate → Create Order → Events → Sync
 *
 * Superficie mínima que debe conocer el proveedor:
 *   importOrder() | updateStatus() | cancelOrder() | health()
 *
 * El resto (accept/reject/printFlags/mapStatus*) son helpers opcionales pero
 * hoy se exigen para stubs homogéneos.
 *
 * Resiliencia (declarativa por provider — ver dakinisProviderResilience):
 *   timeoutMs · retries · circuitBreaker · rateLimit
 *
 * Idempotencia (requisito del core, no del provider):
 *   clave = provider + external_order_id
 *
 * @typedef {object} DeliveryProviderContext
 * @property {string} businessId
 * @property {object} [integration] fila tenant_delivery_integrations
 *
 * @typedef {object} HospitalityOrderDraft
 * @property {string} channel
 * @property {object} [customer]
 * @property {Array<{menuId?: string, name: string, qty: number, unitPrice?: number, notes?: string}>} lines
 * @property {object} [payment]
 * @property {object} [delivery]
 * @property {string} [notes]
 * @property {string} [externalOrderId]
 * @property {object} [raw]
 *
 * @typedef {object} ProviderResilience
 * @property {number} [timeoutMs]
 * @property {number} [retries]
 * @property {{ failureThreshold?: number, coolDownMs?: number }} [circuitBreaker]
 * @property {{ maxPerMinute?: number }} [rateLimit]
 *
 * @typedef {object} DeliveryProvider
 * @property {string} id
 * @property {ProviderResilience} [resilience]
 * @property {(ctx: DeliveryProviderContext, rawOrder: object) => Promise<HospitalityOrderDraft>} importOrder
 * @property {(ctx: DeliveryProviderContext, order: object) => Promise<{ok: boolean, externalStatus?: string}>} acceptOrder
 * @property {(ctx: DeliveryProviderContext, order: object, reason?: string) => Promise<{ok: boolean}>} rejectOrder
 * @property {(ctx: DeliveryProviderContext, order: object, reason?: string) => Promise<{ok: boolean}>} cancelOrder
 * @property {(ctx: DeliveryProviderContext, order: object, hospitalityStatus: string) => Promise<{ok: boolean, externalStatus?: string}>} updateStatus
 * @property {(ctx: DeliveryProviderContext, order: object) => Promise<{kitchen: boolean, receipt: boolean}>} printFlags
 * @property {(ctx: DeliveryProviderContext) => Promise<{ok: boolean, status: string, detail?: string}>} health
 * @property {(hospitalityStatus: string) => string} mapStatusOut
 * @property {(externalStatus: string) => string} mapStatusIn
 */

export const DAKINIS_DELIVERY_PROVIDER_METHODS = Object.freeze([
  "importOrder",
  "acceptOrder",
  "rejectOrder",
  "cancelOrder",
  "updateStatus",
  "printFlags",
  "health",
  "mapStatusOut",
  "mapStatusIn"
]);

/** Defaults de resiliencia si el provider no declara `resilience`. */
export const DAKINIS_PROVIDER_RESILIENCE_DEFAULTS = Object.freeze({
  timeoutMs: 8_000,
  retries: 5,
  circuitBreaker: Object.freeze({ failureThreshold: 5, coolDownMs: 60_000 }),
  rateLimit: Object.freeze({ maxPerMinute: 60 })
});

/**
 * @param {object} provider
 * @returns {typeof DAKINIS_PROVIDER_RESILIENCE_DEFAULTS & object}
 */
export function dakinisProviderResilience(provider) {
  const r = provider?.resilience || {};
  return {
    timeoutMs: Number(r.timeoutMs) > 0 ? Number(r.timeoutMs) : DAKINIS_PROVIDER_RESILIENCE_DEFAULTS.timeoutMs,
    retries: Number(r.retries) > 0 ? Number(r.retries) : DAKINIS_PROVIDER_RESILIENCE_DEFAULTS.retries,
    circuitBreaker: {
      failureThreshold:
        Number(r.circuitBreaker?.failureThreshold) > 0
          ? Number(r.circuitBreaker.failureThreshold)
          : DAKINIS_PROVIDER_RESILIENCE_DEFAULTS.circuitBreaker.failureThreshold,
      coolDownMs:
        Number(r.circuitBreaker?.coolDownMs) > 0
          ? Number(r.circuitBreaker.coolDownMs)
          : DAKINIS_PROVIDER_RESILIENCE_DEFAULTS.circuitBreaker.coolDownMs
    },
    rateLimit: {
      maxPerMinute:
        Number(r.rateLimit?.maxPerMinute) > 0
          ? Number(r.rateLimit.maxPerMinute)
          : DAKINIS_PROVIDER_RESILIENCE_DEFAULTS.rateLimit.maxPerMinute
    }
  };
}

/**
 * Valida que un provider implemente la interfaz.
 * @param {object} provider
 * @returns {boolean}
 */
export function dakinisAssertDeliveryProvider(provider) {
  if (!provider || typeof provider.id !== "string") return false;
  for (const m of DAKINIS_DELIVERY_PROVIDER_METHODS) {
    if (typeof provider[m] !== "function") return false;
  }
  return true;
}
