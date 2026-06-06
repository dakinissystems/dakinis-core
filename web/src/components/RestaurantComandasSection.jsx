import { useCallback, useEffect, useMemo, useState } from "react";
import { DAKINIS_FERMINA_HOUSE_SLUG } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisFetchRestaurantFloor } from "../services/restaurant-floor.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";
import { FerminaComandasSubnav } from "./FerminaComandasSubnav.jsx";
import FerminaKitchenOrderTime from "./FerminaKitchenOrderTime.jsx";
import FerminaPrintSheet from "./FerminaPrintSheet.jsx";
import RestaurantMesasPanel from "./RestaurantMesasPanel.jsx";
import { dakinisFerminaPrint } from "../utils/ferminaPrint.js";
import {
  dakinisDefaultFloorTables,
  dakinisTableItemCount,
  dakinisTableLabel
} from "../utils/restaurantFloorPlan.js";
import {
  dakinisRestaurantChannelLabel,
  dakinisRestaurantDayCloseSummary,
  dakinisRestaurantPaymentLabel,
  DAKINIS_RESTAURANT_APP_CHANNEL_IDS,
  DAKINIS_RESTAURANT_LOCAL_CHANNEL_IDS
} from "../utils/restaurantOrderMeta.js";
import { DAKINIS_RESTAURANT_PAYMENT_IDS } from "@dakinis/shared/catalog/restaurant-kitchen.js";

const STATUS_FLOW = ["nueva", "cocina", "lista", "entregada", "cancelada"];

function dakinisEmptyCart() {
  return {};
}

const ROLE_DEFAULT_VIEW = {
  camarero: "mesas",
  cocina: "activas",
  admin: "cierre"
};

export default function RestaurantComandasSection({
  apiSession,
  tenantSlugForVertical,
  activeSystemKey,
  role = "camarero"
}) {
  const { locale, t } = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";
  const effectiveSlug = dakinisEffectiveTenantSlug(apiSession, tenantSlugForVertical);
  const isFermina = effectiveSlug === DAKINIS_FERMINA_HOUSE_SLUG;

  const [menu, setMenu] = useState([]);
  const [brand, setBrand] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [cart, setCart] = useState(dakinisEmptyCart);
  const [table, setTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [channel, setChannel] = useState("salon");
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [notes, setNotes] = useState("");
  const [invoiceType, setInvoiceType] = useState("cliente");
  const [taxId, setTaxId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [printDoc, setPrintDoc] = useState(null);
  const [comandasView, setComandasView] = useState(ROLE_DEFAULT_VIEW[role] || "mesas");
  const [tables, setTables] = useState(dakinisDefaultFloorTables);
  const [tableSessions, setTableSessions] = useState({});
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [mesaClosePayment, setMesaClosePayment] = useState("tarjeta");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    return (byRole[role] || Object.keys(all)).map((id) => all[id]).filter(Boolean);
  }, [role, t]);

  useEffect(() => {
    setComandasView(ROLE_DEFAULT_VIEW[role] || "mesas");
  }, [role]);

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

  const reload = useCallback(async () => {
    if (!apiSession?.token) return;
    setError("");
    try {
      const [menuRes, ordersRes, invRes, floorState] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/restaurant/menu", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/orders", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/invoices", apiSession, fetchOpts),
        dakinisFetchRestaurantFloor(apiSession, fetchOpts)
      ]);
      setMenu(menuRes?.data?.menu ?? []);
      setBrand(menuRes?.data?.brand ?? null);
      setOrders(ordersRes?.data?.orders ?? []);
      setInvoices(invRes?.data?.invoices ?? []);
      setTables(floorState.tables);
      setTableSessions(floorState.sessions);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("fermina.loadError"));
    }
  }, [apiSession, fetchOpts, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  const cartLines = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([menuId, qty]) => {
        const item = menu.find((m) => m.id === menuId);
        return {
          menuId,
          name: item?.nameEs || item?.name || menuId,
          qty,
          unitPrice: item?.priceEur ?? 0
        };
      });
  }, [cart, menu]);

  const cartTotal = useMemo(
    () => cartLines.reduce((a, l) => a + l.qty * l.unitPrice, 0),
    [cartLines]
  );

  const dayClose = useMemo(() => dakinisRestaurantDayCloseSummary(orders, t), [orders, t]);

  const openOrders = useMemo(
    () => orders.filter((o) => o.status !== "entregada" && o.status !== "cancelada"),
    [orders]
  );

  const kitchenOrders = useMemo(
    () =>
      openOrders.filter((o) => o.status === "nueva" || o.status === "cocina" || o.status === "lista"),
    [openOrders]
  );

  const occupiedTablesCount = useMemo(
    () => tables.filter((tbl) => dakinisTableItemCount(tableSessions[tbl.id]?.cart) > 0).length,
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
      if (role === "cocina") setComandasView("activas");
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
      if (role === "cocina") setComandasView("activas");
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

  function dakinisPrint() {
    void dakinisFerminaPrint();
  }

  if (!apiSession?.token) return null;
  if (!isFermina && !menu.length) return null;

  return (
    <section className={`fermina-ops${isFermina ? " fermina-ops--branded" : ""}`} style={{ marginTop: "2rem" }}>
      {isFermina ? (
        <header className="fermina-ops__header">
          <img src="/assets/fermina-logo.png" alt="Fermina Food" className="fermina-ops__logo" width={200} height={80} />
          <div>
            <h3 style={{ margin: 0 }}>Fermina Food</h3>
            <p className="kpi-label" style={{ margin: 0 }}>
              {brand?.tagline || "foods, drinks & coffee"} · {t("fermina.subtitle")}
            </p>
          </div>
        </header>
      ) : (
        <>
          <h3>{t("fermina.title")}</h3>
          <p className="lead">{t("fermina.leadGeneric")}</p>
        </>
      )}

      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      {role === "camarero" ? (
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: isFermina ? "0.5rem" : 0 }}>
          {t("restaurant.waiterLead")}
        </p>
      ) : role === "cocina" ? (
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: isFermina ? "0.5rem" : 0 }}>
          {t("restaurant.kitchenLead")}
        </p>
      ) : (
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: isFermina ? "0.5rem" : 0 }}>
          {t("restaurant.adminComandasLead")}
        </p>
      )}

      <article className="card" style={{ marginTop: "1rem" }}>
        <FerminaComandasSubnav
          views={comandasViews}
          activeId={comandasView}
          onSelect={setComandasView}
          badges={{
            mesas: occupiedTablesCount > 0 ? String(occupiedTablesCount) : null,
            pedido: cartItemCount > 0 ? String(cartItemCount) : null,
            activas:
              (role === "cocina" ? kitchenOrders.length : openOrders.length) > 0
                ? String(role === "cocina" ? kitchenOrders.length : openOrders.length)
                : null
          }}
        />

        {comandasView === "mesas" ? (
          <RestaurantMesasPanel
            t={t}
            menu={menu}
            tables={tables}
            sessions={tableSessions}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
            onTablesChange={setTables}
            onSessionsChange={setTableSessions}
            onSessionPatch={dakinisPatchTableSession}
            layoutEditable={role === "camarero"}
            positionEditable={role === "camarero"}
            onFloorSave={dakinisSaveFloor}
            busy={busy}
            mesaClosePayment={mesaClosePayment}
            onMesaClosePaymentChange={setMesaClosePayment}
            onSendKitchen={(tableId, lines, notes) =>
              dakinisSubmitTableOrder(tableId, lines, notes, "cocina", "tarjeta")
            }
            onCloseTable={(tableId, payMethod, lines, notes) =>
              dakinisSubmitTableOrder(tableId, lines, notes, "entregada", payMethod)
            }
          />
        ) : null}

        {comandasView === "tarifa" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>{t("fermina.tarifaTitle")}</h4>
            <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
              {t("fermina.tarifaLead")}
            </p>
            <p className="kpi-label" style={{ margin: "0 0 0.35rem" }}>
              {t("fermina.tarifaLocalGroup")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {DAKINIS_RESTAURANT_LOCAL_CHANNEL_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={channel === id ? "btn" : "btn btn-outline"}
                  onClick={() => setChannel(id)}
                >
                  {dakinisRestaurantChannelLabel(id, t)}
                </button>
              ))}
            </div>
            <p className="kpi-label" style={{ margin: "0 0 0.35rem" }}>
              {t("fermina.tarifaAppGroup")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {DAKINIS_RESTAURANT_APP_CHANNEL_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={channel === id ? "btn" : "btn btn-outline"}
                  onClick={() => setChannel(id)}
                >
                  {dakinisRestaurantChannelLabel(id, t)}
                </button>
              ))}
            </div>
            <button type="button" className="btn" onClick={() => setComandasView("pedido")}>
              {t("fermina.tarifaContinue")}
            </button>
          </div>
        ) : null}

        {comandasView === "pedido" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>{t("fermina.pedidoTitle")}</h4>
            <p className="kpi-label" style={{ marginTop: 0 }}>
              {t("fermina.pedidoTariff", { channel: dakinisRestaurantChannelLabel(channel, t) })}{" "}
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "0.1rem 0.5rem", fontSize: "0.8rem" }}
                onClick={() => setComandasView("tarifa")}
              >
                {t("fermina.pedidoChangeTariff")}
              </button>
            </p>
            <div className="fermina-ops__fields" style={{ marginTop: "0.75rem" }}>
              <label className="mockup-field">
                <span>{t("fermina.customer")}</span>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ej. María" />
              </label>
              <label className="mockup-field">
                <span>{t("fermina.table")}</span>
                <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="Mesa 3 / Barra" />
              </label>
            </div>
            <label className="mockup-field" style={{ display: "block", marginBottom: "0.75rem" }}>
              <span>{t("fermina.orderNotes")}</span>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <ul className="fermina-menu-list" style={{ marginBottom: "0.75rem" }}>
              {menu.map((item) => (
                <li key={item.id} className="fermina-menu-item">
                  <div>
                    <strong>{item.nameEs || item.name}</strong>
                    <span className="kpi-label">
                      {item.priceEur?.toFixed(2)} €
                      {item.portionQty
                        ? ` · ${t("fermina.portionHint", { qty: item.portionQty, pack: item.packSize })}`
                        : ""}
                    </span>
                  </div>
                  <div className="fermina-menu-item__qty">
                    <button type="button" className="btn btn-outline" onClick={() => dakinisCartQty(item.id, -1)}>
                      −
                    </button>
                    <span>{cart[item.id] || 0}</span>
                    <button type="button" className="btn btn-outline" onClick={() => dakinisCartQty(item.id, 1)}>
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="allergen-panel__summary">
              <strong>{cartTotal.toFixed(2)} €</strong>
              {cartItemCount > 0 ? (
                <span className="kpi-label">{t("fermina.pedidoUnits", { count: cartItemCount })}</span>
              ) : null}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button type="button" className="btn btn-outline" onClick={() => setComandasView("tarifa")}>
                {t("fermina.pedidoBackTarifa")}
              </button>
              <button
                type="button"
                className="btn"
                disabled={!cartLines.length}
                onClick={() => setComandasView("cobro")}
              >
                {t("fermina.pedidoGoCobro")}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!cartItemCount}
                onClick={() => setCart(dakinisEmptyCart())}
              >
                {t("fermina.pedidoClear")}
              </button>
            </div>
          </div>
        ) : null}

        {comandasView === "cobro" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>{t("fermina.cobroTitle")}</h4>
            {cartLines.length === 0 ? (
              <p className="lead">{t("fermina.cobroEmpty")}</p>
            ) : (
              <>
                <article className="card" style={{ marginBottom: "1rem", boxShadow: "none", border: "1px solid var(--line)" }}>
                  <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
                    {customerName || "—"} · {table || "—"} · {dakinisRestaurantChannelLabel(channel, t)}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
                    {cartLines.map((l) => (
                      <li key={l.menuId}>
                        {l.qty}× {l.name} — {(l.qty * l.unitPrice).toFixed(2)} €
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: "0.75rem 0 0" }}>
                    <strong>{t("fermina.cobroTotal", { total: cartTotal.toFixed(2) })}</strong>
                  </p>
                </article>
                <p className="lead" style={{ fontSize: "0.9rem" }}>
                  {t("fermina.cobroQuestion")}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                  {DAKINIS_RESTAURANT_PAYMENT_IDS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={paymentMethod === id ? "btn" : "btn btn-outline"}
                      style={{ minWidth: "7rem" }}
                      onClick={() => setPaymentMethod(id)}
                    >
                      {dakinisRestaurantPaymentLabel(id, t)}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setComandasView("pedido")}>
                    {t("fermina.cobroBackPedido")}
                  </button>
                  <button type="button" className="btn" disabled={busy || !cartLines.length} onClick={dakinisSubmitOrder}>
                    {t("fermina.sendKitchen")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy || !cartLines.length}
                    onClick={() => dakinisCreateInvoice(null)}
                  >
                    {t("fermina.invoiceCart")}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {comandasView === "activas" ? (
          <div>
            <h4 style={{ marginTop: 0 }}>
              {role === "cocina" ? t("restaurant.kitchenQueue") : t("fermina.activeOrders")}
            </h4>
            {(role === "cocina" ? kitchenOrders : openOrders).length === 0 ? (
              <p className="lead">{orders.length === 0 ? t("fermina.noOrders") : t("fermina.noOpenOrders")}</p>
            ) : (
              <ul className="fermina-order-list">
                {(role === "cocina" ? kitchenOrders : openOrders).map((o) => (
                  <li key={o.id} className={`fermina-order-card status-${o.status}`}>
                    <div className="fermina-order-card__head">
                      <strong>
                        #{o.orderNumber} · {o.customerName}
                      </strong>
                      <span className="pill">{o.status}</span>
                    </div>
                    {role === "cocina" ? (
                      <FerminaKitchenOrderTime createdAt={o.createdAt} t={t} locale={locale} />
                    ) : null}
                    <p className="kpi-label">
                      {o.table || "—"} · {dakinisRestaurantChannelLabel(o.channel, t)} ·{" "}
                      {dakinisRestaurantPaymentLabel(o.paymentMethod, t)}
                      {role !== "cocina" ? ` · ${new Date(o.createdAt).toLocaleString(dateLocale)}` : null}
                    </p>
                    <ul>
                      {o.lines?.map((l, i) => (
                        <li key={i}>
                          {l.qty}× {l.name} ({(l.qty * l.unitPrice).toFixed(2)} €)
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>{o.total?.toFixed(2)} €</strong>
                    </p>
                    <div className="fermina-order-card__actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setPrintDoc({ kind: "comanda", data: o })}
                      >
                        {t("fermina.print")}
                      </button>
                      {role !== "cocina" ? (
                        <button type="button" className="btn btn-outline" onClick={() => dakinisCreateInvoice(o)}>
                          {t("fermina.invoice")}
                        </button>
                      ) : null}
                      {(role === "cocina"
                        ? STATUS_FLOW.filter((s) => s !== o.status && s !== "cancelada")
                        : STATUS_FLOW.filter((s) => s !== o.status)
                      ).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="btn btn-outline"
                          disabled={busy}
                          onClick={() => dakinisPatchStatus(o.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {role !== "cocina" ? (
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginTop: "0.75rem" }}
                onClick={() => setComandasView(role === "camarero" ? "mesas" : "pedido")}
              >
                {t("fermina.newOrderBtn")}
              </button>
            ) : null}
          </div>
        ) : null}
      </article>

      {comandasView === "cierre" ? (
      <article className="card" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <h4 style={{ margin: 0 }}>{t("fermina.dayCloseTitle")}</h4>
          <span className="mockup-badge">{t("fermina.dayCloseDelivered", { count: dayClose.closed.length })}</span>
        </div>
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
          {t("fermina.dayCloseLead")}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem"
          }}
        >
          <div>
            <h5 style={{ marginTop: 0 }}>{t("fermina.dayCloseByPayment")}</h5>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>{t("fermina.colPayment")}</th>
                  <th>{t("fermina.dayCloseOrdersCol")}</th>
                  <th>{t("fermina.colTotal")}</th>
                </tr>
              </thead>
              <tbody>
                {dayClose.byPayment.map((row) => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td>{row.count}</td>
                    <td>{row.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={2}>{t("fermina.dayCloseCashTotal")}</th>
                  <th>{dayClose.grandTotal.toFixed(2)} €</th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div>
            <h5 style={{ marginTop: 0 }}>{t("fermina.dayCloseByChannel")}</h5>
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>{t("fermina.colChannel")}</th>
                  <th>{t("fermina.dayCloseOrdersCol")}</th>
                  <th>{t("fermina.colTotal")}</th>
                </tr>
              </thead>
              <tbody>
                {dayClose.byChannel.map((row) => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td>{row.count}</td>
                    <td>{row.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <table className="mockup-table">
          <thead>
            <tr>
              <th>{t("fermina.colNumber")}</th>
              <th>{t("fermina.customer")}</th>
              <th>{t("fermina.colChannel")}</th>
              <th>{t("fermina.colPayment")}</th>
              <th>{t("fermina.colTotal")}</th>
            </tr>
          </thead>
          <tbody>
            {dayClose.closed.length === 0 ? (
              <tr>
                <td colSpan={5} className="lead">
                  {t("fermina.dayCloseEmpty")}
                </td>
              </tr>
            ) : (
              dayClose.closed.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderNumber}</td>
                  <td>{o.customerName}</td>
                  <td>{dakinisRestaurantChannelLabel(o.channel, t)}</td>
                  <td>{dakinisRestaurantPaymentLabel(o.paymentMethod, t)}</td>
                  <td>{o.total?.toFixed(2)} €</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </article>
      ) : null}

      {comandasView === "facturas" ? (
      <article className="card" style={{ marginTop: "1rem" }}>
        <h4>{t("fermina.invoicesTitle")}</h4>
        <div className="fermina-ops__fields" style={{ marginBottom: "0.75rem" }}>
          <label className="mockup-field">
            <span>{t("fermina.invoiceType")}</span>
            <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value)}>
              <option value="cliente">{t("fermina.invoiceClient")}</option>
              <option value="gestor">{t("fermina.invoiceManager")}</option>
            </select>
          </label>
          <label className="mockup-field">
            <span>{t("fermina.taxId")}</span>
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="CUIT / DNI" />
          </label>
        </div>
        {invoices.length === 0 ? (
          <p className="lead">{t("fermina.noInvoices")}</p>
        ) : (
          <table className="mockup-table">
            <thead>
              <tr>
                <th>{t("fermina.colNumber")}</th>
                <th>{t("fermina.colType")}</th>
                <th>{t("fermina.customer")}</th>
                <th>{t("fermina.colTotal")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.type === "gestor" ? t("fermina.invoiceManager") : t("fermina.invoiceClient")}</td>
                  <td>{inv.customerName}</td>
                  <td>{inv.total?.toFixed(2)} €</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setPrintDoc({ kind: "factura", data: inv })}
                    >
                      {t("fermina.print")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
      ) : null}

      {printDoc ? (
        <div className="fermina-print-host">
          <div className="fermina-print-toolbar no-print">
            <button type="button" className="btn" onClick={dakinisPrint}>
              {t("fermina.printNow")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setPrintDoc(null)}>
              {t("fermina.closePrint")}
            </button>
          </div>
          <FerminaPrintSheet
            kind={printDoc.kind}
            doc={printDoc.data}
            businessName={brand?.name || "Fermina Food"}
            dateLocale={dateLocale}
            t={t}
            showLogo={isFermina}
            channelLabel={(ch) => dakinisRestaurantChannelLabel(ch, t)}
            paymentLabel={(pm) => dakinisRestaurantPaymentLabel(pm, t)}
          />
        </div>
      ) : null}
    </section>
  );
}
