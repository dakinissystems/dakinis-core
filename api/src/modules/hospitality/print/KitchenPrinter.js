/**
 * KitchenPrinter — fachada de impresión de cocina sobre PrintAdapter.
 */

import { dakinisResolvePrintAdapter } from "./PrintAdapter.js";

/**
 * @param {object} order
 * @param {{ adapter?: string }} [opts]
 */
export async function dakinisKitchenPrint(order, opts = {}) {
  const adapter = dakinisResolvePrintAdapter(opts.adapter || process.env.DAKINIS_PRINT_ADAPTER || "mock");
  if (!adapter) {
    return { ok: false, detail: "Sin PrintAdapter" };
  }
  return adapter.print({
    kind: "kitchen",
    payload: {
      orderId: order?.id,
      orderNumber: order?.orderNumber,
      channel: order?.channel,
      lines: order?.lines || [],
      notes: order?.notes || "",
      table: order?.table || ""
    }
  });
}
