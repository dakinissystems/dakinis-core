/**
 * JustEatProvider — stub.
 * @type {import("../DeliveryProvider.js").DeliveryProvider}
 */
export const JustEatProvider = {
  id: "justeat",

  async importOrder(_ctx, rawOrder = {}) {
    const lines = Array.isArray(rawOrder.lines) ? rawOrder.lines : Array.isArray(rawOrder.orderItems) ? rawOrder.orderItems : [];
    return {
      channel: "justeat",
      customer: {
        name: rawOrder.customer?.name || rawOrder.customerName || "Cliente Just Eat",
        phone: rawOrder.customer?.phoneNumber || rawOrder.customer?.phone || ""
      },
      lines: lines.map((p) => ({
        menuId: p.menuItemId || p.id,
        name: String(p.name || p.productName || "Producto"),
        qty: Number(p.quantity || p.qty || 1) || 1,
        unitPrice: Number(p.unitPrice || p.price || 0),
        notes: String(p.customerNotes || p.notes || "")
      })),
      payment: { method: "justeat", status: "paid" },
      delivery: {
        address: rawOrder.deliveryAddress?.lines?.join(", ") || rawOrder.address || "",
        code: rawOrder.friendlyOrderReference || rawOrder.id
      },
      notes: String(rawOrder.restaurantNotes || rawOrder.notes || ""),
      externalOrderId: String(rawOrder.id || rawOrder.orderId || ""),
      raw: rawOrder
    };
  },

  async acceptOrder() {
    return { ok: false, error: "Just Eat API no configurada (partner)" };
  },
  async rejectOrder() {
    return { ok: false, error: "Just Eat API no configurada (partner)" };
  },
  async cancelOrder() {
    return { ok: false, error: "Just Eat API no configurada (partner)" };
  },
  async updateStatus(_ctx, _order, hospitalityStatus) {
    return { ok: false, externalStatus: this.mapStatusOut(hospitalityStatus), error: "Just Eat API no configurada" };
  },
  async printFlags() {
    return { kitchen: true, receipt: false };
  },
  async health(ctx) {
    if (!ctx?.integration?.enabled) return { ok: false, status: "disabled" };
    if (!ctx?.integration?.api_key) return { ok: false, status: "error_token", detail: "Falta api_key" };
    return { ok: false, status: "stub", detail: "Esperando Just Eat partner API" };
  },
  mapStatusOut(hospitalityStatus) {
    const map = { nueva: "accepted", cocina: "cooking", lista: "ready", entregada: "collected", cancelada: "cancelled" };
    return map[String(hospitalityStatus)] || "accepted";
  },
  mapStatusIn(externalStatus) {
    const s = String(externalStatus || "").toLowerCase();
    if (s.includes("cook") || s.includes("prepar")) return "cocina";
    if (s.includes("ready")) return "lista";
    if (s.includes("cancel")) return "cancelada";
    if (s.includes("collect") || s.includes("deliver")) return "entregada";
    return "nueva";
  }
};
