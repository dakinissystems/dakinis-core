/**
 * ManualProvider — simula un marketplace para pruebas sin API externa.
 * @type {import("./DeliveryProvider.js").DeliveryProvider}
 */
export const ManualProvider = {
  id: "manual",

  async importOrder(_ctx, rawOrder = {}) {
    const products = Array.isArray(rawOrder.products)
      ? rawOrder.products
      : Array.isArray(rawOrder.items)
        ? rawOrder.items
        : Array.isArray(rawOrder.lines)
          ? rawOrder.lines
          : [];

    const lines = products.map((p) => ({
      menuId: p.menuId || p.sku || p.id || undefined,
      name: String(p.name || p.title || "Producto").trim(),
      qty: Number(p.qty || p.quantity || 1) || 1,
      unitPrice: Number(p.unitPrice ?? p.price ?? 0) || 0,
      notes: String(p.notes || p.comment || "").trim()
    }));

    return {
      channel: "manual",
      customer: {
        name: rawOrder.customer?.name || rawOrder.customerName || "Cliente manual",
        phone: rawOrder.customer?.phone || rawOrder.phone || ""
      },
      lines,
      payment: rawOrder.payment || { method: "online", status: "paid" },
      delivery: rawOrder.delivery || {
        address: rawOrder.address || "Simulación",
        etaMinutes: Number(rawOrder.etaMinutes) || 35
      },
      notes: String(rawOrder.notes || rawOrder.comment || "").trim(),
      externalOrderId: String(rawOrder.order_id || rawOrder.externalOrderId || rawOrder.id || ""),
      raw: rawOrder
    };
  },

  async acceptOrder() {
    return { ok: true, externalStatus: "accepted" };
  },

  async rejectOrder() {
    return { ok: true };
  },

  async cancelOrder() {
    return { ok: true };
  },

  async updateStatus(_ctx, _order, hospitalityStatus) {
    return { ok: true, externalStatus: this.mapStatusOut(hospitalityStatus) };
  },

  async printFlags() {
    return { kitchen: true, receipt: true };
  },

  async health() {
    return { ok: true, status: "online", detail: "ManualProvider listo" };
  },

  mapStatusOut(hospitalityStatus) {
    const map = {
      nueva: "received",
      cocina: "preparing",
      lista: "ready",
      entregada: "delivered",
      cancelada: "cancelled"
    };
    return map[String(hospitalityStatus)] || "received";
  },

  mapStatusIn(externalStatus) {
    const map = {
      received: "nueva",
      accepted: "nueva",
      preparing: "cocina",
      cooking: "cocina",
      ready: "lista",
      delivered: "entregada",
      cancelled: "cancelada"
    };
    return map[String(externalStatus).toLowerCase()] || "nueva";
  }
};
