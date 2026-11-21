/** Eventos de dominio hospitality — paquete propio (ADR-014). */

import {
  dakinisNewOutboxEventId,
  dakinisOutboxEnqueue,
  dakinisOutboxShouldPersist
} from "../../../lib/domain-outbox.js";

export const DAKINIS_HOSPITALITY_EVENTS = Object.freeze({
  OrderImported: "OrderImported",
  OrderValidated: "OrderValidated",
  OrderRejected: "OrderRejected",
  OrderCreated: "OrderCreated",
  OrderStatusChanged: "OrderStatusChanged",
  OrderPaid: "OrderPaid",
  KitchenStarted: "KitchenStarted",
  KitchenReady: "KitchenReady",
  DriverAssigned: "DriverAssigned",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  RefundRequested: "RefundRequested",
  RefundCompleted: "RefundCompleted",

  TableOpened: "TableOpened",
  TableClosed: "TableClosed",
  MenuUpdated: "MenuUpdated",
  InvoiceGenerated: "InvoiceGenerated",
  InvoiceCreated: "InvoiceCreated",
  StockReduced: "StockReduced",
  CashClosed: "CashClosed"
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
  const eventId =
    typeof payload.eventId === "string" && payload.eventId
      ? payload.eventId
      : dakinisNewOutboxEventId("hevt");
  const envelope = { event: key, at: new Date().toISOString(), eventId, ...payload };

  // B3: durable outbox for sale/stock domain events (best-effort; never blocks emit).
  if (dakinisOutboxShouldPersist(key)) {
    const businessId = payload.businessId || "";
    const stableId =
      payload.eventId ||
      (payload.referenceId ? `${key}:${payload.referenceId}:${payload.stockId || payload.orderId || ""}` : eventId);
    dakinisOutboxEnqueue({
      businessId,
      eventType: key,
      eventId: String(stableId),
      payload: envelope
    }).catch((err) => {
      console.warn(`[hospitality:outbox] ${key}`, err instanceof Error ? err.message : err);
    });
  }

  const set = listeners.get(key);
  if (!set || !set.size) return;
  for (const handler of set) {
    try {
      handler(envelope);
    } catch (err) {
      console.warn(`[hospitality:event] ${key} listener error`, err?.message || err);
    }
  }
}

/** Listeners stub Fase 1 (prep KDS / stock / CRM / connectors). */
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
  // Lazy import avoids circular dependency (bridge → events).
  import("../hub-timeline-bridge.js")
    .then((m) => m.dakinisRegisterHospitalityHubTimelineBridge())
    .catch((err) => {
      console.warn(
        "[hospitality] hub timeline bridge failed to register:",
        err instanceof Error ? err.message : err
      );
    });
}
