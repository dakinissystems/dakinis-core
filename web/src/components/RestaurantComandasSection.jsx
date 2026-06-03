import { useCallback, useEffect, useMemo, useState } from "react";
import { DAKINIS_FERMINA_HOUSE_SLUG } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { dakinisTenantJsonFetch } from "../services/api.js";
import { dakinisEffectiveTenantSlug } from "../utils/tenantSlug.js";
import {
  dakinisRestaurantChannelLabel,
  dakinisRestaurantDayCloseSummary,
  dakinisRestaurantPaymentLabel
} from "../utils/restaurantOrderMeta.js";
import { DAKINIS_RESTAURANT_CHANNEL_IDS, DAKINIS_RESTAURANT_PAYMENT_IDS } from "@dakinis/shared/catalog/restaurant-kitchen.js";

const STATUS_FLOW = ["nueva", "cocina", "lista", "entregada", "cancelada"];

function dakinisEmptyCart() {
  return {};
}

export default function RestaurantComandasSection({ apiSession, tenantSlugForVertical, activeSystemKey }) {
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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      const [menuRes, ordersRes, invRes] = await Promise.all([
        dakinisTenantJsonFetch("/api/tenant/restaurant/menu", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/orders", apiSession, fetchOpts),
        dakinisTenantJsonFetch("/api/tenant/restaurant/invoices", apiSession, fetchOpts)
      ]);
      setMenu(menuRes?.data?.menu ?? []);
      setBrand(menuRes?.data?.brand ?? null);
      setOrders(ordersRes?.data?.orders ?? []);
      setInvoices(invRes?.data?.invoices ?? []);
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
    window.print();
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

      <div className="module-grid fermina-ops__grid">
        <article className="card">
          <h4>{t("fermina.newOrder")}</h4>
          <div className="fermina-ops__fields">
            <label className="mockup-field">
              <span>{t("fermina.customer")}</span>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Ej. María" />
            </label>
            <label className="mockup-field">
              <span>{t("fermina.table")}</span>
              <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="Mesa 3 / Barra" />
            </label>
            <label className="mockup-field">
              <span>{t("fermina.channel")}</span>
              <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                {DAKINIS_RESTAURANT_CHANNEL_IDS.map((id) => (
                  <option key={id} value={id}>
                    {dakinisRestaurantChannelLabel(id, t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="mockup-field">
              <span>{t("fermina.paymentMethod")}</span>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {DAKINIS_RESTAURANT_PAYMENT_IDS.map((id) => (
                  <option key={id} value={id}>
                    {dakinisRestaurantPaymentLabel(id, t)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ul className="fermina-menu-list">
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

          <label className="mockup-field">
            <span>{t("fermina.orderNotes")}</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>

          <p className="allergen-panel__summary">
            <strong>{cartTotal.toFixed(2)} €</strong>
            <span className="kpi-label">
              {" "}
              · {dakinisRestaurantChannelLabel(channel, t)} · {dakinisRestaurantPaymentLabel(paymentMethod, t)}
            </span>
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
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
        </article>

        <article className="card">
          <h4>{t("fermina.activeOrders")}</h4>
          {openOrders.length === 0 ? (
            <p className="lead">{orders.length === 0 ? t("fermina.noOrders") : t("fermina.noOpenOrders")}</p>
          ) : (
            <ul className="fermina-order-list">
              {openOrders.map((o) => (
                <li key={o.id} className={`fermina-order-card status-${o.status}`}>
                  <div className="fermina-order-card__head">
                    <strong>
                      #{o.orderNumber} · {o.customerName}
                    </strong>
                    <span className="pill">{o.status}</span>
                  </div>
                  <p className="kpi-label">
                    {o.table || "—"} · {dakinisRestaurantChannelLabel(o.channel, t)} ·{" "}
                    {dakinisRestaurantPaymentLabel(o.paymentMethod, t)} ·{" "}
                    {new Date(o.createdAt).toLocaleString(dateLocale)}
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
                    <button type="button" className="btn btn-outline" onClick={() => setPrintDoc({ kind: "comanda", data: o })}>
                      {t("fermina.print")}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => dakinisCreateInvoice(o)}>
                      {t("fermina.invoice")}
                    </button>
                    {STATUS_FLOW.filter((s) => s !== o.status).map((s) => (
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
        </article>
      </div>

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
          <article className="fermina-print-sheet print-only">
            {isFermina ? (
              <img src="/assets/fermina-logo.png" alt="" className="fermina-print-sheet__logo" width={160} />
            ) : null}
            <h2>
              {printDoc.kind === "comanda"
                ? t("fermina.printComanda", { n: printDoc.data.orderNumber })
                : t("fermina.printFactura", { n: printDoc.data.invoiceNumber })}
            </h2>
            <p className="kpi-label">
              {printDoc.data.venueName || "Fermina Food"} · {new Date().toLocaleString(dateLocale)}
            </p>
            {printDoc.kind === "factura" ? (
              <p>
                <strong>
                  {printDoc.data.type === "gestor" ? t("fermina.invoiceManager") : t("fermina.invoiceClient")}
                </strong>
                {printDoc.data.taxId ? ` · ${printDoc.data.taxId}` : ""}
              </p>
            ) : null}
            <p>
              <strong>{printDoc.data.customerName}</strong>
              {printDoc.data.table ? ` · ${printDoc.data.table}` : ""}
            </p>
            {printDoc.kind === "comanda" && (printDoc.data.channel || printDoc.data.paymentMethod) ? (
              <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
                {printDoc.data.channel ? dakinisRestaurantChannelLabel(printDoc.data.channel, t) : null}
                {printDoc.data.channel && printDoc.data.paymentMethod ? " · " : null}
                {printDoc.data.paymentMethod
                  ? dakinisRestaurantPaymentLabel(printDoc.data.paymentMethod, t)
                  : null}
              </p>
            ) : null}
            <table className="mockup-table">
              <thead>
                <tr>
                  <th>{t("fermina.colItem")}</th>
                  <th>{t("fermina.colQty")}</th>
                  <th>{t("fermina.colPrice")}</th>
                </tr>
              </thead>
              <tbody>
                {(printDoc.data.lines || []).map((l, i) => (
                  <tr key={i}>
                    <td>{l.name}</td>
                    <td>{l.qty}</td>
                    <td>{(l.qty * l.unitPrice).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="fermina-print-sheet__total">
              <strong>{(printDoc.data.total ?? 0).toFixed(2)} €</strong>
            </p>
            {printDoc.kind === "comanda" && printDoc.data.notes ? (
              <p>{printDoc.data.notes}</p>
            ) : null}
          </article>
        </div>
      ) : null}
    </section>
  );
}
