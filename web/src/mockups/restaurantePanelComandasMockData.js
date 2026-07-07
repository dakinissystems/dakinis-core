export const FERMINA_MOCK_MENU = [
  {
    id: "bites-cheddar",
    name: "Bites cheddar y jalapeños",
    hint: "9 uds/porción",
    prices: { salon: 8.5, takeaway: 8.0, delivery: 8.0, glovo: 9.99, uber: 10.49 }
  },
  {
    id: "chicken-bites",
    name: "Chicken bites",
    hint: "11 uds/porción",
    prices: { salon: 9.5, takeaway: 9.0, delivery: 9.0, glovo: 10.99, uber: 11.49 }
  },
  {
    id: "choripan",
    name: "Choripán",
    hint: "",
    prices: { salon: 7.5, takeaway: 7.0, delivery: 7.0, glovo: 8.99, uber: 9.49 }
  }
];

export function ferminaPriceForChannel(item, channelId) {
  const prices = item.prices || {};
  const n = prices[channelId];
  if (n != null && Number.isFinite(n)) return n;
  return prices.salon ?? 0;
}

function ferminaIsAppChannel(channelId) {
  return channelId === "glovo" || channelId === "uber";
}

export function ferminaPriceTierLabel(channelId) {
  return ferminaIsAppChannel(channelId)
    ? "Tarifa apps (Glovo / Uber)"
    : "Tarifa local (salón / para llevar / delivery)";
}

const FERMINA_CHANNELS = [
  { id: "salon", label: "Salón" },
  { id: "takeaway", label: "Para llevar" },
  { id: "delivery", label: "Delivery propio" },
  { id: "glovo", label: "Glovo" },
  { id: "uber", label: "Uber Eats" }
];

export const FERMINA_LOCAL_CHANNELS = FERMINA_CHANNELS.filter((c) => !ferminaIsAppChannel(c.id));
export const FERMINA_APP_CHANNELS = FERMINA_CHANNELS.filter((c) => ferminaIsAppChannel(c.id));

export const FERMINA_COMANDAS_VIEWS = [
  { id: "mesas", label: "Mesas" },
  { id: "tarifa", label: "Tarifa" },
  { id: "pedido", label: "Pedido" },
  { id: "cobro", label: "Cobro" },
  { id: "activas", label: "Activas" },
  { id: "cierre", label: "Cierre día" },
  { id: "facturas", label: "Facturas" }
];

function ferminaEmptyTableSessions(tables) {
  return Object.fromEntries(tables.map((t) => [t.id, { cart: {}, notes: "" }]));
}

export function ferminaSeedTableSessions(tables) {
  const base = ferminaEmptyTableSessions(tables);
  base["terraza-3"] = {
    cart: { "bites-cheddar": 2, "chicken-bites": 1 },
    notes: "Sin picante en los bites"
  };
  return base;
}

export function ferminaTableLabel(tables, tableId) {
  return tables.find((t) => t.id === tableId)?.label || tableId;
}

export function ferminaTableCartLines(cart, channelId = "salon") {
  const lines = [];
  for (const item of FERMINA_MOCK_MENU) {
    const qty = cart[item.id] || 0;
    if (qty <= 0) continue;
    lines.push({
      menuId: item.id,
      name: item.name,
      qty,
      unitPrice: ferminaPriceForChannel(item, channelId)
    });
  }
  return lines;
}

export function ferminaLinesTotal(lines) {
  return lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
}

export const FERMINA_PAYMENTS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "tarjeta", label: "Tarjeta" }
];

export const FERMINA_STATUS_FLOW = ["nueva", "cocina", "lista", "entregada", "cancelada"];

export function ferminaChannelLabel(channelId) {
  return FERMINA_CHANNELS.find((c) => c.id === channelId)?.label || channelId;
}

export function ferminaPaymentLabel(paymentId) {
  return FERMINA_PAYMENTS.find((p) => p.id === paymentId)?.label || paymentId;
}

const MOCK_FERMINA_LINES = [
  { name: "Bites cheddar y jalapeños", qty: 2, unitPrice: 8.5 },
  { name: "Chicken bites", qty: 1, unitPrice: 9.5 },
  { name: "Choripán", qty: 2, unitPrice: 7.5 }
];

export const DEMO_RESTAURANT_VENUE = "Tu restaurante";

export const MOCK_FERMINA_ORDER = {
  orderNumber: 1042,
  venueName: DEMO_RESTAURANT_VENUE,
  createdAt: "2026-05-31T18:45:00.000Z",
  customerName: "Terraza 3",
  table: "Terraza 3",
  channel: "salon",
  paymentMethod: "tarjeta",
  status: "cocina",
  notes: "Sin picante en los bites",
  total: 41.5,
  lines: MOCK_FERMINA_LINES
};

function ferminaMinutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function ferminaSeedOrders() {
  return [
    { ...MOCK_FERMINA_ORDER, id: "o-1042", createdAt: ferminaMinutesAgo(11) },
    {
      id: "o-1041",
      orderNumber: 1041,
      venueName: DEMO_RESTAURANT_VENUE,
      createdAt: ferminaMinutesAgo(3),
      customerName: "Lucía — para llevar",
      table: "Mostrador",
      channel: "takeaway",
      paymentMethod: "efectivo",
      status: "nueva",
      notes: "",
      lines: [{ name: "Chicken bites", qty: 1, unitPrice: 9.0 }],
      total: 9.0
    },
    {
      id: "o-1040",
      orderNumber: 1040,
      venueName: DEMO_RESTAURANT_VENUE,
      createdAt: "2026-05-31T14:05:00.000Z",
      customerName: "Pedido Glovo #8821",
      table: "—",
      channel: "glovo",
      paymentMethod: "tarjeta",
      status: "entregada",
      notes: "Pagado en app",
      lines: [
        { name: "Bites cheddar y jalapeños", qty: 1, unitPrice: 9.99 },
        { name: "Choripán", qty: 1, unitPrice: 8.99 }
      ],
      total: 18.98
    },
    {
      id: "o-1039",
      orderNumber: 1039,
      venueName: DEMO_RESTAURANT_VENUE,
      createdAt: "2026-05-31T12:30:00.000Z",
      customerName: "Uber Eats · Carlos",
      table: "—",
      channel: "uber",
      paymentMethod: "tarjeta",
      status: "entregada",
      notes: "",
      lines: [{ name: "Choripán", qty: 2, unitPrice: 9.49 }],
      total: 18.98
    }
  ];
}

export const MOCK_FERMINA_INVOICE_CLIENT = {
  invoiceNumber: "DEMO-C-2026-0008",
  type: "cliente",
  customerName: "Lucía Ortega",
  taxId: "",
  total: 26.5,
  lines: [
    { name: "Bites cheddar y jalapeños", qty: 1, unitPrice: 8.5 },
    { name: "Choripán", qty: 2, unitPrice: 7.5 }
  ]
};

export const MOCK_FERMINA_INVOICE_GESTOR = {
  invoiceNumber: "DEMO-G-2026-0003",
  type: "gestor",
  customerName: "Tu restaurante S.L.",
  taxId: "30-71234567-8",
  subtotal: 41.5,
  tax: 8.72,
  total: 50.22,
  lines: MOCK_FERMINA_LINES
};

export const MOCK_ROLE_VIEWS = {
  camarero: ["mesas", "tarifa", "pedido", "cobro"],
  cocina: ["activas"],
  admin: ["cierre", "facturas"]
};

const EMPTY_MOCK_TABLE_CART = Object.freeze({});
