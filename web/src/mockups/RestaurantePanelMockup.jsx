import { useMemo, useState } from "react";
import {
  DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  DAKINIS_RESTAURANT_EXTRA_ALLERGENS
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import AllergenPublicTable from "../components/AllergenPublicTable.jsx";
import { FerminaComandasSubnav } from "../components/FerminaComandasSubnav.jsx";
import MockupSidebarNav from "./MockupSidebarNav.jsx";

const TABS = [
  { id: "mapa", label: "Mapa de mesas" },
  { id: "reservas", label: "Reservas" },
  { id: "espera", label: "Lista de espera" },
  { id: "comandas", label: "Comandas" },
  { id: "clientes", label: "Alergias por reserva" },
  { id: "alergenos", label: "Cartel alérgenos" },
  { id: "proveedores", label: "Proveedores" }
];

/** Demo: mismos presentes que el seed del tenant restaurante-demo (gluten, huevos). */
const MOCK_ALLERGEN_CHECKLIST = [
  ...DAKINIS_RESTAURANT_ALLERGEN_CATALOG.map((item) => ({
    catalogId: item.id,
    name: item.name,
    category: item.category,
    hint: item.hint,
    present: item.id === "gluten" || item.id === "eggs",
    notes:
      item.id === "gluten"
        ? "Harina, pizzas, empanadas"
        : item.id === "eggs"
          ? "Masas y empanadas"
          : ""
  })),
  ...DAKINIS_RESTAURANT_EXTRA_ALLERGENS.map((item) => ({
    catalogId: item.id,
    name: item.name,
    category: item.category,
    hint: item.hint,
    present: false,
    notes: ""
  }))
];

const MOCK_PUBLIC_ALLERGEN_URL = "https://core.dakinissystems.com/alergenos/restaurante-demo";

function Toolbar({ title, badge, user, extra }) {
  return (
    <div className="mockup-toolbar">
      <div>
        <strong>{title}</strong>
        {badge ? (
          <span className="mockup-badge" style={{ marginLeft: "0.75rem" }}>
            {badge}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <span className="mockup-user-pill">{user}</span>
        {extra ? <span className="mockup-badge">{extra}</span> : null}
      </div>
    </div>
  );
}

function PanelMapa() {
  return (
    <>
      <div className="two-col" style={{ marginBottom: "1rem" }}>
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Plan de sala (esquema)</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.5rem",
              fontSize: "0.85rem",
              color: "var(--muted)"
            }}
          >
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 8,
                padding: "0.75rem",
                textAlign: "center"
              }}
            >
              Terraza 1–5
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>Demo en Comandas → Mesas</div>
            </div>
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 8,
                padding: "0.75rem",
                textAlign: "center"
              }}
            >
              Salón 1–5
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>Cuenta y cierre por mesa</div>
            </div>
            <div
              style={{
                border: "1px dashed var(--line)",
                borderRadius: 8,
                padding: "0.75rem",
                textAlign: "center"
              }}
            >
              Lista espera
              <div style={{ marginTop: "0.35rem" }}>3 grupos</div>
            </div>
          </div>
        </article>
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Resumen</h3>
          <div className="system-kpis" style={{ gridTemplateColumns: "repeat(2, 1fr)", margin: 0 }}>
            <div>
              <p className="kpi-label">Confirmadas WhatsApp</p>
              <p className="kpi-value" style={{ fontSize: "1.4rem" }}>
                38
              </p>
            </div>
            <div>
              <p className="kpi-label">No-show últimos 7d</p>
              <p className="kpi-value" style={{ fontSize: "1.4rem" }}>
                2%
              </p>
            </div>
          </div>
        </article>
      </div>

      <article className="card" style={{ overflow: "auto" }}>
        <h3 style={{ marginTop: 0 }}>Próximas mesas</h3>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Mesa / zona</th>
              <th>Cliente</th>
              <th>Pax</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>20:00</td>
              <td>Terraza 4</td>
              <td>Pablo Vega</td>
              <td>4</td>
              <td>Sin gluten · confirmado WA</td>
            </tr>
            <tr>
              <td>21:00</td>
              <td>Interior 2</td>
              <td>Lucía Ortega</td>
              <td>2</td>
              <td>Aniversario</td>
            </tr>
            <tr>
              <td>21:30</td>
              <td>Terraza 1</td>
              <td>Grupo empresa</td>
              <td>8</td>
              <td>Menú degustación</td>
            </tr>
          </tbody>
        </table>
      </article>
    </>
  );
}

function PanelReservas() {
  return (
    <article className="card" style={{ overflow: "auto" }}>
      <h3 style={{ marginTop: 0 }}>Todas las reservas — servicio noche</h3>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Zona</th>
            <th>Cliente</th>
            <th>Canal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>19:30</td>
            <td>Barra alta</td>
            <td>Sin reserva</td>
            <td>Walk-in</td>
          </tr>
          <tr>
            <td>20:00</td>
            <td>T4</td>
            <td>Pablo Vega</td>
            <td>WA</td>
          </tr>
          <tr>
            <td>21:30</td>
            <td>T1</td>
            <td>Grupo empresa</td>
            <td>Web</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelEspera() {
  return (
    <article className="card">
      <h3 style={{ marginTop: 0 }}>Lista de espera en tiempo real</h3>
      <ol style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)" }}>
        <li style={{ marginBottom: "0.5rem" }}>
          Familia Pérez · 4 pax · esperando desde 20:10 · aviso WA enviado
        </li>
        <li style={{ marginBottom: "0.5rem" }}>Pareja · 2 pax · preferencia terraza</li>
        <li>Grupo 5 pax · interior si libera I6</li>
      </ol>
    </article>
  );
}

/** Precios por canal: salón/para llevar/delivery vs Glovo/Uber (comisión apps). */
const FERMINA_MOCK_MENU = [
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

function ferminaPriceForChannel(item, channelId) {
  const prices = item.prices || {};
  const n = prices[channelId];
  if (n != null && Number.isFinite(n)) return n;
  return prices.salon ?? 0;
}

function ferminaIsAppChannel(channelId) {
  return channelId === "glovo" || channelId === "uber";
}

function ferminaPriceTierLabel(channelId) {
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

const FERMINA_LOCAL_CHANNELS = FERMINA_CHANNELS.filter((c) => !ferminaIsAppChannel(c.id));
const FERMINA_APP_CHANNELS = FERMINA_CHANNELS.filter((c) => ferminaIsAppChannel(c.id));

const FERMINA_COMANDAS_VIEWS = [
  { id: "mesas", label: "Mesas" },
  { id: "tarifa", label: "Tarifa" },
  { id: "pedido", label: "Pedido" },
  { id: "cobro", label: "Cobro" },
  { id: "activas", label: "Activas" },
  { id: "cierre", label: "Cierre día" },
  { id: "facturas", label: "Facturas" }
];

/** 5 mesas salón + 5 terraza (cuenta abierta por mesa hasta cerrar con cobro). */
const FERMINA_TABLES = [
  ...[1, 2, 3, 4, 5].map((n) => ({ id: `salon-${n}`, zone: "salon", label: `Salón ${n}` })),
  ...[1, 2, 3, 4, 5].map((n) => ({ id: `terraza-${n}`, zone: "terraza", label: `Terraza ${n}` }))
];

function ferminaEmptyTableSessions() {
  return Object.fromEntries(FERMINA_TABLES.map((t) => [t.id, { cart: {}, notes: "" }]));
}

function ferminaSeedTableSessions() {
  const base = ferminaEmptyTableSessions();
  base["terraza-3"] = {
    cart: { "bites-cheddar": 2, "chicken-bites": 1 },
    notes: "Sin picante en los bites"
  };
  return base;
}

function ferminaTableLabel(tableId) {
  return FERMINA_TABLES.find((t) => t.id === tableId)?.label || tableId;
}

function ferminaTableCartLines(cart, channelId = "salon") {
  return FERMINA_MOCK_MENU.filter((m) => (cart[m.id] || 0) > 0).map((m) => ({
    menuId: m.id,
    name: m.name,
    qty: cart[m.id],
    unitPrice: ferminaPriceForChannel(m, channelId)
  }));
}

function ferminaTableCartTotal(cart, channelId = "salon") {
  return ferminaLinesTotal(ferminaTableCartLines(cart, channelId));
}

function ferminaTableItemCount(cart) {
  return Object.values(cart || {}).reduce((n, q) => n + (q > 0 ? q : 0), 0);
}

const FERMINA_PAYMENTS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "tarjeta", label: "Tarjeta" }
];

const FERMINA_STATUS_FLOW = ["nueva", "cocina", "lista", "entregada", "cancelada"];

function ferminaChannelLabel(channelId) {
  return FERMINA_CHANNELS.find((c) => c.id === channelId)?.label || channelId;
}

function ferminaPaymentLabel(paymentId) {
  return FERMINA_PAYMENTS.find((p) => p.id === paymentId)?.label || paymentId;
}

function ferminaLinesTotal(lines) {
  return lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
}

const MOCK_FERMINA_LINES = [
  { name: "Bites cheddar y jalapeños", qty: 2, unitPrice: 8.5 },
  { name: "Chicken bites", qty: 1, unitPrice: 9.5 },
  { name: "Choripán", qty: 2, unitPrice: 7.5 }
];

const MOCK_FERMINA_ORDER = {
  orderNumber: 1042,
  customerName: "Terraza 3",
  table: "Terraza 3",
  channel: "salon",
  paymentMethod: "tarjeta",
  status: "cocina",
  notes: "Sin picante en los bites",
  total: 41.5,
  lines: MOCK_FERMINA_LINES
};

function ferminaSeedOrders() {
  return [
    { ...MOCK_FERMINA_ORDER, id: "o-1042" },
    {
      id: "o-1041",
      orderNumber: 1041,
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

const MOCK_FERMINA_INVOICE_CLIENT = {
  invoiceNumber: "FF-C-2026-0008",
  type: "cliente",
  customerName: "Lucía Ortega",
  taxId: "",
  total: 26.5,
  lines: [
    { name: "Bites cheddar y jalapeños", qty: 1, unitPrice: 8.5 },
    { name: "Choripán", qty: 2, unitPrice: 7.5 }
  ]
};

const MOCK_FERMINA_INVOICE_GESTOR = {
  invoiceNumber: "FF-G-2026-0003",
  type: "gestor",
  customerName: "Fermina Food SRL",
  taxId: "30-71234567-8",
  subtotal: 41.5,
  tax: 8.72,
  total: 50.22,
  lines: MOCK_FERMINA_LINES
};

function MockFerminaPrintSheet({ kind, doc, caption }) {
  const isComanda = kind === "comanda";
  const lineTotal = (l) => (l.qty * l.unitPrice).toFixed(2);

  return (
    <div className="mockup-print-grid__cell">
      <p className="mockup-print-grid__label">{caption}</p>
      <article className="fermina-print-sheet" aria-label={caption}>
        <img src="/assets/fermina-logo.png" alt="" className="fermina-print-sheet__logo" width={140} />
        <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>
          {isComanda ? `Comanda #${doc.orderNumber}` : doc.invoiceNumber}
        </h2>
        <p className="kpi-label" style={{ color: "#444", margin: "0 0 0.5rem" }}>
          Fermina Food · 31/5/2026, 20:45
        </p>
        {!isComanda ? (
          <p style={{ margin: "0 0 0.35rem", fontSize: "0.9rem" }}>
            <strong>
              {doc.type === "gestor" ? "Gestor / contabilidad" : "Cliente (ticket)"}
            </strong>
            {doc.taxId ? ` · ${doc.taxId}` : ""}
          </p>
        ) : null}
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem" }}>
          <strong>{doc.customerName}</strong>
          {doc.table ? ` · ${doc.table}` : ""}
        </p>
        {isComanda && (doc.channel || doc.paymentMethod) ? (
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "#555" }}>
            {doc.channel ? ferminaChannelLabel(doc.channel) : null}
            {doc.channel && doc.paymentMethod ? " · " : null}
            {doc.paymentMethod ? ferminaPaymentLabel(doc.paymentMethod) : null}
          </p>
        ) : null}
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Plato</th>
              <th>Cant.</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {doc.lines.map((l, i) => (
              <tr key={i}>
                <td>{l.name}</td>
                <td>{l.qty}</td>
                <td>{lineTotal(l)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="fermina-print-sheet__total">
          <strong>{doc.total.toFixed(2)} €</strong>
        </p>
        {!isComanda && doc.type === "gestor" && doc.subtotal != null ? (
          <p style={{ fontSize: "0.75rem", color: "#555", margin: "0.35rem 0 0", textAlign: "right" }}>
            Base {doc.subtotal.toFixed(2)} € · IVA 21% {doc.tax?.toFixed(2)} €
          </p>
        ) : null}
        {isComanda && doc.notes ? (
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>{doc.notes}</p>
        ) : null}
      </article>
    </div>
  );
}

function PanelComandas() {
  const [comandasView, setComandasView] = useState("mesas");
  const [orders, setOrders] = useState(ferminaSeedOrders);
  const [nextOrderNum, setNextOrderNum] = useState(1043);
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState("Walk-in barra");
  const [table, setTable] = useState("Barra 2");
  const [channel, setChannel] = useState("salon");
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [notes, setNotes] = useState("");
  const [printDoc, setPrintDoc] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState("terraza-3");
  const [tableSessions, setTableSessions] = useState(ferminaSeedTableSessions);
  const [mesaClosePayment, setMesaClosePayment] = useState("tarjeta");

  const cartLines = useMemo(() => {
    return FERMINA_MOCK_MENU.filter((m) => (cart[m.id] || 0) > 0).map((m) => ({
      menuId: m.id,
      name: m.name,
      qty: cart[m.id],
      unitPrice: ferminaPriceForChannel(m, channel)
    }));
  }, [cart, channel]);

  const cartTotal = useMemo(() => ferminaLinesTotal(cartLines), [cartLines]);

  const closedOrders = useMemo(
    () => orders.filter((o) => o.status === "entregada"),
    [orders]
  );

  const dayByPayment = useMemo(() => {
    const map = Object.fromEntries(FERMINA_PAYMENTS.map((p) => [p.id, { label: p.label, total: 0, count: 0 }]));
    for (const o of closedOrders) {
      const bucket = map[o.paymentMethod] || map.efectivo;
      bucket.total += o.total;
      bucket.count += 1;
    }
    return Object.values(map);
  }, [closedOrders]);

  const dayByChannel = useMemo(() => {
    const map = Object.fromEntries(FERMINA_CHANNELS.map((c) => [c.id, { label: c.label, total: 0, count: 0 }]));
    for (const o of closedOrders) {
      const bucket = map[o.channel] || map.salon;
      bucket.total += o.total;
      bucket.count += 1;
    }
    return Object.values(map);
  }, [closedOrders]);

  const dayGrandTotal = useMemo(
    () => closedOrders.reduce((s, o) => s + o.total, 0),
    [closedOrders]
  );

  function setCartQty(menuId, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const v = Math.max(0, (next[menuId] || 0) + delta);
      if (v === 0) delete next[menuId];
      else next[menuId] = v;
      return next;
    });
  }

  const openOrders = useMemo(
    () => orders.filter((o) => o.status !== "entregada" && o.status !== "cancelada"),
    [orders]
  );

  const cartItemCount = useMemo(
    () => Object.values(cart).reduce((n, q) => n + (q > 0 ? q : 0), 0),
    [cart]
  );

  const selectedTableSession = selectedTableId ? tableSessions[selectedTableId] : null;
  const mesaCart = selectedTableSession?.cart ?? {};
  const mesaNotes = selectedTableSession?.notes ?? "";
  const mesaLines = useMemo(() => ferminaTableCartLines(mesaCart, "salon"), [mesaCart]);
  const mesaTotal = useMemo(() => ferminaLinesTotal(mesaLines), [mesaLines]);
  const mesaItemCount = useMemo(() => ferminaTableItemCount(mesaCart), [mesaCart]);

  const occupiedTablesCount = useMemo(
    () => FERMINA_TABLES.filter((t) => ferminaTableItemCount(tableSessions[t.id]?.cart) > 0).length,
    [tableSessions]
  );

  function setTableCartQty(tableId, menuId, delta) {
    if (!tableId) return;
    setTableSessions((prev) => {
      const cur = prev[tableId] || { cart: {}, notes: "" };
      const cartNext = { ...cur.cart };
      const v = Math.max(0, (cartNext[menuId] || 0) + delta);
      if (v === 0) delete cartNext[menuId];
      else cartNext[menuId] = v;
      return { ...prev, [tableId]: { ...cur, cart: cartNext } };
    });
  }

  function setTableNotes(tableId, value) {
    if (!tableId) return;
    setTableSessions((prev) => {
      const cur = prev[tableId] || { cart: {}, notes: "" };
      return { ...prev, [tableId]: { ...cur, notes: value } };
    });
  }

  function clearTableSession(tableId) {
    if (!tableId) return;
    setTableSessions((prev) => ({ ...prev, [tableId]: { cart: {}, notes: "" } }));
  }

  function sendTableToKitchen(tableId) {
    const session = tableSessions[tableId];
    if (!session) return;
    const lines = ferminaTableCartLines(session.cart, "salon");
    if (!lines.length) return;
    const label = ferminaTableLabel(tableId);
    const order = {
      id: `o-${nextOrderNum}`,
      orderNumber: nextOrderNum,
      customerName: label,
      table: label,
      channel: "salon",
      paymentMethod: "tarjeta",
      status: "cocina",
      notes: session.notes.trim(),
      lines: lines.map(({ name, qty, unitPrice }) => ({ name, qty, unitPrice })),
      total: ferminaLinesTotal(lines)
    };
    setOrders((prev) => [order, ...prev]);
    setNextOrderNum((n) => n + 1);
    setPrintDoc({ kind: "comanda", doc: order });
    setComandasView("activas");
  }

  function closeTable(tableId, payMethod) {
    const session = tableSessions[tableId];
    if (!session) return;
    const lines = ferminaTableCartLines(session.cart, "salon");
    if (!lines.length) return;
    const label = ferminaTableLabel(tableId);
    const order = {
      id: `o-${nextOrderNum}`,
      orderNumber: nextOrderNum,
      customerName: label,
      table: label,
      channel: "salon",
      paymentMethod: payMethod,
      status: "entregada",
      notes: session.notes.trim(),
      lines: lines.map(({ name, qty, unitPrice }) => ({ name, qty, unitPrice })),
      total: ferminaLinesTotal(lines)
    };
    setOrders((prev) => [order, ...prev]);
    setNextOrderNum((n) => n + 1);
    clearTableSession(tableId);
    setPrintDoc({ kind: "comanda", doc: order });
  }

  function submitDemoOrder() {
    if (!cartLines.length) return;
    const lines = cartLines.map(({ name, qty, unitPrice }) => ({ name, qty, unitPrice }));
    const order = {
      id: `o-${nextOrderNum}`,
      orderNumber: nextOrderNum,
      customerName: customerName.trim() || "Cliente",
      table: table.trim(),
      channel,
      paymentMethod,
      status: "nueva",
      notes: notes.trim(),
      lines,
      total: ferminaLinesTotal(lines)
    };
    setOrders((prev) => [order, ...prev]);
    setNextOrderNum((n) => n + 1);
    setCart({});
    setPrintDoc({ kind: "comanda", doc: order });
    setComandasView("activas");
  }

  function patchOrderStatus(orderId, status) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  function resetDemoDay() {
    setOrders(ferminaSeedOrders());
    setNextOrderNum(1043);
    setCart({});
    setTableSessions(ferminaSeedTableSessions());
    setPrintDoc(null);
  }

  return (
    <>
      <article className="card fermina-ops--branded" style={{ marginBottom: "1rem" }}>
        <div className="fermina-ops__header" style={{ marginBottom: "0.75rem" }}>
          <img src="/assets/fermina-logo.png" alt="Fermina Food" className="fermina-ops__logo" width={160} />
          <div>
            <p className="kicker" style={{ margin: 0 }}>
              Comida argentina · demo operativa
            </p>
            <p className="lead" style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              <strong>Mesas:</strong> 5 salón + 5 terraza, cuenta por mesa y cierre (efectivo/tarjeta). Para llevar y
              apps: <strong>tarifa</strong> → <strong>pedido</strong> → <strong>cobro</strong>.
            </p>
          </div>
          <span className="mockup-badge">Demo interactivo</span>
        </div>

        <FerminaComandasSubnav
          views={FERMINA_COMANDAS_VIEWS}
          activeId={comandasView}
          onSelect={setComandasView}
          badges={{
            mesas: occupiedTablesCount > 0 ? String(occupiedTablesCount) : null,
            pedido: cartItemCount > 0 ? String(cartItemCount) : null,
            activas: openOrders.length > 0 ? String(openOrders.length) : null
          }}
        />

        {comandasView === "mesas" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>Mesas en sala</h4>
            <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
              Elige una mesa, añade platos y consulta el saldo. Al cerrar, indica efectivo o tarjeta (entra en cierre del
              día).
            </p>
            <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
              Interior (salón)
            </p>
            <div
              className="fermina-table-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(5.5rem, 1fr))",
                gap: "0.5rem",
                marginBottom: "1rem"
              }}
            >
              {FERMINA_TABLES.filter((t) => t.zone === "salon").map((t) => {
                const busy = ferminaTableItemCount(tableSessions[t.id]?.cart) > 0;
                const selected = selectedTableId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={selected ? "btn" : busy ? "btn btn-outline" : "btn btn-outline"}
                    style={
                      selected
                        ? { borderColor: "var(--brand)" }
                        : busy
                          ? { borderColor: "var(--brand)", opacity: 0.95 }
                          : undefined
                    }
                    onClick={() => setSelectedTableId(t.id)}
                  >
                    {t.label}
                    {busy ? (
                      <span className="mockup-badge" style={{ display: "block", marginTop: "0.2rem", fontSize: "0.7rem" }}>
                        {ferminaTableCartTotal(tableSessions[t.id]?.cart, "salon").toFixed(0)} €
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
              Terraza
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(5.5rem, 1fr))",
                gap: "0.5rem",
                marginBottom: "1.25rem"
              }}
            >
              {FERMINA_TABLES.filter((t) => t.zone === "terraza").map((t) => {
                const busy = ferminaTableItemCount(tableSessions[t.id]?.cart) > 0;
                const selected = selectedTableId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    className={selected ? "btn" : "btn btn-outline"}
                    style={selected ? { borderColor: "var(--brand)" } : busy ? { borderColor: "var(--brand)" } : undefined}
                    onClick={() => setSelectedTableId(t.id)}
                  >
                    {t.label}
                    {busy ? (
                      <span className="mockup-badge" style={{ display: "block", marginTop: "0.2rem", fontSize: "0.7rem" }}>
                        {ferminaTableCartTotal(tableSessions[t.id]?.cart, "salon").toFixed(0)} €
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {selectedTableId ? (
              <>
                <article
                  className="card"
                  style={{ marginBottom: "1rem", boxShadow: "none", border: "1px solid var(--line)" }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <h4 style={{ margin: 0 }}>{ferminaTableLabel(selectedTableId)}</h4>
                    <span className="mockup-badge">Salón · tarifa local</span>
                    <strong style={{ marginLeft: "auto", fontSize: "1.15rem" }}>
                      Saldo: {mesaTotal.toFixed(2)} €
                    </strong>
                  </div>
                  {mesaLines.length > 0 ? (
                    <ul style={{ margin: "0 0 0.75rem", paddingLeft: "1.1rem" }}>
                      {mesaLines.map((l) => (
                        <li key={l.menuId}>
                          {l.qty}× {l.name} — {(l.qty * l.unitPrice).toFixed(2)} €
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted small" style={{ margin: "0 0 0.75rem" }}>
                      Mesa libre — añade platos abajo.
                    </p>
                  )}
                  <label className="mockup-field" style={{ display: "block", marginBottom: 0 }}>
                    <span>Notas cocina</span>
                    <input
                      type="text"
                      value={mesaNotes}
                      onChange={(e) => setTableNotes(selectedTableId, e.target.value)}
                      placeholder="Ej. sin picante"
                    />
                  </label>
                </article>

                <ul className="fermina-menu-list" style={{ marginBottom: "0.75rem" }}>
                  {FERMINA_MOCK_MENU.map((item) => {
                    const unitPrice = ferminaPriceForChannel(item, "salon");
                    return (
                      <li key={item.id} className="fermina-menu-item">
                        <span>
                          <strong>{item.name}</strong>
                          {item.hint ? (
                            <span className="kpi-label" style={{ display: "block" }}>
                              {item.hint}
                            </span>
                          ) : null}
                        </span>
                        <div className="fermina-menu-item__qty">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setTableCartQty(selectedTableId, item.id, -1)}
                          >
                            −
                          </button>
                          <span>{mesaCart[item.id] || 0}</span>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setTableCartQty(selectedTableId, item.id, 1)}
                          >
                            +
                          </button>
                          <span className="kpi-label">
                            <strong>{unitPrice.toFixed(2)} €</strong>
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <p className="allergen-panel__summary" style={{ marginBottom: "1rem" }}>
                  <strong>Saldo mesa: {mesaTotal.toFixed(2)} €</strong>
                  {mesaItemCount > 0 ? (
                    <span className="kpi-label"> · {mesaItemCount} unidades</span>
                  ) : null}
                </p>

                <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
                  Cerrar mesa — ¿cómo cobra?
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                  {FERMINA_PAYMENTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={mesaClosePayment === p.id ? "btn" : "btn btn-outline"}
                      style={{ minWidth: "7rem" }}
                      onClick={() => setMesaClosePayment(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn"
                    disabled={!mesaLines.length}
                    onClick={() => closeTable(selectedTableId, mesaClosePayment)}
                  >
                    Cerrar mesa y cobrar
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={!mesaLines.length}
                    onClick={() => sendTableToKitchen(selectedTableId)}
                  >
                    Solo enviar a cocina
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={!mesaItemCount}
                    onClick={() => clearTableSession(selectedTableId)}
                  >
                    Vaciar mesa
                  </button>
                </div>
              </>
            ) : (
              <p className="lead">Selecciona una mesa.</p>
            )}
          </div>
        ) : null}

        {comandasView === "tarifa" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>Canal y tarifa</h4>
            <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
              Elige dónde se vende el pedido. Los precios del menú cambian entre local y apps.
            </p>
            <p className="kpi-label" style={{ marginBottom: "0.75rem" }}>
              {ferminaPriceTierLabel(channel)}
            </p>
            <p className="kpi-label" style={{ margin: "0 0 0.35rem" }}>
              En restaurante / para llevar
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {FERMINA_LOCAL_CHANNELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={channel === c.id ? "btn" : "btn btn-outline"}
                  onClick={() => setChannel(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <p className="kpi-label" style={{ margin: "0 0 0.35rem" }}>
              Apps (otra tarifa)
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {FERMINA_APP_CHANNELS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={channel === c.id ? "btn" : "btn btn-outline"}
                  onClick={() => setChannel(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Plato</th>
                  <th>Precio ({ferminaChannelLabel(channel)})</th>
                </tr>
              </thead>
              <tbody>
                {FERMINA_MOCK_MENU.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{ferminaPriceForChannel(item, channel).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "1rem" }}>
              <button type="button" className="btn" onClick={() => setComandasView("pedido")}>
                Continuar al pedido →
              </button>
            </div>
          </div>
        ) : null}

        {comandasView === "pedido" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>Armar pedido</h4>
            <p className="kpi-label" style={{ marginTop: 0 }}>
              Tarifa: <strong>{ferminaChannelLabel(channel)}</strong> ·{" "}
              <button type="button" className="btn btn-outline" style={{ padding: "0.1rem 0.5rem", fontSize: "0.8rem" }} onClick={() => setComandasView("tarifa")}>
                Cambiar
              </button>
            </p>
            <div className="fermina-ops__fields" style={{ marginTop: "0.75rem" }}>
              <label className="mockup-field">
                <span>Cliente</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre o pedido app"
                />
              </label>
              <label className="mockup-field">
                <span>Mesa / zona</span>
                <input
                  type="text"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  placeholder="Mesa 3 / Mostrador"
                />
              </label>
            </div>
            <label className="mockup-field" style={{ display: "block", marginBottom: "0.75rem" }}>
              <span>Notas cocina</span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. sin picante"
              />
            </label>
            <ul className="fermina-menu-list" style={{ marginBottom: "0.75rem" }}>
              {FERMINA_MOCK_MENU.map((item) => {
                const unitPrice = ferminaPriceForChannel(item, channel);
                return (
                  <li key={item.id} className="fermina-menu-item">
                    <span>
                      <strong>{item.name}</strong>
                      {item.hint ? (
                        <span className="kpi-label" style={{ display: "block" }}>
                          {item.hint}
                        </span>
                      ) : null}
                    </span>
                    <div className="fermina-menu-item__qty">
                      <button type="button" className="btn btn-outline" onClick={() => setCartQty(item.id, -1)}>
                        −
                      </button>
                      <span>{cart[item.id] || 0}</span>
                      <button type="button" className="btn btn-outline" onClick={() => setCartQty(item.id, 1)}>
                        +
                      </button>
                      <span className="kpi-label">
                        <strong>{unitPrice.toFixed(2)} €</strong>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="allergen-panel__summary">
              <strong>{cartTotal.toFixed(2)} €</strong>
              {cartItemCount > 0 ? (
                <span className="kpi-label"> · {cartItemCount} unidades</span>
              ) : null}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button type="button" className="btn btn-outline" onClick={() => setComandasView("tarifa")}>
                ← Tarifa
              </button>
              <button
                type="button"
                className="btn"
                disabled={!cartLines.length}
                onClick={() => setComandasView("cobro")}
              >
                Ir a cobro →
              </button>
              <button type="button" className="btn btn-outline" disabled={!cartItemCount} onClick={() => setCart({})}>
                Vaciar
              </button>
            </div>
          </div>
        ) : null}

        {comandasView === "cobro" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>Cobro</h4>
            {cartLines.length === 0 ? (
              <p className="lead">Primero arma el pedido en la pestaña <strong>Pedido</strong>.</p>
            ) : (
              <>
                <article className="card" style={{ marginBottom: "1rem", boxShadow: "none", border: "1px solid var(--line)" }}>
                  <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
                    {customerName} · {table || "—"} · {ferminaChannelLabel(channel)}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                    {cartLines.map((l) => (
                      <li key={l.menuId}>
                        {l.qty}× {l.name} — {(l.qty * l.unitPrice).toFixed(2)} €
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: "0.75rem 0 0" }}>
                    <strong>Total: {cartTotal.toFixed(2)} €</strong>
                  </p>
                </article>
                <p className="lead" style={{ fontSize: "0.9rem" }}>
                  ¿Cómo cobra el cliente?
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                  {FERMINA_PAYMENTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={paymentMethod === p.id ? "btn" : "btn btn-outline"}
                      style={{ minWidth: "7rem" }}
                      onClick={() => setPaymentMethod(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setComandasView("pedido")}>
                    ← Pedido
                  </button>
                  <button type="button" className="btn" onClick={submitDemoOrder}>
                    Enviar a cocina
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {comandasView === "activas" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>Comandas activas</h4>
            {openOrders.length === 0 ? (
              <p className="lead">No hay comandas abiertas.</p>
            ) : (
              <ul className="fermina-order-list">
                {openOrders.map((o) => (
                  <li key={o.id} className={`fermina-order-card status-${o.status}`}>
                    <div className="fermina-order-card__head">
                      <strong>
                        #{o.orderNumber} · {o.customerName}
                      </strong>
                      <span className="mockup-badge">{o.status}</span>
                    </div>
                    <p className="kpi-label" style={{ margin: "0.25rem 0" }}>
                      {o.table || "—"} · {ferminaChannelLabel(o.channel)} · {ferminaPaymentLabel(o.paymentMethod)}
                    </p>
                    <p className="kpi-label" style={{ margin: "0.25rem 0" }}>
                      {o.lines.map((l) => `${l.qty}× ${l.name}`).join(" · ")}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>{o.total.toFixed(2)} €</strong>
                    </p>
                    <div className="fermina-order-card__actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setPrintDoc({ kind: "comanda", doc: o })}
                      >
                        Imprimir
                      </button>
                      {FERMINA_STATUS_FLOW.filter((s) => s !== o.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="btn btn-outline"
                          onClick={() => patchOrderStatus(o.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn btn-outline" style={{ marginTop: "0.75rem" }} onClick={() => setComandasView("pedido")}>
              + Nuevo pedido
            </button>
          </div>
        ) : null}
      </article>

      {comandasView === "cierre" ? (
      <article className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Cierre del día (control)</h3>
          <span className="mockup-badge">{closedOrders.length} entregadas</span>
          <button type="button" className="btn btn-outline" onClick={resetDemoDay}>
            Reiniciar demo
          </button>
        </div>
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
          Totales de comandas en estado <strong>entregada</strong> — para cuadrar caja y plataformas al cerrar.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem"
          }}
        >
          <article className="card" style={{ margin: 0, boxShadow: "none", border: "1px solid var(--line)" }}>
            <h4 style={{ marginTop: 0 }}>Por forma de cobro</h4>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Cobro</th>
                  <th>Pedidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {dayByPayment.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.count}</td>
                    <td>{row.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={2}>Caja (entregadas)</th>
                  <th>{dayGrandTotal.toFixed(2)} €</th>
                </tr>
              </tfoot>
            </table>
          </article>
          <article className="card" style={{ margin: 0, boxShadow: "none", border: "1px solid var(--line)" }}>
            <h4 style={{ marginTop: 0 }}>Por canal (Glovo / Uber / salón…)</h4>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>Canal</th>
                  <th>Pedidos</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {dayByChannel.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.count}</td>
                    <td>{row.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Canal</th>
              <th>Cobro</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {closedOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="lead">
                  Marca comandas como <strong>entregada</strong> para verlas en el cierre.
                </td>
              </tr>
            ) : (
              closedOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.customerName}</td>
                  <td>{ferminaChannelLabel(o.channel)}</td>
                  <td>{ferminaPaymentLabel(o.paymentMethod)}</td>
                  <td>{o.total.toFixed(2)} €</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>
      ) : null}

      {printDoc?.kind === "comanda" ? (
        <article className="card" style={{ marginBottom: "1rem" }}>
          <div className="fermina-print-toolbar no-print" style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <button type="button" className="btn" onClick={() => window.print()}>
              Imprimir ahora
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setPrintDoc(null)}>
              Cerrar vista
            </button>
          </div>
          <MockFerminaPrintSheet kind="comanda" doc={printDoc.doc} caption="Vista impresión" />
        </article>
      ) : null}

      {comandasView === "facturas" ? (
      <>
      <article className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Facturas emitidas</h3>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{MOCK_FERMINA_INVOICE_CLIENT.invoiceNumber}</td>
              <td>Cliente (ticket)</td>
              <td>{MOCK_FERMINA_INVOICE_CLIENT.customerName}</td>
              <td>{MOCK_FERMINA_INVOICE_CLIENT.total.toFixed(2)} €</td>
              <td>
                <button type="button" className="btn btn-outline" disabled>
                  Imprimir
                </button>
              </td>
            </tr>
            <tr>
              <td>{MOCK_FERMINA_INVOICE_GESTOR.invoiceNumber}</td>
              <td>Gestor / contabilidad</td>
              <td>{MOCK_FERMINA_INVOICE_GESTOR.customerName}</td>
              <td>{MOCK_FERMINA_INVOICE_GESTOR.total.toFixed(2)} €</td>
              <td>
                <button type="button" className="btn btn-outline" disabled>
                  Imprimir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
          Cliente: ticket simplificado para el comensal. Gestor: incluye CUIT y desglose IVA para contabilidad.
        </p>
      </article>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Vistas de impresión (como sale al imprimir)</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Al pulsar <strong>Imprimir</strong> en comanda o factura, el navegador abre esta hoja (logo Fermina,
          líneas y total).
        </p>
        <div className="mockup-print-grid" style={{ marginTop: "1rem" }}>
          <MockFerminaPrintSheet
            kind="comanda"
            doc={MOCK_FERMINA_ORDER}
            caption="Comanda cocina"
          />
          <MockFerminaPrintSheet
            kind="factura"
            doc={MOCK_FERMINA_INVOICE_CLIENT}
            caption="Factura cliente"
          />
          <MockFerminaPrintSheet
            kind="factura"
            doc={MOCK_FERMINA_INVOICE_GESTOR}
            caption="Factura gestor"
          />
        </div>
      </article>
      </>
      ) : null}
    </>
  );
}

function PanelAlergenosCartel() {
  const byCategory = useMemo(() => {
    const groups = new Map();
    for (const item of MOCK_ALLERGEN_CHECKLIST) {
      const cat = item.category || "Otros";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const presentCount = MOCK_ALLERGEN_CHECKLIST.filter((a) => a.present).length;
  const presentOnly = MOCK_ALLERGEN_CHECKLIST.filter((a) => a.present);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(MOCK_PUBLIC_ALLERGEN_URL)}`;

  return (
    <>
      <article className="card allergen-panel">
        <h3 style={{ marginTop: 0 }}>Alérgenos e intolerancias (carta / cocina)</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Lista de referencia — <strong>14 alérgenos obligatorios UE</strong> + extras. Marca{" "}
          <strong>Sí hay</strong> si el alérgeno está en vuestro menú o cocina; el cartel QR solo muestra los
          marcados.
        </p>
        <p className="allergen-panel__summary">
          <span className="allergen-panel__badge">{presentCount}</span> marcados como presentes · 14 obligatorios
          UE
        </p>

        <div className="allergen-checklist">
          {byCategory.map(([category, items]) => (
            <section key={category} className="allergen-checklist__group">
              <h5 className="allergen-checklist__category">{category}</h5>
              <ul className="allergen-checklist__items">
                {items.map((item) => (
                  <li
                    key={item.catalogId}
                    className={`allergen-row${item.present ? " is-present" : ""}`}
                  >
                    <label className="allergen-row__check">
                      <input type="checkbox" checked={Boolean(item.present)} readOnly disabled />
                      <span className="allergen-row__name">{item.name}</span>
                      <span className="allergen-row__state">{item.present ? "Sí hay" : "No hay"}</span>
                    </label>
                    <p className="allergen-row__hint">{item.hint}</p>
                    {item.present && item.notes ? (
                      <p className="kpi-label" style={{ margin: "0.35rem 0 0 1.8rem" }}>
                        {item.notes}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="allergen-panel__actions">
          <button type="button" className="btn" disabled>
            Guardar y actualizar QR
          </button>
          <span className="mockup-badge" style={{ marginLeft: "0.5rem" }}>
            Vista mockup
          </span>
        </div>

        <div className="allergen-panel__qr">
          <img src={qrUrl} width={140} height={140} alt="QR alergias (demo)" />
          <div>
            <a href={MOCK_PUBLIC_ALLERGEN_URL} target="_blank" rel="noreferrer">
              {MOCK_PUBLIC_ALLERGEN_URL}
            </a>
            <p className="kpi-label">Vista pública: solo alérgenos marcados «Sí hay»</p>
          </div>
        </div>
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Vista cliente (QR / cartel)</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          Lo que ve el comensal al escanear el QR — sin login:
        </p>
        <p className="kicker" style={{ marginBottom: "0.5rem" }}>
          Restaurante demo · Manu
        </p>
        <AllergenPublicTable
          allergens={presentOnly}
          emptyMessage="Sin alérgenos declarados en carta."
        />
      </article>
    </>
  );
}

function PanelClientes() {
  return (
    <article className="card" style={{ overflow: "auto" }}>
      <h3 style={{ marginTop: 0 }}>Alergias por comensal (reserva)</h3>
      <p className="lead" style={{ fontSize: "0.85rem", marginTop: 0 }}>
        Notas de sala para esta noche — distinto del{" "}
        <strong>cartel legal de alérgenos</strong> (pestaña Cartel alérgenos).
      </p>
      <table className="mockup-table">
        <thead>
          <tr>
            <th>Mesa / hora</th>
            <th>Cliente</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>T4 · 20:00</td>
            <td>Pablo Vega</td>
            <td>Sin gluten</td>
          </tr>
          <tr>
            <td>I5 · 20:45</td>
            <td>Grupo aniversario</td>
            <td>1 vegano</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

function PanelProveedores() {
  return (
    <div className="two-col">
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Entregas previstas</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--muted)" }}>
          <li>Mariscos Costa — mañana 07:00</li>
          <li>Vinos Sur — miércoles</li>
        </ul>
      </article>
      <article className="card">
        <h3 style={{ marginTop: 0 }}>Incidencias stock</h3>
        <p className="lead" style={{ fontSize: "0.9rem", margin: 0 }}>
          Aceite premium — pedido mínimo no alcanzado; combinar con pedido de bar.
        </p>
      </article>
    </div>
  );
}

const TOOLBAR = {
  mapa: { title: "Servicio noche", badge: "Terraza + interior", extra: "52 cubiertos previstos" },
  reservas: { title: "Reservas", badge: "Lista completa", extra: "52 cubiertos previstos" },
  espera: { title: "Lista de espera", badge: "3 grupos", extra: "Tiempo medio 22 min" },
  comandas: { title: "Comandas y facturación", badge: "Fermina Food", extra: "Demo · cierre caja" },
  clientes: { title: "Alergias por reserva", badge: "2 mesas con nota", extra: "52 cubiertos previstos" },
  alergenos: { title: "Cartel alérgenos", badge: "2 presentes en carta", extra: "QR cartel sala" },
  proveedores: { title: "Proveedores", badge: "2 entregas", extra: "Semana actual" }
};

export default function RestaurantePanelMockup() {
  const [tab, setTab] = useState("mapa");
  const tb = TOOLBAR[tab];

  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">Dakinis · Sala</div>
        <MockupSidebarNav tabs={TABS} activeId={tab} onSelect={setTab} />
      </aside>
      <div className="mockup-main">
        <Toolbar title={tb.title} badge={tb.badge} user="Maître" extra={tb.extra} />
        {tab === "mapa" ? <PanelMapa /> : null}
        {tab === "reservas" ? <PanelReservas /> : null}
        {tab === "espera" ? <PanelEspera /> : null}
        {tab === "comandas" ? <PanelComandas /> : null}
        {tab === "clientes" ? <PanelClientes /> : null}
        {tab === "alergenos" ? <PanelAlergenosCartel /> : null}
        {tab === "proveedores" ? <PanelProveedores /> : null}
      </div>
    </div>
  );
}
