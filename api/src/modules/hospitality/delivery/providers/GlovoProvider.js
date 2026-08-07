/**
 * GlovoProvider — stub hasta API partner oficial.
 * No hace llamadas reales; importOrder normaliza formato Glovo → HospitalityOrder.
 * @type {import("../DeliveryProvider.js").DeliveryProvider}
 */
export const GlovoProvider = {
  id: "glovo",
  resilience: {
    timeoutMs: 10_000,
    retries: 5,
    circuitBreaker: { failureThreshold: 5, coolDownMs: 60_000 },
    rateLimit: { maxPerMinute: 60 }
  },

  async importOrder(_ctx, rawOrder = {}) {
    const products = Array.isArray(rawOrder.products) ? rawOrder.products : [];
    return {
      channel: "glovo",
      customer: {
        name: rawOrder.customer?.name || rawOrder.customer_name || "Cliente Glovo",
        phone: rawOrder.customer?.phone || ""
      },
      lines: products.map((p) => ({
        menuId: p.id || p.sku,
        name: String(p.name || p.title || "Producto"),
        qty: Number(p.quantity || p.qty || 1) || 1,
        unitPrice: Number(p.price || p.unit_price || 0) / (p.price_is_cents ? 100 : 1),
        notes: String(p.special_requirements || p.notes || "")
      })),
      payment: { method: "glovo", status: "paid" },
      delivery: {
        address: rawOrder.delivery_address || rawOrder.address || "",
        code: rawOrder.order_code || rawOrder.order_id
      },
      notes: String(rawOrder.allergy_info || rawOrder.notes || ""),
      externalOrderId: String(rawOrder.order_id || rawOrder.id || ""),
      raw: rawOrder
    };
  },

  async acceptOrder() {
    return { ok: false, externalStatus: "pending_api", error: "Glovo API no configurada (partner)" };
  },

  async rejectOrder() {
    return { ok: false, error: "Glovo API no configurada (partner)" };
  },

  async cancelOrder() {
    return { ok: false, error: "Glovo API no configurada (partner)" };
  },

  async updateStatus(_ctx, _order, hospitalityStatus) {
    return {
      ok: false,
      externalStatus: this.mapStatusOut(hospitalityStatus),
      error: "Glovo API no configurada (partner)"
    };
  },

  async printFlags() {
    return { kitchen: true, receipt: false };
  },

  async health(ctx) {
    const enabled = ctx?.integration?.enabled;
    if (!enabled) return { ok: false, status: "disabled", detail: "Integración desactivada" };
    if (!ctx?.integration?.api_key) {
      return { ok: false, status: "error_token", detail: "Falta api_key / partner credentials" };
    }
    return { ok: false, status: "stub", detail: "Esperando API partner Glovo" };
  },

  mapStatusOut(hospitalityStatus) {
    const map = { nueva: "ACCEPTED", cocina: "PREPARING", lista: "READY_FOR_PICKUP", entregada: "PICKED_UP", cancelada: "CANCELLED" };
    return map[String(hospitalityStatus)] || "ACCEPTED";
  },

  mapStatusIn(externalStatus) {
    const s = String(externalStatus || "").toUpperCase();
    if (s.includes("PREPAR")) return "cocina";
    if (s.includes("READY") || s.includes("PICKUP")) return "lista";
    if (s.includes("CANCEL")) return "cancelada";
    if (s.includes("PICKED") || s.includes("DELIVER")) return "entregada";
    return "nueva";
  }
};
