import { useEffect, useMemo, useRef, useState } from "react";
import RestaurantFloorPlan from "./RestaurantFloorPlan.jsx";
import {
  dakinisTableCartLines,
  dakinisTableCartTotal,
  dakinisTableIsOccupied,
  dakinisTableItemCount,
  dakinisNewTableAtZone
} from "../utils/restaurantFloorPlan.js";
import { DAKINIS_RESTAURANT_PAYMENT_IDS } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { dakinisRestaurantPaymentLabel } from "../utils/restaurantOrderMeta.js";

const EMPTY_TABLE_CART = Object.freeze({});

function RestaurantMesaModal({
  tableLabel,
  mesaNotes,
  mesaCart,
  mesaLines,
  mesaTotal,
  mesaItemCount,
  sentOrders = [],
  menu,
  busy,
  mesaClosePayment,
  t,
  onClose,
  onNotesChange,
  onCartQtyChange,
  onSendKitchen,
  onPay,
  onClear
}) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const visibleMenu = menu.filter((item) => {
    const name = String(item.nameEs || item.name || "").toLowerCase();
    return !query.trim() || name.includes(query.trim().toLowerCase());
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onCancel(e) {
      e.preventDefault();
      onClose();
    }
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="restaurant-mesa-modal"
      aria-labelledby="restaurant-mesa-modal-title"
    >
      <button
        type="button"
        className="restaurant-mesa-modal__backdrop"
        aria-label={t("restaurant.mesaModalClose")}
        onClick={onClose}
      />
      <div className="restaurant-mesa-modal__panel">
        <button type="button" className="allergen-modal__close" aria-label={t("restaurant.mesaModalClose")} onClick={onClose}>
          ×
        </button>
        <p className="kicker" style={{ margin: "0 2rem 0.25rem 0" }}>
          {t("restaurant.mesaModalKicker")}
        </p>
        <h3 id="restaurant-mesa-modal-title" className="restaurant-mesa-modal__title">
          {tableLabel}
        </h3>

        {sentOrders.length > 0 ? (
          <article className="card restaurant-mesa-modal__sent" style={{ margin: "0 0 0.75rem", padding: "0.75rem" }}>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.95rem" }}>Ya enviado a cocina</h4>
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {sentOrders.map((order) => (
                <li key={order.id || order.orderNumber} style={{ marginBottom: "0.5rem" }}>
                  <strong>
                    Comanda #{order.orderNumber ?? "—"}
                  </strong>
                  <span className="kpi-label"> · {order.status || "abierta"}</span>
                  <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1rem" }}>
                    {(Array.isArray(order.lines) ? order.lines : []).map((line, idx) => (
                      <li key={`${order.id || order.orderNumber}-${line.menuId || idx}`}>
                        {line.qty}× {line.name}{" "}
                        <span className="kpi-label">
                          {(Number(line.qty || 0) * Number(line.unitPrice || 0)).toFixed(2)} €
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p style={{ margin: "0.25rem 0 0" }}>
                    <strong>{Number(order.total || 0).toFixed(2)} €</strong>
                  </p>
                </li>
              ))}
            </ul>
            <p className="kpi-label" style={{ margin: "0.5rem 0 0" }}>
              Abajo puedes añadir más productos (nueva ronda) o cobrar lo ya enviado.
            </p>
          </article>
        ) : null}

        <label className="mockup-field restaurant-mesa-modal__notes">
          <span>{t("fermina.orderNotes")}</span>
          <input
            value={mesaNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t("restaurant.mesaNotesPlaceholder")}
          />
        </label>

        <label className="mockup-field" style={{ flex: "0 0 auto" }}>
          <span>Buscar productos</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre del producto" />
        </label>
        <p className="kpi-label" style={{ flex: "0 0 auto" }}>
          {mesaLines.length
            ? "Pedido preparado para enviar a cocina."
            : sentOrders.length
              ? "Sin productos nuevos. Lo enviado está arriba."
              : "Selecciona productos para preparar la comanda."}
        </p>
        <ul className="fermina-menu-list restaurant-mesa-modal__menu">
          {visibleMenu.map((item) => {
            const qty = mesaCart[item.id] || 0;
            return (
            <li key={item.id} className="fermina-menu-item">
              <div>
                <strong style={{ display: "block" }}>{item.nameEs || item.name}</strong>
                <span className="kpi-label" style={{ display: "block", marginTop: "0.15rem" }}>
                  {item.priceEur?.toFixed(2)} €
                </span>
              </div>
              <div className="fermina-menu-item__qty">
                <button type="button" className="btn btn-outline" disabled={qty <= 0} onClick={() => onCartQtyChange(item.id, -1)}>
                  −
                </button>
                <span>{qty}</span>
                <button type="button" className="btn btn-outline" onClick={() => onCartQtyChange(item.id, 1)}>
                  +
                </button>
              </div>
            </li>
            );
          })}
        </ul>

        <div className="restaurant-mesa-modal__footer">
          <p className="allergen-panel__summary restaurant-mesa-modal__total">
            <strong>
              {(
                mesaTotal + sentOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
              ).toFixed(2)}{" "}
              €
            </strong>
            {mesaItemCount > 0 ? (
              <span className="kpi-label"> · {t("fermina.pedidoUnits", { count: mesaItemCount })} por enviar</span>
            ) : null}
            {sentOrders.length > 0 ? (
              <span className="kpi-label"> · {sentOrders.length} comanda(s) enviada(s)</span>
            ) : null}
          </p>

          <div className="restaurant-mesa-modal__actions">
            <button
              type="button"
              className="btn"
              disabled={busy || !mesaLines.length}
              onClick={onSendKitchen}
            >
              {t("fermina.sendKitchen")}
            </button>
            {confirmClear ? (
              <button
                type="button"
                className="btn btn-outline"
                disabled={busy}
                onClick={() => {
                  onClear();
                  setConfirmClear(false);
                }}
              >
                Confirmar vaciado
              </button>
            ) : (
              <button type="button" className="btn btn-outline" disabled={!mesaItemCount || busy} onClick={() => setConfirmClear(true)}>
                {t("restaurant.mesaClear")}
              </button>
            )}
          </div>
          {confirmClear ? (
            <p className="kpi-label">Vaciar quita los productos de esta mesa. No envía la comanda ni cobra.</p>
          ) : null}

          <div className="restaurant-mesa-modal__pay">
            <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
              {mesaLines.length || sentOrders.length
                ? t("restaurant.mesaPayLabel")
                : "El cobro se habilita cuando hay productos en la comanda."}
            </p>
            <div className="restaurant-mesa-modal__pay-buttons">
              {DAKINIS_RESTAURANT_PAYMENT_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={mesaClosePayment === id ? "btn" : "btn btn-outline"}
                  disabled={busy || (!mesaLines.length && !sentOrders.length)}
                  onClick={() => onPay(id)}
                >
                  {dakinisRestaurantPaymentLabel(id, t)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default function RestaurantMesasPanel({
  t,
  menu,
  tables,
  sessions,
  selectedTableId,
  onSelectTable,
  onTablesChange,
  onSessionsChange,
  onSessionPatch,
  layoutEditable,
  positionEditable,
  onFloorSave,
  busy,
  onSendKitchen,
  onCloseTable,
  onSettleOpenOrders,
  mesaClosePayment,
  onMesaClosePaymentChange,
  openOrders = []
}) {
  const session = selectedTableId ? sessions[selectedTableId] : null;
  const mesaNotes = session?.notes ?? "";

  const mesaLines = useMemo(
    () => dakinisTableCartLines(session?.cart ?? EMPTY_TABLE_CART, menu, "salon"),
    [session, menu]
  );
  const mesaTotal = useMemo(
    () => dakinisTableCartTotal(session?.cart ?? EMPTY_TABLE_CART, menu),
    [session, menu]
  );
  const mesaItemCount = useMemo(
    () => dakinisTableItemCount(session?.cart ?? EMPTY_TABLE_CART),
    [session]
  );
  const mesaCart = session?.cart ?? EMPTY_TABLE_CART;

  const selectedTableLabel = useMemo(() => {
    if (!selectedTableId) return "";
    return tables.find((tbl) => tbl.id === selectedTableId)?.label || selectedTableId;
  }, [selectedTableId, tables]);

  const occupiedCount = useMemo(
    () => tables.filter((tbl) => dakinisTableIsOccupied(sessions[tbl.id], tbl, openOrders)).length,
    [tables, sessions, openOrders]
  );

  const sentOrdersForTable = useMemo(() => {
    const label = String(selectedTableLabel || "").trim();
    if (!label) return [];
    return (Array.isArray(openOrders) ? openOrders : []).filter(
      (order) => String(order?.table || "").trim() === label
    );
  }, [openOrders, selectedTableLabel]);

  function setTableCartQty(tableId, menuId, delta) {
    if (!tableId) return;
    const cur = sessions[tableId] || { cart: {}, notes: "" };
    const cartNext = { ...cur.cart };
    const v = Math.max(0, (cartNext[menuId] || 0) + delta);
    if (v === 0) delete cartNext[menuId];
    else cartNext[menuId] = v;
    const next = { ...cur, cart: cartNext };
    onSessionsChange({ ...sessions, [tableId]: next });
    onSessionPatch?.(tableId, next);
  }

  function setTableNotes(tableId, value) {
    if (!tableId) return;
    const cur = sessions[tableId] || { cart: {}, notes: "" };
    const next = { ...cur, notes: value };
    onSessionsChange({ ...sessions, [tableId]: next });
    onSessionPatch?.(tableId, next);
  }

  function handleAddTable(zone) {
    const created = dakinisNewTableAtZone(tables, zone);
    const next = [...tables, created];
    onTablesChange?.(next);
    onFloorSave?.(next);
    // Do not open the mesa modal / load menu products on create — table stays libre and empty.
  }

  function tableTotalFn(tableId) {
    return dakinisTableCartTotal(sessions[tableId]?.cart, menu);
  }

  function closeModal() {
    onSelectTable(null);
  }

  function handlePay(paymentId) {
    if (!selectedTableId) return;
    onMesaClosePaymentChange(paymentId);
    if (mesaLines.length) {
      onCloseTable(selectedTableId, paymentId, mesaLines, mesaNotes);
    } else if (sentOrdersForTable.length) {
      onSettleOpenOrders?.(selectedTableId, paymentId, sentOrdersForTable);
    } else {
      return;
    }
    onSelectTable(null);
  }

  return (
    <div className="restaurant-mesas">
      <div className="restaurant-mesas__head">
        <h4 style={{ margin: 0 }}>{t("restaurant.mesasTitle")}</h4>
        {occupiedCount > 0 ? (
          <span className="mockup-badge">
            {t("restaurant.mesasOccupied", { count: occupiedCount })}
          </span>
        ) : null}
      </div>
      <p className="lead" style={{ fontSize: "0.9rem", marginTop: "0.35rem" }}>
        {t("restaurant.mesasLead")}
      </p>

      <RestaurantFloorPlan
        tables={tables}
        sessions={sessions}
        selectedTableId={selectedTableId}
        onSelectTable={onSelectTable}
        onTablesChange={onTablesChange}
        onDragEnd={onFloorSave}
        layoutEditable={layoutEditable}
        positionEditable={positionEditable}
        onAddTable={handleAddTable}
        tableTotal={tableTotalFn}
        openOrders={openOrders}
        t={t}
      />

      {!selectedTableId ? (
        <p className="kpi-label" style={{ marginTop: "1rem" }}>
          {t("restaurant.mesaSelectHint")}
        </p>
      ) : null}

      {selectedTableId ? (
        <RestaurantMesaModal
          tableLabel={selectedTableLabel}
          mesaNotes={mesaNotes}
          mesaCart={mesaCart}
          mesaLines={mesaLines}
          mesaTotal={mesaTotal}
          mesaItemCount={mesaItemCount}
          sentOrders={sentOrdersForTable}
          menu={menu}
          busy={busy}
          mesaClosePayment={mesaClosePayment}
          t={t}
          onClose={closeModal}
          onNotesChange={(value) => setTableNotes(selectedTableId, value)}
          onCartQtyChange={(menuId, delta) => setTableCartQty(selectedTableId, menuId, delta)}
          onSendKitchen={() => onSendKitchen(selectedTableId, mesaLines, mesaNotes)}
          onPay={handlePay}
          onClear={() => {
            onSessionsChange({ ...sessions, [selectedTableId]: { cart: {}, notes: "" } });
            onSessionPatch?.(selectedTableId, { cart: {}, notes: "" }, { clear: true });
          }}
        />
      ) : null}
    </div>
  );
}
