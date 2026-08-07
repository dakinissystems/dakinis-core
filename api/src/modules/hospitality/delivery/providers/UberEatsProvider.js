/**
 * UberEatsProvider — stub hasta Marketplace API.
 * @type {import("../DeliveryProvider.js").DeliveryProvider}
 */
export const UberEatsProvider = {
  id: "ubereats",

  async importOrder(_ctx, rawOrder = {}) {
    const items = Array.isArray(rawOrder.items) ? rawOrder.items : Array.isArray(rawOrder.cart?.items) ? rawOrder.cart.items : [];
    return {
      channel: "ubereats",
      customer: {
        name: rawOrder.eater?.first_name
          ? `${rawOrder.eater.first_name} ${rawOrder.eater.last_name || ""}`.trim()
          : rawOrder.customerName || "Cliente Uber",
        phone: rawOrder.eater?.phone || ""
      },
      lines: items.map((p) => ({
        menuId: p.id || p.external_data,
        name: String(p.title || p.name || "Producto"),
        qty: Number(p.quantity || 1) || 1,
        unitPrice: Number(p.price?.amount ?? p.price ?? 0) / (p.price?.amount != null ? 100 : 1),
        notes: String(p.special_instructions || "")
      })),
      payment: { method: "ubereats", status: "paid" },
      delivery: {
        address: rawOrder.eater?.delivery?.location?.street_address_line_one || "",
        code: rawOrder.id || rawOrder.display_id
      },
      notes: String(rawOrder.special_instructions || ""),
      externalOrderId: String(rawOrder.id || rawOrder.order_id || ""),
      raw: rawOrder
    };
  },

  async acceptOrder() {
    return { ok: false, error: "Uber Eats API no configurada (partner)" };
  },
  async rejectOrder() {
    return { ok: false, error: "Uber Eats API no configurada (partner)" };
  },
  async cancelOrder() {
    return { ok: false, error: "Uber Eats API no configurada (partner)" };
  },
  async updateStatus(_ctx, _order, hospitalityStatus) {
    return { ok: false, externalStatus: this.mapStatusOut(hospitalityStatus), error: "Uber Eats API no configurada" };
  },
  async printFlags() {
    return { kitchen: true, receipt: false };
  },
  async health(ctx) {
    if (!ctx?.integration?.enabled) return { ok: false, status: "disabled" };
    if (!ctx?.integration?.api_key && !ctx?.integration?.refresh_token) {
      return { ok: false, status: "error_token", detail: "Falta OAuth / api credentials" };
    }
    return { ok: false, status: "stub", detail: "Esperando Uber Eats Marketplace API" };
  },
  mapStatusOut(hospitalityStatus) {
    const map = { nueva: "accepted", cocina: "preparing", lista: "ready_for_pickup", entregada: "delivered", cancelada: "cancelled" };
    return map[String(hospitalityStatus)] || "accepted";
  },
  mapStatusIn(externalStatus) {
    const s = String(externalStatus || "").toLowerCase();
    if (s.includes("prepar")) return "cocina";
    if (s.includes("ready")) return "lista";
    if (s.includes("cancel")) return "cancelada";
    if (s.includes("deliver")) return "entregada";
    return "nueva";
  }
};
