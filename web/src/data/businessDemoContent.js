import { dakinisCompareToSector } from "@dakinis/shared/catalog/sector-benchmarks.js";
import { dakinisGetDemoCommercialMetrics } from "./demoCommercialContent.js";

export function dakinisGetBusinessDashboardKpis(verticalKey) {
  const base = dakinisGetDemoCommercialMetrics(verticalKey);
  return {
    activeClients: 124,
    monthSales: "8.450 €",
    products: 523,
    conversion: "24%",
    ...base
  };
}

export const DAKINIS_CRM_PIPELINE_STAGES = [
  { id: "lead", labelKey: "businessDemo.pipeline.lead", count: 12, cards: ["María López", "Hotel Costa SL", "Taller Ruiz"] },
  { id: "contacted", labelKey: "businessDemo.pipeline.contacted", count: 8, cards: ["Juan Pérez", "Clínica Vega", "Distrib. Norte"] },
  { id: "proposal", labelKey: "businessDemo.pipeline.proposal", count: 4, cards: ["Grupo Sol", "Inmob. Centro"] },
  { id: "client", labelKey: "businessDemo.pipeline.client", count: 2, cards: ["Ana García", "Rest. La Plaza"] }
];

export const DAKINIS_WHATSAPP_DEMO_THREADS = [
  {
    id: "juan",
    name: "Juan Pérez",
    preview: "Hola, ¿tenéis stock?",
    messages: [
      { from: "client", text: "Hola, ¿tenéis stock del producto que compré la semana pasada?" },
      { from: "business", text: "Sí, tenemos disponible. ¿Quieres que te reserve 2 unidades?" },
      { from: "client", text: "Perfecto, pásame por aquí cuando esté listo." }
    ],
    linkedClient: {
      name: "Juan Pérez",
      lastPurchase: "15/05/2026",
      totalSpent: "1.250 €",
      phone: "+34 600 112 233"
    }
  },
  {
    id: "ana",
    name: "Ana García",
    preview: "¿Podéis enviarme factura?",
    messages: [
      { from: "client", text: "Buenos días, ¿me podéis enviar la factura del pedido #1842?" },
      { from: "business", text: "Claro, te la envío ahora por email y queda en tu portal cliente." }
    ],
    linkedClient: {
      name: "Ana García",
      lastPurchase: "02/05/2026",
      totalSpent: "890 €",
      phone: "+34 611 445 566"
    }
  }
];

export const DAKINIS_INVENTORY_DEMO_PRODUCTS = [
  { name: "Harina 00", sku: "HAR-00", stock: 42, unit: "kg", status: "ok" },
  { name: "Aceite oliva virgen", sku: "ACE-OV", stock: 8, unit: "L", status: "low" },
  { name: "Jalapeños encurtidos", sku: "JAL-01", stock: 2, unit: "kg", status: "expiry" },
  { name: "Servilletas premium", sku: "SRV-PR", stock: 120, unit: "paq", status: "ok" },
  { name: "Café grano arabica", sku: "CAF-AR", stock: 15, unit: "kg", status: "ok" }
];

export const DAKINIS_REPORTS_DEMO_SERIES = [
  { label: "Ene", value: 62 },
  { label: "Feb", value: 71 },
  { label: "Mar", value: 68 },
  { label: "Abr", value: 84 },
  { label: "May", value: 92 }
];

const DAKINIS_ANALYTICS_TENANT_METRICS = {
  restaurante: { salesMonthDeltaPct: 12, occupancyPct: 71, crmContacts: 124, reservations7d: 52 },
  clinica: { salesMonthDeltaPct: 9, crmContacts: 98, reservations7d: 48 },
  peluqueria: { salesMonthDeltaPct: 11, crmContacts: 112, reservations7d: 61 },
  inmobiliaria: { salesMonthDeltaPct: 8, crmContacts: 76, reservations7d: 14 }
};

const DAKINIS_ANALYTICS_TOP_CLIENTS = {
  restaurante: [
    { name: "Ana García", value: "1.840 €", share: 22 },
    { name: "Grupo Sol Events", value: "1.420 €", share: 17 },
    { name: "Juan Pérez", value: "1.250 €", share: 15 }
  ],
  clinica: [
    { name: "Laura Méndez", value: "2.100 €", share: 24 },
    { name: "Clínica Vega", value: "1.680 €", share: 19 },
    { name: "Carlos Ruiz", value: "980 €", share: 11 }
  ],
  peluqueria: [
    { name: "Marta Soto", value: "620 €", share: 18 },
    { name: "Elena Costa", value: "540 €", share: 16 },
    { name: "Beatriz Núñez", value: "480 €", share: 14 }
  ],
  inmobiliaria: [
    { name: "Inmob. Centro", value: "24.000 €", share: 38 },
    { name: "Familia López", value: "12.500 €", share: 20 },
    { name: "Hotel Costa SL", value: "8.200 €", share: 13 }
  ]
};

/** Datos Analytics demo por vertical (benchmark, canales, embudo, tops). */
export function dakinisGetAnalyticsDemoData(verticalKey = "restaurante") {
  const vertical = DAKINIS_ANALYTICS_TENANT_METRICS[verticalKey]
    ? verticalKey
    : "restaurante";
  const metrics = dakinisGetDemoCommercialMetrics(vertical);
  const tenantMetrics = DAKINIS_ANALYTICS_TENANT_METRICS[vertical];
  const benchmark = dakinisCompareToSector(vertical, tenantMetrics);

  return {
    kpis: {
      revenue: metrics.monthSales,
      orders: vertical === "inmobiliaria" ? 24 : vertical === "clinica" ? 142 : 186,
      avgTicket: vertical === "inmobiliaria" ? "1.000 €" : vertical === "clinica" ? "90,50 €" : "45,40 €",
      conversion: vertical === "inmobiliaria" ? "18 %" : "24 %"
    },
    series: DAKINIS_REPORTS_DEMO_SERIES,
    channels: [
      { key: "whatsapp", pct: 42, amount: "3.549 €" },
      { key: "salon", pct: 35, amount: "2.958 €" },
      { key: "web", pct: 23, amount: "1.943 €" }
    ],
    funnel: [
      { key: "visits", count: 1240, widthPct: 100 },
      { key: "leads", count: 186, widthPct: 72 },
      { key: "proposals", count: 48, widthPct: 38 },
      { key: "sales", count: 42, widthPct: 32 }
    ],
    topProducts: [
      { name: metrics.topProduct, value: metrics.monthSales, share: 28 },
      { name: "Pack recurrente", value: "1.120 €", share: 14 },
      { name: "Servicio express", value: "890 €", share: 11 }
    ],
    topClients: DAKINIS_ANALYTICS_TOP_CLIENTS[vertical],
    benchmark,
    industry: vertical
  };
}
