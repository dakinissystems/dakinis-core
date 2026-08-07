/**
 * PrintAdapter — interfaz independiente de Delivery/Kitchen.
 * Útil para comandas, facturas, etiquetas, lotes, QR.
 *
 * @typedef {"escpos"|"browser"|"cloud"|"pdf"|"mock"} PrintBackend
 *
 * @typedef {object} PrintJob
 * @property {string} kind  kitchen|receipt|invoice|label|batch|qr
 * @property {object} payload
 *
 * @typedef {object} PrintAdapter
 * @property {PrintBackend} id
 * @property {(job: PrintJob) => Promise<{ok: boolean, detail?: string}>} print
 * @property {() => Promise<{ok: boolean, status: string}>} health
 */

/** @type {Map<string, import("./PrintAdapter.js").PrintAdapter>} */
const ADAPTERS = new Map();

export function dakinisRegisterPrintAdapter(adapter) {
  if (!adapter?.id || typeof adapter.print !== "function") {
    throw new Error("PrintAdapter inválido");
  }
  ADAPTERS.set(adapter.id, adapter);
  return adapter;
}

export function dakinisResolvePrintAdapter(id = "mock") {
  return ADAPTERS.get(id) || ADAPTERS.get("mock") || null;
}

export function dakinisListPrintAdapters() {
  return [...ADAPTERS.values()];
}

/** Mock por defecto — no imprime, valida el flujo. */
export const MockPrintAdapter = {
  id: "mock",
  async print(job) {
    if (process.env.DAKINIS_PRINT_LOG === "1") {
      console.info("[print:mock]", job?.kind, Object.keys(job?.payload || {}));
    }
    return { ok: true, detail: "mock" };
  },
  async health() {
    return { ok: true, status: "online" };
  }
};

dakinisRegisterPrintAdapter(MockPrintAdapter);
