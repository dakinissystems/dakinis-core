/**
 * Interfaz DeliveryProvider (contrato JSDoc — sin TypeScript).
 *
 * Cada marketplace implementa estos métodos. OrderService NUNCA hace if(channel==="glovo").
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
 * @typedef {object} DeliveryProvider
 * @property {string} id
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
