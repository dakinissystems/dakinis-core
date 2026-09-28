/**
 * Canales / providers de delivery para hostelería.
 * El pedido usa `channel`; PriceList y DeliveryProvider se resuelven por esta clave.
 */

export const DAKINIS_DELIVERY_PROVIDERS = Object.freeze([
  {
    id: "internal",
    label: "Interno / Manual",
    channels: ["salon", "barra", "takeaway", "delivery"],
    officialApi: true,
    notes: "Pedidos creados en Dakinis (sala, barra, takeaway propio)."
  },
  {
    id: "manual",
    label: "Manual (simulación)",
    channels: ["manual"],
    officialApi: true,
    notes: "Provider de pruebas: importa pedidos simulados sin API externa."
  },
  {
    id: "glovo",
    label: "Glovo",
    channels: ["glovo"],
    officialApi: "partner",
    notes: "Requiere acuerdo partner / API oficial."
  },
  {
    id: "ubereats",
    label: "Uber Eats",
    channels: ["ubereats", "uber"],
    officialApi: "partner",
    notes: "Requiere acceso Uber Eats Marketplace API."
  },
  {
    id: "justeat",
    label: "Just Eat",
    channels: ["justeat"],
    officialApi: "partner",
    notes: "Just Eat Takeaway.com partner API."
  },
  {
    id: "rappi",
    label: "Rappi",
    channels: ["rappi"],
    officialApi: "partner",
    notes: "Stub — LATAM."
  },
  {
    id: "pedidosya",
    label: "PedidosYa",
    channels: ["pedidosya"],
    officialApi: "partner",
    notes: "Stub — LATAM."
  },
  {
    id: "deliveroo",
    label: "Deliveroo",
    channels: ["deliveroo"],
    officialApi: "partner",
    notes: "Stub — requiere partner."
  }
]);

const BY_ID = new Map(DAKINIS_DELIVERY_PROVIDERS.map((p) => [p.id, p]));

/** Price list keys canónicos (canal → tarifa). */
export const DAKINIS_PRICE_LIST_KEYS = Object.freeze([
  "salon",
  "barra",
  "takeaway",
  "delivery",
  "glovo",
  "ubereats",
  "justeat",
  "manual"
]);

export const DAKINIS_PRICE_LIST_LABELS = Object.freeze({
  salon: "Sala",
  barra: "Barra",
  takeaway: "Para llevar",
  delivery: "Delivery propio",
  glovo: "Glovo",
  ubereats: "Uber Eats",
  justeat: "Just Eat",
  manual: "Manual / simulación"
});

/** Mapea channel de pedido → price list key. */
export function dakinisChannelToPriceListKey(channel) {
  const c = String(channel || "salon").trim().toLowerCase();
  if (c === "uber") return "ubereats";
  if (c === "sala" || c === "local") return "salon";
  if (DAKINIS_PRICE_LIST_KEYS.includes(c)) return c;
  if (c === "glovo" || c === "ubereats" || c === "justeat" || c === "rappi" || c === "pedidosya" || c === "deliveroo") {
    return c;
  }
  return "salon";
}

/** Mapea channel → provider id. */
export function dakinisChannelToProviderId(channel) {
  const c = String(channel || "").trim().toLowerCase();
  if (!c || c === "salon" || c === "barra" || c === "takeaway" || c === "delivery" || c === "sala") {
    return "internal";
  }
  if (c === "uber") return "ubereats";
  if (c === "manual") return "manual";
  if (BY_ID.has(c)) return c;
  return "internal";
}

export function dakinisGetDeliveryProviderMeta(providerId) {
  return BY_ID.get(String(providerId || "").toLowerCase()) || null;
}

export function dakinisIsMarketplaceChannel(channel) {
  const id = dakinisChannelToProviderId(channel);
  return id !== "internal" && id !== "manual";
}
