import { FerminaComandasSubnav } from "../components/FerminaComandasSubnav.jsx";
import FerminaPrintSheet from "../components/FerminaPrintSheet.jsx";
import FerminaKitchenOrderTime from "../components/FerminaKitchenOrderTime.jsx";
import RestaurantMesasPanel from "../components/RestaurantMesasPanel.jsx";
import { dakinisFerminaPrint } from "../utils/ferminaPrint.js";
import {
  DEMO_RESTAURANT_VENUE,
  FERMINA_APP_CHANNELS,
  FERMINA_LOCAL_CHANNELS,
  FERMINA_MOCK_MENU,
  FERMINA_PAYMENTS,
  FERMINA_STATUS_FLOW,
  ferminaChannelLabel,
  ferminaPaymentLabel,
  ferminaPriceForChannel,
  ferminaPriceTierLabel,
  MOCK_FERMINA_INVOICE_CLIENT,
  MOCK_FERMINA_INVOICE_GESTOR,
  MOCK_FERMINA_ORDER
} from "./restaurantePanelComandasMockData.js";

function RestauranteMockTarifaView({ channel, setChannel, setComandasView }) {
  return (
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
  );
}

function RestauranteMockPedidoView({
  channel,
  setComandasView,
  customerName,
  setCustomerName,
  table,
  setTable,
  notes,
  setNotes,
  cart,
  setCartQty,
  cartTotal,
  cartItemCount,
  cartLines,
  setCart
}) {
  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Armar pedido</h4>
      <p className="kpi-label" style={{ marginTop: 0 }}>
        Tarifa: <strong>{ferminaChannelLabel(channel)}</strong> ·{" "}
        <button
          type="button"
          className="btn btn-outline"
          style={{ padding: "0.1rem 0.5rem", fontSize: "0.8rem" }}
          onClick={() => setComandasView("tarifa")}
        >
          Cambiar
        </button>
      </p>
      <div className="fermina-ops__fields" style={{ marginTop: "0.75rem" }}>
        <label className="mockup-field">
          <span>Cliente</span>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre o pedido app" />
        </label>
        <label className="mockup-field">
          <span>Mesa / zona</span>
          <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="Mesa 3 / Mostrador" />
        </label>
      </div>
      <label className="mockup-field" style={{ display: "block", marginBottom: "0.75rem" }}>
        <span>Notas cocina</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. sin picante" />
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
        {cartItemCount > 0 ? <span className="kpi-label"> · {cartItemCount} unidades</span> : null}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        <button type="button" className="btn btn-outline" onClick={() => setComandasView("tarifa")}>
          ← Tarifa
        </button>
        <button type="button" className="btn" disabled={!cartLines.length} onClick={() => setComandasView("cobro")}>
          Ir a cobro →
        </button>
        <button type="button" className="btn btn-outline" disabled={!cartItemCount} onClick={() => setCart({})}>
          Vaciar
        </button>
      </div>
    </div>
  );
}

function RestauranteMockCobroView({
  cartLines,
  cartTotal,
  customerName,
  table,
  channel,
  paymentMethod,
  setPaymentMethod,
  setComandasView,
  submitDemoOrder
}) {
  return (
    <div>
      <h4 style={{ marginTop: 0 }}>Cobro</h4>
      {cartLines.length === 0 ? (
        <p className="lead">
          Primero arma el pedido en la pestaña <strong>Pedido</strong>.
        </p>
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
  );
}

function RestauranteMockActivasView({
  panelRole,
  kitchenOrders,
  openOrders,
  locale,
  t,
  setPrintDoc,
  patchOrderStatus,
  setComandasView
}) {
  const activeOrders = panelRole === "cocina" ? kitchenOrders : openOrders;

  return (
    <div>
      <h4 style={{ marginTop: 0 }}>{panelRole === "cocina" ? "Cola de cocina" : "Comandas activas"}</h4>
      {activeOrders.length === 0 ? (
        <p className="lead">No hay comandas abiertas.</p>
      ) : (
        <ul className="fermina-order-list">
          {activeOrders.map((o) => (
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
                <button type="button" className="btn btn-outline" onClick={() => setPrintDoc({ kind: "comanda", doc: o })}>
                  Imprimir
                </button>
                {FERMINA_STATUS_FLOW.flatMap((s) =>
                  s === o.status
                    ? []
                    : [
                        <button
                          key={s}
                          type="button"
                          className="btn btn-outline"
                          onClick={() => patchOrderStatus(o.id, s)}
                        >
                          {s}
                        </button>
                      ]
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="btn btn-outline" style={{ marginTop: "0.75rem" }} onClick={() => setComandasView("pedido")}>
        + Nuevo pedido
      </button>
    </div>
  );
}

function RestauranteMockComandasMainCard(props) {
  const {
    t,
    panelRole,
    mesasOnly,
    comandasView,
    setComandasView,
    comandasViews,
    occupiedTablesCount,
    cartItemCount,
    kitchenOrders,
    openOrders,
    mockMenu,
    floorTables,
    setFloorTables,
    tableSessions,
    setTableSessions,
    selectedTableId,
    setSelectedTableId,
    mesaClosePayment,
    setMesaClosePayment,
    sendTableToKitchen,
    closeTable
  } = props;

  return (
    <article className="card" style={{ marginBottom: "1rem" }}>
      <div style={{ marginBottom: "0.75rem" }}>
        <div>
          <h3 style={{ margin: "0 0 0.25rem" }}>{t("mockupPanels.restaurante.brand")}</h3>
          <p className="kicker" style={{ margin: 0 }}>
            {t("mockupPanels.restaurante.comandasKicker")}
          </p>
          <p className="lead" style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
            <strong>Mesas:</strong> 5 salón + 5 terraza, cuenta por mesa y cierre (efectivo/tarjeta). Para llevar y apps:{" "}
            <strong>tarifa</strong> → <strong>pedido</strong> → <strong>cobro</strong>.
          </p>
        </div>
        <span className="mockup-badge">Demo interactivo</span>
      </div>

      {mesasOnly ? (
        <p className="lead" style={{ fontSize: "0.9rem", margin: "0 0 0.75rem" }}>
          Toca una mesa en el plano, añade platos y envía a cocina. El stock y el dashboard se actualizan al cerrar la cuenta.
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

      {comandasView === "tarifa" ? <RestauranteMockTarifaView {...props} /> : null}
      {comandasView === "pedido" ? <RestauranteMockPedidoView {...props} /> : null}
      {comandasView === "cobro" ? <RestauranteMockCobroView {...props} /> : null}
      {comandasView === "activas" ? <RestauranteMockActivasView {...props} /> : null}
    </article>
  );
}

function RestauranteMockComandasCierreCard({
  closedOrders,
  dayByPayment,
  dayByChannel,
  dayGrandTotal,
  resetDemoDay
}) {
  return (
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
  );
}

function RestauranteMockComandasPrintHost({ printDoc, setPrintDoc }) {
  if (printDoc?.kind !== "comanda") return null;

  return (
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
  );
}

function RestauranteMockComandasFacturasSection() {
  return (
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
              <th scope="col" aria-label="Acciones" />
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
  );
}

export function RestaurantePanelComandasMockLayout(props) {
  const { comandasView } = props;

  return (
    <>
      <RestauranteMockComandasMainCard {...props} />
      {comandasView === "cierre" ? <RestauranteMockComandasCierreCard {...props} /> : null}
      <RestauranteMockComandasPrintHost printDoc={props.printDoc} setPrintDoc={props.setPrintDoc} />
      {comandasView === "facturas" ? <RestauranteMockComandasFacturasSection /> : null}
    </>
  );
}
