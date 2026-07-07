import FerminaKitchenOrderTime from "./FerminaKitchenOrderTime.jsx";
import RestaurantMesasPanel from "./RestaurantMesasPanel.jsx";
import {
  dakinisRestaurantChannelLabel,
  dakinisRestaurantPaymentLabel,
  DAKINIS_RESTAURANT_APP_CHANNEL_IDS,
  DAKINIS_RESTAURANT_LOCAL_CHANNEL_IDS
} from "../utils/restaurantOrderMeta.js";
import { DAKINIS_RESTAURANT_PAYMENT_IDS } from "@dakinis/shared/catalog/restaurant-kitchen.js";

const STATUS_FLOW = ["nueva", "cocina", "lista", "entregada", "cancelada"];

export function RestaurantComandasMesasView(props) {
  const {
    t,
    menu,
    tables,
    tableSessions,
    selectedTableId,
    setSelectedTableId,
    setTables,
    setTableSessions,
    dakinisPatchTableSession,
    staffRole,
    dakinisSaveFloor,
    busy,
    mesaClosePayment,
    setMesaClosePayment,
    dakinisSubmitTableOrder
  } = props;

  return (
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
      layoutEditable={staffRole === "camarero"}
      positionEditable={staffRole === "camarero"}
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
  );
}

export function RestaurantComandasTarifaView({ t, channel, setChannel, setComandasView }) {
  return (
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
  );
}

export function RestaurantComandasPedidoView({
  t,
  channel,
  setComandasView,
  customerName,
  setCustomerName,
  table,
  setTable,
  notes,
  setNotes,
  menu,
  cart,
  cartLines,
  dakinisCartQty,
  cartTotal,
  cartItemCount,
  dakinisEmptyCart,
  setCart
}) {
  return (
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
  );
}

export function RestaurantComandasCobroView({
  t,
  cartLines,
  cartTotal,
  customerName,
  table,
  channel,
  paymentMethod,
  setPaymentMethod,
  setComandasView,
  busy,
  dakinisSubmitOrder,
  dakinisCreateInvoice
}) {
  return (
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
  );
}

export function RestaurantComandasActivasView({
  t,
  staffRole,
  kitchenOrders,
  openOrders,
  orders,
  locale,
  dateLocale,
  setPrintDoc,
  dakinisCreateInvoice,
  busy,
  dakinisPatchStatus,
  setComandasView
}) {
  const activeOrders = staffRole === "cocina" ? kitchenOrders : openOrders;

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>
        {staffRole === "cocina" ? t("restaurant.kitchenQueue") : t("fermina.activeOrders")}
      </h4>
      {activeOrders.length === 0 ? (
        <p className="lead">{orders.length === 0 ? t("fermina.noOrders") : t("fermina.noOpenOrders")}</p>
      ) : (
        <ul className="fermina-order-list">
          {activeOrders.map((o) => (
            <li key={o.id} className={`fermina-order-card status-${o.status}`}>
              <div className="fermina-order-card__head">
                <strong>
                  #{o.orderNumber} · {o.customerName}
                </strong>
                <span className="pill">{o.status}</span>
              </div>
              {staffRole === "cocina" ? (
                <FerminaKitchenOrderTime createdAt={o.createdAt} t={t} locale={locale} />
              ) : null}
              <p className="kpi-label">
                {o.table || "—"} · {dakinisRestaurantChannelLabel(o.channel, t)} ·{" "}
                {dakinisRestaurantPaymentLabel(o.paymentMethod, t)}
                {staffRole !== "cocina" ? ` · ${new Date(o.createdAt).toLocaleString(dateLocale)}` : null}
              </p>
              <ul>
                {o.lines?.map((l) => (
                  <li key={l.menuId || `${l.name}-${l.qty}-${l.unitPrice}`}>
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
                {staffRole !== "cocina" ? (
                  <button type="button" className="btn btn-outline" onClick={() => dakinisCreateInvoice(o)}>
                    {t("fermina.invoice")}
                  </button>
                ) : null}
                {(staffRole === "cocina"
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
      {staffRole !== "cocina" ? (
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginTop: "0.75rem" }}
          onClick={() => setComandasView(staffRole === "camarero" ? "mesas" : "pedido")}
        >
          {t("fermina.newOrderBtn")}
        </button>
      ) : null}
    </div>
  );
}

export function RestaurantComandasCierrePanel({ t, dayClose }) {
  return (
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
  );
}

export function RestaurantComandasFacturasPanel({
  t,
  invoiceType,
  setInvoiceType,
  taxId,
  setTaxId,
  invoices,
  setPrintDoc
}) {
  return (
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
              <th scope="col">{t("fermina.print")}</th>
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
  );
}
