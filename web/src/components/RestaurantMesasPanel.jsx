import { useMemo } from "react";
import RestaurantFloorPlan from "./RestaurantFloorPlan.jsx";
import {
  dakinisTableCartLines,
  dakinisTableCartTotal,
  dakinisTableItemCount,
  dakinisNewTableAtZone
} from "../utils/restaurantFloorPlan.js";
import { DAKINIS_RESTAURANT_PAYMENT_IDS } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { dakinisRestaurantPaymentLabel } from "../utils/restaurantOrderMeta.js";

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

      {selectedTableId ? (
        <article className="card restaurant-mesas__detail" style={{ marginTop: "1rem", boxShadow: "none", border: "1px solid var(--line)" }}>
          <h5 style={{ marginTop: 0 }}>
            {tables.find((tbl) => tbl.id === selectedTableId)?.label || selectedTableId}
          </h5>
          <label className="mockup-field" style={{ display: "block", marginBottom: "0.75rem" }}>
            <span>{t("fermina.orderNotes")}</span>
            <input
              value={mesaNotes}
              onChange={(e) => setTableNotes(selectedTableId, e.target.value)}
              placeholder={t("restaurant.mesaNotesPlaceholder")}
            />
          </label>
          <ul className="fermina-menu-list" style={{ marginBottom: "0.75rem" }}>
            {menu.map((item) => (
              <li key={item.id} className="fermina-menu-item">
                <div>
                  <strong>{item.nameEs || item.name}</strong>
                  <span className="kpi-label">{item.priceEur?.toFixed(2)} €</span>
                </div>
                <div className="fermina-menu-item__qty">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setTableCartQty(selectedTableId, item.id, -1)}
                  >
                    −
                  </button>
                  <span>{mesaCart[item.id] || 0}</span>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setTableCartQty(selectedTableId, item.id, 1)}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="allergen-panel__summary">
            <strong>{mesaTotal.toFixed(2)} €</strong>
            {mesaItemCount > 0 ? (
              <span className="kpi-label"> · {t("fermina.pedidoUnits", { count: mesaItemCount })}</span>
            ) : null}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              className="btn"
              disabled={busy || !mesaLines.length}
              onClick={() => onSendKitchen(selectedTableId, mesaLines, mesaNotes)}
            >
              {t("fermina.sendKitchen")}
            </button>
            <span className="kpi-label">{t("restaurant.mesaCloseLabel")}</span>
            {DAKINIS_RESTAURANT_PAYMENT_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={mesaClosePayment === id ? "btn" : "btn btn-outline"}
                disabled={busy || !mesaLines.length}
                onClick={() => {
                  onMesaClosePaymentChange(id);
                  onCloseTable(selectedTableId, id, mesaLines, mesaNotes);
                }}
              >
                {dakinisRestaurantPaymentLabel(id, t)}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              disabled={!mesaItemCount}
              onClick={() => {
                onSessionsChange({ ...sessions, [selectedTableId]: { cart: {}, notes: "" } });
                onSessionPatch?.(selectedTableId, { cart: {}, notes: "" }, { clear: true });
              }}
            >
              {t("restaurant.mesaClear")}
            </button>
          </div>
        </article>
      ) : (
        <p className="kpi-label" style={{ marginTop: "1rem" }}>
          {t("restaurant.mesaSelectHint")}
        </p>
      )}
    </div>
  );
}
