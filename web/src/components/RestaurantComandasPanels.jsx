import { FerminaComandasSubnav } from "./FerminaComandasSubnav.jsx";
import FerminaPrintSheet from "./FerminaPrintSheet.jsx";
import RestaurantCajaTpvSummary from "./RestaurantCajaTpvSummary.jsx";
import { dakinisTriggerFerminaPrint } from "./RestaurantComandasSection.shared.js";
import {
  dakinisRestaurantChannelLabel,
  dakinisRestaurantPaymentLabel
} from "../utils/restaurantOrderMeta.js";
import {
  RestaurantComandasActivasView,
  RestaurantComandasCierrePanel,
  RestaurantComandasCobroView,
  RestaurantComandasFacturasPanel,
  RestaurantComandasMesasView,
  RestaurantComandasPedidoView,
  RestaurantComandasTarifaView
} from "./RestaurantComandasViewBody.jsx";

export default function RestaurantComandasPanels({ ctx }) {
  const {
    venueName,
    t,
    error,
    staffRole,
    opsMode,
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
  } = ctx;

  return (
    <section className={`fermina-ops${opsMode ? " fermina-ops--compact" : ""}`} style={{ marginTop: opsMode ? "0.5rem" : "2rem" }}>
      {!opsMode ? (
        <>
          <h3>{venueName}</h3>
          <p className="lead">{t("fermina.leadGeneric")}</p>
        </>
      ) : null}

      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      {!opsMode && staffRole === "camarero" ? (
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
          {t("restaurant.waiterLead")}
        </p>
      ) : null}
      {!opsMode && staffRole === "cocina" ? (
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
          {t("restaurant.kitchenLead")}
        </p>
      ) : null}
      {!opsMode && staffRole === "admin" ? (
        <p className="lead" style={{ fontSize: "0.9rem", marginTop: 0 }}>
          {t("restaurant.adminComandasLead")}
        </p>
      ) : null}

      {opsMode && staffRole === "admin" ? (
        <RestaurantCajaTpvSummary dayClose={dayClose} onJumpCierre={() => setComandasView("cierre")} />
      ) : null}

      <article className="card" style={{ marginTop: opsMode ? 0 : "1rem" }}>
        {comandasViews.length > 1 ? (
          <FerminaComandasSubnav
            views={comandasViews}
            activeId={comandasView}
            onSelect={setComandasView}
            badges={{
              mesas: occupiedTablesCount > 0 ? String(occupiedTablesCount) : null,
              pedido: cartItemCount > 0 ? String(cartItemCount) : null,
              activas:
                (staffRole === "cocina" ? kitchenOrders.length : openOrders.length) > 0
                  ? String(staffRole === "cocina" ? kitchenOrders.length : openOrders.length)
                  : null
            }}
          />
        ) : null}

        {comandasView === "mesas" ? (
          <RestaurantComandasMesasView
            t={t}
            menu={menu}
            tables={tables}
            tableSessions={tableSessions}
            selectedTableId={selectedTableId}
            setSelectedTableId={setSelectedTableId}
            setTables={setTables}
            setTableSessions={setTableSessions}
            dakinisPatchTableSession={dakinisPatchTableSession}
            staffRole={staffRole}
            dakinisSaveFloor={dakinisSaveFloor}
            busy={busy}
            mesaClosePayment={mesaClosePayment}
            setMesaClosePayment={setMesaClosePayment}
            dakinisSubmitTableOrder={dakinisSubmitTableOrder}
          />
        ) : null}

        {comandasView === "tarifa" ? (
          <RestaurantComandasTarifaView t={t} channel={channel} setChannel={setChannel} setComandasView={setComandasView} />
        ) : null}

        {comandasView === "pedido" ? (
          <RestaurantComandasPedidoView
            t={t}
            channel={channel}
            setComandasView={setComandasView}
            customerName={customerName}
            setCustomerName={setCustomerName}
            table={table}
            setTable={setTable}
            notes={notes}
            setNotes={setNotes}
            menu={menu}
            cart={cart}
            cartLines={cartLines}
            dakinisCartQty={dakinisCartQty}
            cartTotal={cartTotal}
            cartItemCount={cartItemCount}
            dakinisEmptyCart={dakinisEmptyCart}
            setCart={setCart}
          />
        ) : null}

        {comandasView === "cobro" ? (
          <RestaurantComandasCobroView
            t={t}
            cartLines={cartLines}
            cartTotal={cartTotal}
            customerName={customerName}
            table={table}
            channel={channel}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setComandasView={setComandasView}
            busy={busy}
            dakinisSubmitOrder={dakinisSubmitOrder}
            dakinisCreateInvoice={dakinisCreateInvoice}
          />
        ) : null}

        {comandasView === "activas" ? (
          <RestaurantComandasActivasView
            t={t}
            staffRole={staffRole}
            kitchenOrders={kitchenOrders}
            openOrders={openOrders}
            orders={orders}
            locale={locale}
            dateLocale={dateLocale}
            setPrintDoc={setPrintDoc}
            dakinisCreateInvoice={dakinisCreateInvoice}
            busy={busy}
            dakinisPatchStatus={dakinisPatchStatus}
            setComandasView={setComandasView}
          />
        ) : null}
      </article>

      {comandasView === "cierre" ? <RestaurantComandasCierrePanel t={t} dayClose={dayClose} /> : null}

      {comandasView === "facturas" ? (
        <RestaurantComandasFacturasPanel
          t={t}
          invoiceType={invoiceType}
          setInvoiceType={setInvoiceType}
          taxId={taxId}
          setTaxId={setTaxId}
          invoices={invoices}
          setPrintDoc={setPrintDoc}
        />
      ) : null}

      {printDoc ? (
        <div className="fermina-print-host">
          <div className="fermina-print-toolbar no-print">
            <button type="button" className="btn" onClick={dakinisTriggerFerminaPrint}>
              {t("fermina.printNow")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setPrintDoc(null)}>
              {t("fermina.closePrint")}
            </button>
          </div>
          <FerminaPrintSheet
            kind={printDoc.kind}
            doc={printDoc.data}
            businessName={venueName}
            dateLocale={dateLocale}
            t={t}
            showLogo={false}
            channelLabel={(ch) => dakinisRestaurantChannelLabel(ch, t)}
            paymentLabel={(pm) => dakinisRestaurantPaymentLabel(pm, t)}
          />
        </div>
      ) : null}
    </section>
  );
}
