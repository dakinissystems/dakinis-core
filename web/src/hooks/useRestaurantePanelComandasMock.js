import { useMemo, useRef, useState } from "react";
import { DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES } from "@dakinis/shared/catalog/restaurant-floor.js";
import { dakinisTableItemCount } from "../utils/restaurantFloorPlan.js";
import { dakinisPlayKitchenBell } from "../utils/kitchenBell.js";
import { useLocale } from "../context/LocaleContext.jsx";
import {
  DEMO_RESTAURANT_VENUE,
  FERMINA_COMANDAS_VIEWS,
  FERMINA_MOCK_MENU,
  ferminaLinesTotal,
  ferminaPriceForChannel,
  ferminaSeedOrders,
  ferminaSeedTableSessions,
  ferminaTableCartLines,
  ferminaTableLabel,
  MOCK_ROLE_VIEWS
} from "../mockups/restaurantePanelComandasMockData.js";

export function useRestaurantePanelComandasMock({ panelRole, mesasOnly = false }) {
  const { locale, t } = useLocale();
  const panelDefaultView = mesasOnly
    ? "mesas"
    : panelRole === "cocina"
      ? "activas"
      : panelRole === "admin"
        ? "cierre"
        : "mesas";
  const [comandasViewPick, setComandasViewPick] = useState(null);
  const [seenPanelRole, setSeenPanelRole] = useState(panelRole);
  const [seenMesasOnly, setSeenMesasOnly] = useState(mesasOnly);
  if (panelRole !== seenPanelRole || mesasOnly !== seenMesasOnly) {
    setSeenPanelRole(panelRole);
    setSeenMesasOnly(mesasOnly);
    setComandasViewPick(null);
  }
  const comandasView = comandasViewPick ?? panelDefaultView;
  const setComandasView = setComandasViewPick;

  const [floorTables, setFloorTables] = useState(() =>
    DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((tbl) => ({ ...tbl }))
  );
  const [orders, setOrders] = useState(ferminaSeedOrders);
  const nextOrderNumRef = useRef(1043);
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
    const lines = [];
    for (const item of FERMINA_MOCK_MENU) {
      const qty = cart[item.id] || 0;
      if (qty <= 0) continue;
      lines.push({
        menuId: item.id,
        name: item.name,
        qty,
        unitPrice: ferminaPriceForChannel(item, channel)
      });
    }
    return lines;
  }, [cart, channel]);

  const cartTotal = useMemo(() => ferminaLinesTotal(cartLines), [cartLines]);
  const closedOrders = useMemo(() => orders.filter((o) => o.status === "entregada"), [orders]);

  const dayByPayment = useMemo(() => {
    const map = Object.fromEntries(
      [
        { id: "efectivo", label: "Efectivo" },
        { id: "tarjeta", label: "Tarjeta" }
      ].map((p) => [p.id, { label: p.label, total: 0, count: 0 }])
    );
    for (const o of closedOrders) {
      const bucket = map[o.paymentMethod] || map.efectivo;
      bucket.total += o.total;
      bucket.count += 1;
    }
    return Object.values(map);
  }, [closedOrders]);

  const dayByChannel = useMemo(() => {
    const channels = [
      { id: "salon", label: "Salón" },
      { id: "takeaway", label: "Para llevar" },
      { id: "delivery", label: "Delivery propio" },
      { id: "glovo", label: "Glovo" },
      { id: "uber", label: "Uber Eats" }
    ];
    const map = Object.fromEntries(channels.map((c) => [c.id, { label: c.label, total: 0, count: 0 }]));
    for (const o of closedOrders) {
      const bucket = map[o.channel] || map.salon;
      bucket.total += o.total;
      bucket.count += 1;
    }
    return Object.values(map);
  }, [closedOrders]);

  const dayGrandTotal = useMemo(() => closedOrders.reduce((s, o) => s + o.total, 0), [closedOrders]);

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

  const kitchenOrders = useMemo(() => {
    const list = [];
    for (const order of openOrders) {
      if (order.status === "nueva" || order.status === "cocina" || order.status === "lista") {
        list.push(order);
      }
    }
    return list;
  }, [openOrders]);

  const occupiedTablesCount = useMemo(
    () => floorTables.filter((tbl) => dakinisTableItemCount(tableSessions[tbl.id]?.cart) > 0).length,
    [floorTables, tableSessions]
  );

  function allocateOrderNum() {
    const orderNum = nextOrderNumRef.current;
    nextOrderNumRef.current += 1;
    return orderNum;
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
    const orderNum = allocateOrderNum();
    const order = {
      id: `o-${orderNum}`,
      orderNumber: orderNum,
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
    const orderNum = allocateOrderNum();
    const order = {
      id: `o-${orderNum}`,
      orderNumber: orderNum,
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
    clearTableSession(tableId);
    setPrintDoc({ kind: "comanda", doc: order });
  }

  function submitDemoOrder() {
    if (!cartLines.length) return;
    const lines = cartLines.map(({ name, qty, unitPrice }) => ({ name, qty, unitPrice }));
    const orderNum = allocateOrderNum();
    const order = {
      id: `o-${orderNum}`,
      orderNumber: orderNum,
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
    nextOrderNumRef.current = 1043;
    setCart({});
    setTableSessions(ferminaSeedTableSessions(floorTables));
    setPrintDoc(null);
  }

  return {
    locale,
    t,
    panelRole,
    mesasOnly,
    comandasView,
    setComandasView,
    comandasViews,
    floorTables,
    setFloorTables,
    tableSessions,
    setTableSessions,
    selectedTableId,
    setSelectedTableId,
    mesaClosePayment,
    setMesaClosePayment,
    mockMenu,
    occupiedTablesCount,
    cartItemCount,
    kitchenOrders,
    openOrders,
    channel,
    setChannel,
    customerName,
    setCustomerName,
    table,
    setTable,
    notes,
    setNotes,
    cart,
    setCart,
    cartLines,
    cartTotal,
    paymentMethod,
    setPaymentMethod,
    setCartQty,
    submitDemoOrder,
    sendTableToKitchen,
    closeTable,
    patchOrderStatus,
    closedOrders,
    dayByPayment,
    dayByChannel,
    dayGrandTotal,
    resetDemoDay,
    printDoc,
    setPrintDoc
  };
}
