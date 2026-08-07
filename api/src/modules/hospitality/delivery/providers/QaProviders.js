/**
 * QA providers — aceleran pruebas sin APIs partner.
 * Manual sigue siendo el default de demo; Failure / Stress / Replay son opt-in.
 */

import { ManualProvider } from "./ManualProvider.js";

function dakinisCloneManual(overrides) {
  return {
    ...ManualProvider,
    ...overrides,
    async importOrder(ctx, raw) {
      return ManualProvider.importOrder(ctx, raw);
    },
    mapStatusOut(s) {
      return ManualProvider.mapStatusOut(s);
    },
    mapStatusIn(s) {
      return ManualProvider.mapStatusIn(s);
    }
  };
}

/** Simula fallos de sync (accept/update) para probar cola + retries. */
export const FailureProvider = dakinisCloneManual({
  id: "failure",
  resilience: { timeoutMs: 2_000, retries: 3, circuitBreaker: { failureThreshold: 2, coolDownMs: 15_000 } },
  async acceptOrder() {
    return { ok: false, error: "FailureProvider: accept simulado" };
  },
  async updateStatus() {
    return { ok: false, error: "FailureProvider: updateStatus simulado" };
  },
  async health() {
    return { ok: false, status: "degraded", detail: "QA FailureProvider" };
  }
});

/** Genera N pedidos (stress) vía import; delays opcionales en raw. */
export const StressProvider = dakinisCloneManual({
  id: "stress",
  resilience: { timeoutMs: 15_000, retries: 2, rateLimit: { maxPerMinute: 600 } },
  async importOrder(ctx, raw = {}) {
    const draft = await ManualProvider.importOrder(ctx, {
      ...raw,
      order_id: raw.order_id || raw.externalOrderId || `STRESS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      customerName: raw.customerName || "Stress client",
      notes: raw.notes || "stress-test"
    });
    draft.channel = "stress";
    const delay = Number(raw.simulateDelayMs) || 0;
    if (delay > 0) await new Promise((r) => setTimeout(r, Math.min(delay, 5_000)));
    return draft;
  },
  async health() {
    return { ok: true, status: "online", detail: "QA StressProvider" };
  }
});

/** Reinyecta un payload raw guardado (replay webhook duplicado / histórico). */
export const ReplayProvider = dakinisCloneManual({
  id: "replay",
  async importOrder(ctx, raw = {}) {
    const payload = raw.replay || raw.raw || raw;
    const draft = await ManualProvider.importOrder(ctx, payload);
    draft.channel = "replay";
    draft.notes = [draft.notes, "replay"].filter(Boolean).join(" · ");
    return draft;
  },
  async health() {
    return { ok: true, status: "online", detail: "QA ReplayProvider" };
  }
});
