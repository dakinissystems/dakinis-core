import { useEffect, useMemo, useState } from "react";
import {
  DAKINIS_RESTAURANT_ALLERGEN_CATALOG,
  DAKINIS_RESTAURANT_EXTRA_ALLERGENS
} from "@dakinis/shared/catalog/restaurant-allergens.js";
import AllergenPublicTable from "../components/AllergenPublicTable.jsx";
import { FerminaComandasSubnav } from "../components/FerminaComandasSubnav.jsx";
import FerminaPrintSheet from "../components/FerminaPrintSheet.jsx";
import FerminaKitchenOrderTime from "../components/FerminaKitchenOrderTime.jsx";
import RestaurantMesasPanel from "../components/RestaurantMesasPanel.jsx";
import RestaurantRoleNav, {
  dakinisReadRestaurantRole,
  dakinisWriteRestaurantRole
} from "../components/RestaurantRoleNav.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisFerminaPrint } from "../utils/ferminaPrint.js";
import { DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES } from "@dakinis/shared/catalog/restaurant-floor.js";
import { dakinisTableItemCount } from "../utils/restaurantFloorPlan.js";
import { dakinisPlayKitchenBell } from "../utils/kitchenBell.js";
import MockupSidebarNav from "./MockupSidebarNav.jsx";
import MockupToolbar from "./MockupToolbar.jsx";
import { dakinisMockupTabList, dakinisMockupToolbar } from "./mockupPanelHelpers.js";

const TAB_IDS = ["mapa", "reservas", "espera", "comandas", "clientes", "alergenos", "proveedores"];

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

function PanelMapa() {
  return (
    <>
      <div className="two-col mockup-panel-spaced">
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Plan de sala (esquema)</h3>
          <div className="mockup-zone-grid">
            <div className="mockup-zone-cell">
              Terraza 1–5
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>Demo en Comandas → Mesas</div>
            </div>
            <div className="mockup-zone-cell">
              Salón 1–5
              <div style={{ marginTop: "0.35rem", color: "var(--brand)" }}>Cuenta y cierre por mesa</div>
            </div>
            <div className="mockup-zone-cell">
              Lista espera
              <div style={{ marginTop: "0.35rem" }}>3 grupos</div>
            </div>
          </div>
        </article>
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Resumen</h3>
          <div className="system-kpis system-kpis--pair">
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

      <article className="card mockup-table-card">
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
    <article className="card mockup-table-card">
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

function ferminaEmptyTableSessions(tables) {
  return Object.fromEntries(tables.map((t) => [t.id, { cart: {}, notes: "" }]));
}

function ferminaSeedTableSessions(tables) {
  const base = ferminaEmptyTableSessions(tables);
  base["terraza-3"] = {
    cart: { "bites-cheddar": 2, "chicken-bites": 1 },
    notes: "Sin picante en los bites"
  };
  return base;
}

function ferminaTableLabel(tables, tableId) {
  return tables.find((t) => t.id === tableId)?.label || tableId;
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

const DEMO_RESTAURANT_VENUE = "Tu restaurante";

const MOCK_FERMINA_ORDER = {
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

function ferminaSeedOrders() {
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

const MOCK_FERMINA_INVOICE_CLIENT = {
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

const MOCK_FERMINA_INVOICE_GESTOR = {
  invoiceNumber: "DEMO-G-2026-0003",
  type: "gestor",
  customerName: "Tu restaurante S.L.",
  taxId: "30-71234567-8",
  subtotal: 41.5,
  tax: 8.72,
  total: 50.22,
  lines: MOCK_FERMINA_LINES
};

const MOCK_ROLE_VIEWS = {
  camarero: ["mesas", "tarifa", "pedido", "cobro"],
  cocina: ["activas"],
  admin: ["cierre", "facturas"]
};

function PanelComandas({ panelRole, mesasOnly = false }) {
  const { locale, t } = useLocale();
  const [comandasView, setComandasView] = useState(
    panelRole === "cocina" ? "activas" : panelRole === "admin" ? "cierre" : "mesas"
  );
  const [floorTables, setFloorTables] = useState(() =>
    DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((tbl) => ({ ...tbl }))
  );
  const [orders, setOrders] = useState(ferminaSeedOrders);
  const [nextOrderNum, setNextOrderNum] = useState(1043);
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState("Walk-in barra");
  const [table, setTable] = useState("Barra 2");
  const [channel, setChannel] = useState("salon");
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [notes, setNotes] = useState("");
  const [printDoc, setPrintDoc] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [tableSessions, setTableSessions] = useState(() => ferminaSeedTableSessions(floorTables));
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

  const comandasViews = useMemo(
    () => FERMINA_COMANDAS_VIEWS.filter((v) => (MOCK_ROLE_VIEWS[panelRole] || []).includes(v.id)),
    [panelRole]
  );

  const mockMenu = useMemo(
    () =>
      FERMINA_MOCK_MENU.map((m) => ({
        id: m.id,
        name: m.name,
        nameEs: m.name,
        priceEur: ferminaPriceForChannel(m, "salon")
      })),
    []
  );

  const kitchenOrders = useMemo(
    () => openOrders.filter((o) => o.status === "nueva" || o.status === "cocina" || o.status === "lista"),
    [openOrders]
  );

  const occupiedTablesCount = useMemo(
    () => floorTables.filter((tbl) => dakinisTableItemCount(tableSessions[tbl.id]?.cart) > 0).length,
    [floorTables, tableSessions]
  );

  useEffect(() => {
    if (mesasOnly) {
      setComandasView("mesas");
      return;
    }
    setComandasView(panelRole === "cocina" ? "activas" : panelRole === "admin" ? "cierre" : "mesas");
  }, [panelRole, mesasOnly]);

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
    const label = ferminaTableLabel(floorTables, tableId);
    const order = {
      id: `o-${nextOrderNum}`,
      orderNumber: nextOrderNum,
      venueName: DEMO_RESTAURANT_VENUE,
      createdAt: new Date().toISOString(),
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
    dakinisPlayKitchenBell();
    if (panelRole === "cocina") setComandasView("activas");
  }

  function closeTable(tableId, payMethod) {
    const session = tableSessions[tableId];
    if (!session) return;
    const lines = ferminaTableCartLines(session.cart, "salon");
    if (!lines.length) return;
    const label = ferminaTableLabel(floorTables, tableId);
    const order = {
      id: `o-${nextOrderNum}`,
      orderNumber: nextOrderNum,
      venueName: DEMO_RESTAURANT_VENUE,
      createdAt: new Date().toISOString(),
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
      venueName: DEMO_RESTAURANT_VENUE,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim() || "Cliente",
      table: table.trim(),
      channel,
      paymentMethod,
      status: "cocina",
      notes: notes.trim(),
      lines,
      total: ferminaLinesTotal(lines)
    };
    setOrders((prev) => [order, ...prev]);
    setNextOrderNum((n) => n + 1);
    setCart({});
    setPrintDoc({ kind: "comanda", doc: order });
    dakinisPlayKitchenBell();
    if (panelRole === "cocina") setComandasView("activas");
    else setComandasView("mesas");
  }

  function patchOrderStatus(orderId, status) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  function resetDemoDay() {
    setOrders(ferminaSeedOrders());
    setNextOrderNum(1043);
    setCart({});
    setTableSessions(ferminaSeedTableSessions(floorTables));
    setPrintDoc(null);
  }

  return (
    <>
      <article className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem" }}>{t("mockupPanels.restaurante.brand")}</h3>
            <p className="kicker" style={{ margin: 0 }}>
              {t("mockupPanels.restaurante.comandasKicker")}
            </p>
            <p className="lead" style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
              <strong>Mesas:</strong> 5 salón + 5 terraza, cuenta por mesa y cierre (efectivo/tarjeta). Para llevar y
              apps: <strong>tarifa</strong> → <strong>pedido</strong> → <strong>cobro</strong>.
            </p>
          </div>
          <span className="mockup-badge">Demo interactivo</span>
        </div>

        {mesasOnly ? (
          <p className="lead" style={{ fontSize: "0.9rem", margin: "0 0 0.75rem" }}>
            Toca una mesa en el plano, añade platos y envía a cocina. El stock y el dashboard se actualizan al cerrar la
            cuenta.
          </p>
        ) : (
          <FerminaComandasSubnav
            views={comandasViews}
            activeId={comandasView}
            onSelect={setComandasView}
            badges={{
              mesas: occupiedTablesCount > 0 ? String(occupiedTablesCount) : null,
              pedido: cartItemCount > 0 ? String(cartItemCount) : null,
              activas:
                (panelRole === "cocina" ? kitchenOrders.length : openOrders.length) > 0
                  ? String(panelRole === "cocina" ? kitchenOrders.length : openOrders.length)
                  : null
            }}
          />
        )}

        {comandasView === "mesas" || mesasOnly ? (
          <RestaurantMesasPanel
            t={t}
            menu={mockMenu}
            tables={floorTables}
            sessions={tableSessions}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
            onTablesChange={setFloorTables}
            onSessionsChange={setTableSessions}
            layoutEditable={panelRole === "camarero" || panelRole === "admin"}
            positionEditable={panelRole === "camarero" || panelRole === "admin"}
            busy={false}
            mesaClosePayment={mesaClosePayment}
            onMesaClosePaymentChange={setMesaClosePayment}
            onSendKitchen={(tableId) => sendTableToKitchen(tableId)}
            onCloseTable={(tableId, payMethod) => closeTable(tableId, payMethod)}
          />
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
            <h4 style={{ marginTop: 0 }}>
              {panelRole === "cocina" ? "Cola de cocina" : "Comandas activas"}
            </h4>
            {(panelRole === "cocina" ? kitchenOrders : openOrders).length === 0 ? (
              <p className="lead">No hay comandas abiertas.</p>
            ) : (
              <ul className="fermina-order-list">
                {(panelRole === "cocina" ? kitchenOrders : openOrders).map((o) => (
                  <li key={o.id} className={`fermina-order-card status-${o.status}`}>
                    <div className="fermina-order-card__head">
                      <strong>
                        #{o.orderNumber} · {o.customerName}
                      </strong>
                      <span className="mockup-badge">{o.status}</span>
                    </div>
                    {panelRole === "cocina" ? (
                      <FerminaKitchenOrderTime createdAt={o.createdAt} t={t} locale={locale} />
                    ) : null}
                    <p className="kpi-label" style={{ margin: "0.25rem 0" }}>
                      {o.table || "—"} · {ferminaChannelLabel(o.channel)} · {ferminaPaymentLabel(o.paymentMethod)}
                      {panelRole !== "cocina" && o.createdAt
                        ? ` · ${new Date(o.createdAt).toLocaleString(locale === "en" ? "en-US" : "es-ES")}`
                        : null}
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
        <div className="fermina-print-host" style={{ marginBottom: "1rem" }}>
          <div className="fermina-print-toolbar no-print" style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <button
              type="button"
              className="btn"
              onClick={() => void dakinisFerminaPrint(document.querySelector(".fermina-print-host"))}
            >
              Imprimir ahora
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setPrintDoc(null)}>
              Cerrar vista
            </button>
          </div>
          <FerminaPrintSheet
            kind="comanda"
            doc={printDoc.doc}
            businessName={DEMO_RESTAURANT_VENUE}
            channelLabel={ferminaChannelLabel}
            paymentLabel={ferminaPaymentLabel}
            showLogo={false}
          />
        </div>
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
          Al pulsar <strong>Imprimir</strong> en comanda o factura, el navegador abre esta hoja con líneas y total.
        </p>
        <div className="mockup-print-grid" style={{ marginTop: "1rem" }}>
          <FerminaPrintSheet
            kind="comanda"
            doc={MOCK_FERMINA_ORDER}
            businessName={DEMO_RESTAURANT_VENUE}
            channelLabel={ferminaChannelLabel}
            paymentLabel={ferminaPaymentLabel}
            caption="Comanda cocina"
            showLogo={false}
          />
          <FerminaPrintSheet
            kind="factura"
            doc={MOCK_FERMINA_INVOICE_CLIENT}
            businessName={DEMO_RESTAURANT_VENUE}
            caption="Factura cliente"
            showLogo={false}
          />
          <FerminaPrintSheet
            kind="factura"
            doc={MOCK_FERMINA_INVOICE_GESTOR}
            businessName={DEMO_RESTAURANT_VENUE}
            caption="Factura gestor"
            showLogo={false}
          />
        </div>
      </article>
      </>
      ) : null}
    </>
  );
}

function PanelAlergenosCartel() {
  const { t } = useLocale();
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
            {t("mockupPanels.demoBadge")}
          </span>
        </div>

        <div className="allergen-panel__qr">
          <img src={qrUrl} width={140} height={140} alt="QR alergias" />
          <div>
            <p className="lead" style={{ fontSize: "0.9rem", margin: 0 }}>
              {t("mockupPanels.restaurante.allergenQrHint")}
            </p>
            <p className="kpi-label">Solo alérgenos marcados «Sí hay»</p>
          </div>
        </div>
      </article>

      <article className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Vista del comensal</h3>
        <p className="lead" style={{ fontSize: "0.9rem" }}>
          {t("mockupPanels.restaurante.allergenPublicLead")}
        </p>
        <p className="kicker" style={{ marginBottom: "0.5rem" }}>
          Carta de alérgenos
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
    <article className="card mockup-table-card">
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

export default function RestaurantePanelMockup() {
  const { t } = useLocale();
  const [tab, setTab] = useState("mapa");
  const [panelRole, setPanelRole] = useState(dakinisReadRestaurantRole);
  const tabs = dakinisMockupTabList(t, "restaurante", TAB_IDS);
  const visibleTabs = tabs.filter((item) => panelRole === "admin" || item.id !== "proveedores");
  const tb = dakinisMockupToolbar(t, "restaurante", tab);

  return (
    <div className="mockup-app">
      <aside className="mockup-sidebar">
        <div className="mockup-sidebar-brand">{t("mockupPanels.restaurante.brand")}</div>
        <MockupSidebarNav tabs={visibleTabs} activeId={tab} onSelect={setTab} />
      </aside>
      <div className="mockup-main">
        <MockupToolbar title={tb.title} badge={tb.badge} roleKey={tb.roleKey} extra={tb.extra} />
        <RestaurantRoleNav
          role={panelRole}
          onRoleChange={(next) => {
            setPanelRole(next);
            dakinisWriteRestaurantRole(next);
            if (next !== "admin" && tab === "proveedores") setTab("comandas");
          }}
        />
        {tab === "mapa" ? <PanelComandas panelRole={panelRole === "cocina" ? "camarero" : panelRole} mesasOnly /> : null}
        {tab === "reservas" ? <PanelReservas /> : null}
        {tab === "espera" ? <PanelEspera /> : null}
        {tab === "comandas" ? <PanelComandas panelRole={panelRole} /> : null}
        {tab === "clientes" ? <PanelClientes /> : null}
        {tab === "alergenos" ? <PanelAlergenosCartel /> : null}
        {tab === "proveedores" ? <PanelProveedores /> : null}
      </div>
    </div>
  );
}
