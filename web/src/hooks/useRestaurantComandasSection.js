import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { DAKINIS_FERMINA_HOUSE_SLUG } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisFetchRestaurantFloor } from "../services/restaurant-floor.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";
import { dakinisEmptyCart } from "../components/RestaurantComandasSection.shared.js";
import {
  dakinisDefaultFloorTables,
  dakinisTableItemCount,
  dakinisTableLabel
} from "../utils/restaurantFloorPlan.js";
import { dakinisRestaurantDayCloseSummary } from "../utils/restaurantOrderMeta.js";
import { dakinisPlayKitchenBell } from "../utils/kitchenBell.js";
import { RESTAURANT_COMANDAS_INITIAL, restaurantComandasReducer } from "../components/restaurantComandasReducer.js";

const ROLE_DEFAULT_VIEW = {
  camarero: "mesas",
  cocina: "activas",
  admin: "cierre"
};

export function useRestaurantComandasSection({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  staffRole = "camarero"
}) {
  const { locale, t } = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const effectiveSlug = dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical);
  const isFermina = effectiveSlug === DAKINIS_FERMINA_HOUSE_SLUG;

  const [state, dispatch] = useReducer(restaurantComandasReducer, {
    ...RESTAURANT_COMANDAS_INITIAL,
    tables: dakinisDefaultFloorTables()
  });
  const {
    menu,
    brand,
    orders,
    invoices,
    cart,
    table,
    customerName,
    channel,
    paymentMethod,
    notes,
    invoiceType,
    taxId,
    printDoc,
    tables,
    tableSessions,
    selectedTableId,
    mesaClosePayment,
    error,
    busy
  } = state;

  const setMenu = (value) =>
    dispatch({ type: "setField", field: "menu", value: typeof value === "function" ? value(menu) : value });
  const setBrand = (value) =>
    dispatch({ type: "setField", field: "brand", value: typeof value === "function" ? value(brand) : value });
  const setOrders = (value) =>
    dispatch({ type: "setField", field: "orders", value: typeof value === "function" ? value(orders) : value });
  const setInvoices = (value) =>
    dispatch({ type: "setField", field: "invoices", value: typeof value === "function" ? value(invoices) : value });
  const setCart = (value) =>
    dispatch({ type: "setField", field: "cart", value: typeof value === "function" ? value(cart) : value });
  const setTable = (value) => dispatch({ type: "setField", field: "table", value });
  const setCustomerName = (value) => dispatch({ type: "setField", field: "customerName", value });
  const setChannel = (value) => dispatch({ type: "setField", field: "channel", value });
  const setPaymentMethod = (value) => dispatch({ type: "setField", field: "paymentMethod", value });
  const setNotes = (value) => dispatch({ type: "setField", field: "notes", value });
  const setInvoiceType = (value) => dispatch({ type: "setField", field: "invoiceType", value });
  const setTaxId = (value) => dispatch({ type: "setField", field: "taxId", value });
  const setPrintDoc = (value) => dispatch({ type: "setField", field: "printDoc", value });
  const setTables = (value) =>
    dispatch({ type: "setField", field: "tables", value: typeof value === "function" ? value(tables) : value });
  const setTableSessions = (value) =>
    dispatch({
      type: "setField",
      field: "tableSessions",
      value: typeof value === "function" ? value(tableSessions) : value
    });
  const setSelectedTableId = (value) => dispatch({ type: "setField", field: "selectedTableId", value });
  const setMesaClosePayment = (value) => dispatch({ type: "setField", field: "mesaClosePayment", value });
  const setError = (value) => dispatch({ type: "setError", error: value });
  const setBusy = (value) => dispatch({ type: "setBusy", busy: value });

  const comandasViews = useMemo(() => {
    const all = {
      mesas: { id: "mesas", label: t("fermina.viewMesas") },
      tarifa: { id: "tarifa", label: t("fermina.viewTarifa") },
      pedido: { id: "pedido", label: t("fermina.viewPedido") },
      cobro: { id: "cobro", label: t("fermina.viewCobro") },
      activas: { id: "activas", label: t("fermina.viewActivas") },
      cierre: { id: "cierre", label: t("fermina.viewCierre") },
      facturas: { id: "facturas", label: t("fermina.viewFacturas") }
    };
    const byRole = {
      camarero: ["mesas", "tarifa", "pedido", "cobro"],
      cocina: ["activas"],
      admin: ["cierre", "facturas"]
    };
    return (byRole[staffRole] || Object.keys(all)).flatMap((id) => (all[id] ? [all[id]] : []));
  }, [staffRole, t]);

  const roleDefaultView = ROLE_DEFAULT_VIEW[staffRole] || "mesas";
  const [comandasViewPick, setComandasViewPick] = useState(null);
  const [seenStaffRole, setSeenStaffRole] = useState(staffRole);
  if (staffRole !== seenStaffRole) {
    setSeenStaffRole(staffRole);
    setComandasViewPick(null);
  }
  const comandasView = comandasViewPick ?? roleDefaultView;
  const setComandasView = setComandasViewPick;

  const cartItemCount = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + (qty || 0), 0),
    [cart]
  );

  const fetchOpts = useMemo(
    () => ({
      businessId: effectiveSlug,
      businessTypeHeader: activeSystemKey
    }),
    [effectiveSlug, activeSystemKey]
  );

  const sessionToken = apiSession?.token;
  const apiSessionRef = useRef(apiSession);
  apiSessionRef.current = apiSession;

  const reload = useCallback(async () => {
    const sess = apiSessionRef.current;
    if (!sessionToken || !sess?.token) return;
    dispatch({ type: "setError", error: "" });
    try {
      const [menuRes, ordersRes, invRes, floorState] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/restaurant/menu", sess, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/orders", sess, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/invoices", sess, fetchOpts),
        dakinisFetchRestaurantFloor(sess, fetchOpts)
      ]);
      dispatch({
        type: "loaded",
        menu: Array.isArray(menuRes?.data?.menu) ? menuRes.data.menu : [],
        brand: menuRes?.data?.brand ?? null,
        orders: Array.isArray(ordersRes?.data?.orders) ? ordersRes.data.orders : [],
        invoices: Array.isArray(invRes?.data?.invoices) ? invRes.data.invoices : [],
        tables: floorState.tables,
        tableSessions: floorState.sessions
      });
    } catch (e) {
      dispatch({ type: "setError", error: e instanceof Error ? e.message : t("fermina.loadError") });
    }
  }, [sessionToken, fetchOpts, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  const menuById = useMemo(() => {
    const list = Array.isArray(menu) ? menu : [];
    return new Map(list.map((m) => [m.id, m]));
  }, [menu]);

  const cartLines = useMemo(() => {
    const lines = [];
    for (const [menuId, qty] of Object.entries(cart)) {
      if (qty <= 0) continue;
      const item = menuById.get(menuId);
      lines.push({
        menuId,
        name: item?.nameEs || item?.name || menuId,
        qty,
        unitPrice: item?.priceEur ?? 0
      });
    }
    return lines;
  }, [cart, menuById]);

  const cartTotal = useMemo(
    () => cartLines.reduce((a, l) => a + l.qty * l.unitPrice, 0),
    [cartLines]
  );

  const dayClose = useMemo(
    () => dakinisRestaurantDayCloseSummary(Array.isArray(orders) ? orders : [], t),
    [orders, t]
  );

  const openOrders = useMemo(
    () => (Array.isArray(orders) ? orders : []).filter((o) => o.status !== "entregada" && o.status !== "cancelada"),
    [orders]
  );

  const kitchenOrders = useMemo(
    () =>
      openOrders.filter((o) => o.status === "nueva" || o.status === "cocina" || o.status === "lista"),
    [openOrders]
  );

  const occupiedTablesCount = useMemo(
    () =>
      (Array.isArray(tables) ? tables : []).filter((tbl) => dakinisTableItemCount(tableSessions[tbl.id]?.cart) > 0)
        .length,
    [tables, tableSessions]
  );

  async function dakinisSaveFloor(nextTables) {
    setTables(nextTables);
    if (!apiSession?.token) return;
    try {
      await dakinisTenantJsonFetch("/api/tenant/restaurant/floor", apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: { tables: nextTables }
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("restaurant.floorSaveError"));
    }
  }

  async function dakinisPatchTableSession(tableId, session, opts = {}) {
    setTableSessions((prev) => ({ ...prev, [tableId]: { cart: session.cart, notes: session.notes } }));
    if (!apiSession?.token) return;
    try {
      await dakinisTenantJsonFetch(
        `/api/tenant/restaurant/table-sessions/${encodeURIComponent(tableId)}`,
        apiSession,
        { ...fetchOpts, method: "PATCH", body: opts.clear ? { clear: true } : session }
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.orderError"));
    }
  }

  async function dakinisSubmitTableOrder(tableId, lines, notes, status, payMethod) {
    const label = dakinisTableLabel(tables, tableId);
    setBusy(true);
    setError("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/orders", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: {
          channel: "salon",
          paymentMethod: payMethod || "tarjeta",
          table: label,
          customerName: label,
          notes,
          lines
        }
      });
      const order = json?.data?.order;
      if (order && status !== "nueva") {
        await dakinisTenantJsonFetch(
          `/api/tenant/restaurant/orders/${encodeURIComponent(order.id)}`,
          apiSession,
          { ...fetchOpts, method: "PATCH", body: { status } }
        );
      }
      await dakinisPatchTableSession(tableId, { cart: {}, notes: "" }, { clear: true });
      setPrintDoc({ kind: "comanda", data: order });
      if (status === "cocina") dakinisPlayKitchenBell();
      if (staffRole === "cocina") setComandasView("activas");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.orderError"));
    } finally {
      setBusy(false);
    }
  }

  function dakinisCartQty(menuId, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const cur = next[menuId] || 0;
      const v = Math.max(0, cur + delta);
      if (v === 0) delete next[menuId];
      else next[menuId] = v;
      return next;
    });
  }

  async function dakinisSubmitOrder() {
    if (!cartLines.length) return;
    setBusy(true);
    setError("");
    try {
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/orders", apiSession, {
        ...fetchOpts,
        method: "POST",
        body: {
          channel,
          paymentMethod,
          table,
          customerName,
          notes,
          lines: cartLines
        }
      });
      setCart(dakinisEmptyCart());
      setPrintDoc({ kind: "comanda", data: json?.data?.order });
      dakinisPlayKitchenBell();
      if (staffRole === "cocina") setComandasView("activas");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.orderError"));
    } finally {
      setBusy(false);
    }
  }

  async function dakinisPatchStatus(orderId, status) {
    setBusy(true);
    try {
      await dakinisTenantJsonFetch(`/api/tenant/restaurant/orders/${encodeURIComponent(orderId)}`, apiSession, {
        ...fetchOpts,
        method: "PATCH",
        body: { status }
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.statusError"));
    } finally {
      setBusy(false);
    }
  }

  async function dakinisCreateInvoice(fromOrder) {
    setBusy(true);
    setError("");
    try {
      const body = fromOrder
        ? {
            type: invoiceType,
            orderId: fromOrder.id,
            orderNumber: fromOrder.orderNumber,
            customerName: fromOrder.customerName,
            taxId,
            lines: fromOrder.lines
          }
        : {
            type: invoiceType,
            customerName,
            taxId,
            lines: cartLines
          };
      const json = await dakinisTenantJsonFetch("/api/tenant/restaurant/invoices", apiSession, {
        ...fetchOpts,
        method: "POST",
        body
      });
      setPrintDoc({ kind: "factura", data: json?.data?.invoice });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.invoiceError"));
    } finally {
      setBusy(false);
    }
  }

  const venueName = brand?.name || t("mockupPanels.restaurante.brand");
  const shouldRender = Boolean(apiSession?.token) && (isFermina || menu.length > 0);

  return {
    shouldRender,
    panelsCtx: {
      venueName,
      t,
      error,
      staffRole,
      comandasViews,
      comandasView,
      setComandasView,
      occupiedTablesCount,
      cartItemCount,
      kitchenOrders,
      openOrders,
      menu,
      tables,
      tableSessions,
      selectedTableId,
      setSelectedTableId,
      setTables,
      setTableSessions,
      dakinisPatchTableSession,
      dakinisSaveFloor,
      busy,
      mesaClosePayment,
      setMesaClosePayment,
      dakinisSubmitTableOrder,
      channel,
      setChannel,
      customerName,
      setCustomerName,
      table,
      setTable,
      notes,
      setNotes,
      cart,
      dakinisCartQty,
      cartTotal,
      cartLines,
      dakinisEmptyCart,
      setCart,
      paymentMethod,
      setPaymentMethod,
      dakinisSubmitOrder,
      dakinisCreateInvoice,
      orders,
      locale,
      dateLocale,
      setPrintDoc,
      dakinisPatchStatus,
      dayClose,
      invoiceType,
      setInvoiceType,
      taxId,
      setTaxId,
      invoices,
      printDoc
    }
  };
}
