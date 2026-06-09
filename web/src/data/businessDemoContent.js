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
