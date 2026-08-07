/** Eventos de dominio hospitality (in-process, sin Event Sourcing). */

export const DAKINIS_HOSPITALITY_EVENTS = Object.freeze({
  OrderCreated: "OrderCreated",
  OrderStatusChanged: "OrderStatusChanged",
  OrderPaid: "OrderPaid",
  TableOpened: "TableOpened",
  TableClosed: "TableClosed",
  MenuUpdated: "MenuUpdated",
  InvoiceGenerated: "InvoiceGenerated",
  StockReduced: "StockReduced",
  KitchenReady: "KitchenReady"
});

/** @type {Map<string, Set<(payload: object) => void>>} */
const listeners = new Map();

export function dakinisHospitalityOn(eventName, handler) {
  const key = String(eventName);
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(handler);
  return () => listeners.get(key)?.delete(handler);
}

export function dakinisHospitalityEmit(eventName, payload = {}) {
  const key = String(eventName);
  const set = listeners.get(key);
  if (!set || !set.size) return;
  for (const handler of set) {
    try {
      handler({ event: key, at: new Date().toISOString(), ...payload });
    } catch (err) {
      console.warn(`[hospitality:event] ${key} listener error`, err?.message || err);
    }
  }
}

/** Listeners stub Fase 1 (prep KDS / stock / CRM). */
export function dakinisRegisterHospitalityDefaultListeners() {
  const noopLog = (p) => {
    if (process.env.DAKINIS_HOSPITALITY_EVENT_LOG === "1") {
      console.info("[hospitality:event]", p.event, p.businessId || "", p.orderId || p.tableId || "");
    }
  };
  for (const name of Object.values(DAKINIS_HOSPITALITY_EVENTS)) {
    dakinisHospitalityOn(name, noopLog);
  }
}

let defaultsRegistered = false;
export function dakinisEnsureHospitalityEventDefaults() {
  if (defaultsRegistered) return;
  defaultsRegistered = true;
  dakinisRegisterHospitalityDefaultListeners();
}
