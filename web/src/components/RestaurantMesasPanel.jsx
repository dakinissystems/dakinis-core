import { useEffect, useMemo } from "react";
import RestaurantFloorPlan from "./RestaurantFloorPlan.jsx";
import {
  dakinisTableCartLines,
  dakinisTableCartTotal,
  dakinisTableItemCount,
  dakinisNewTableAtZone
} from "../utils/restaurantFloorPlan.js";
import { DAKINIS_RESTAURANT_PAYMENT_IDS } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { dakinisRestaurantPaymentLabel } from "../utils/restaurantOrderMeta.js";

function RestaurantMesaModal({
  tableLabel,
  mesaNotes,
  mesaCart,
  mesaLines,
  mesaTotal,
  mesaItemCount,
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
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="restaurant-mesa-modal" role="dialog" aria-modal="true" aria-labelledby="restaurant-mesa-modal-title">
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

        <label className="mockup-field restaurant-mesa-modal__notes">
          <span>{t("fermina.orderNotes")}</span>
          <input
            value={mesaNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={t("restaurant.mesaNotesPlaceholder")}
          />
        </label>

        <ul className="fermina-menu-list restaurant-mesa-modal__menu">
          {menu.map((item) => (
            <li key={item.id} className="fermina-menu-item">
              <div>
                <strong>{item.nameEs || item.name}</strong>
                <span className="kpi-label">{item.priceEur?.toFixed(2)} €</span>
              </div>
              <div className="fermina-menu-item__qty">
                <button type="button" className="btn btn-outline" onClick={() => onCartQtyChange(item.id, -1)}>
                  −
                </button>
                <span>{mesaCart[item.id] || 0}</span>
                <button type="button" className="btn btn-outline" onClick={() => onCartQtyChange(item.id, 1)}>
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>

        <p className="allergen-panel__summary restaurant-mesa-modal__total">
          <strong>{mesaTotal.toFixed(2)} €</strong>
          {mesaItemCount > 0 ? (
            <span className="kpi-label"> · {t("fermina.pedidoUnits", { count: mesaItemCount })}</span>
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
          <button type="button" className="btn btn-outline" disabled={!mesaItemCount || busy} onClick={onClear}>
            {t("restaurant.mesaClear")}
          </button>
        </div>

        <div className="restaurant-mesa-modal__pay">
          <p className="kpi-label" style={{ margin: "0 0 0.5rem" }}>
            {t("restaurant.mesaPayLabel")}
          </p>
          <div className="restaurant-mesa-modal__pay-buttons">
            {DAKINIS_RESTAURANT_PAYMENT_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={mesaClosePayment === id ? "btn" : "btn btn-outline"}
                disabled={busy || !mesaLines.length}
                onClick={() => onPay(id)}
              >
                {dakinisRestaurantPaymentLabel(id, t)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
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
  mesaClosePayment,
  onMesaClosePaymentChange
}) {
  const session = selectedTableId ? sessions[selectedTableId] : null;
  const mesaCart = session?.cart ?? {};
  const mesaNotes = session?.notes ?? "";

  const mesaLines = useMemo(() => dakinisTableCartLines(mesaCart, menu, "salon"), [mesaCart, menu]);
  const mesaTotal = useMemo(() => dakinisTableCartTotal(mesaCart, menu), [mesaCart, menu]);
  const mesaItemCount = useMemo(() => dakinisTableItemCount(mesaCart), [mesaCart]);

  const selectedTableLabel = useMemo(() => {
    if (!selectedTableId) return "";
    return tables.find((tbl) => tbl.id === selectedTableId)?.label || selectedTableId;
  }, [selectedTableId, tables]);

  const occupiedCount = useMemo(
    () => tables.filter((tbl) => dakinisTableItemCount(sessions[tbl.id]?.cart) > 0).length,
    [tables, sessions]
  );

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
    const next = [...tables, dakinisNewTableAtZone(tables, zone)];
    onTablesChange?.(next);
    onFloorSave?.(next);
    onSelectTable(next[next.length - 1].id);
  }

  function tableTotalFn(tableId) {
    return dakinisTableCartTotal(sessions[tableId]?.cart, menu);
  }

  function closeModal() {
    onSelectTable(null);
  }

  function handlePay(paymentId) {
    if (!selectedTableId || !mesaLines.length) return;
    onMesaClosePaymentChange(paymentId);
    onCloseTable(selectedTableId, paymentId, mesaLines, mesaNotes);
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
