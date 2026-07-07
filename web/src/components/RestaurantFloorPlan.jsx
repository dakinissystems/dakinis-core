import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DAKINIS_RESTAURANT_FLOOR_ZONES } from "@dakinis/shared/catalog/restaurant-floor.js";

const DRAG_THRESHOLD_PX = 5;
const SNAP_PERCENT = 4;
const EMPTY_FLOOR_SESSIONS = Object.freeze({});

function dakinisClampPercent(n) {
  return Math.min(94, Math.max(6, n));
}

function dakinisSnapPercent(n) {
  return Math.round(n / SNAP_PERCENT) * SNAP_PERCENT;
}

/**
 * Plano de sala — arrastre tipo StreamAutomator (pointer capture, delta, guardar al soltar).
 */
export default function RestaurantFloorPlan({
  tables,
  sessions = EMPTY_FLOOR_SESSIONS,
  selectedTableId,
  onSelectTable,
  onTablesChange,
  onDragEnd,
  layoutEditable = false,
  positionEditable = false,
  onAddTable,
  tableTotal,
  t
}) {
  const label = (key, fallback) => (t ? t(key) : fallback);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const hasMovedRef = useRef(false);

  const [liveTables, setLiveTables] = useState(tables);
  const [draggingId, setDraggingId] = useState(null);
  const liveTablesRef = useRef(tables);

  useEffect(() => {
    liveTablesRef.current = liveTables;
  }, [liveTables]);

  const tablesLayoutKey = useMemo(
    () => tables.map((tbl) => `${tbl.id}:${tbl.x}:${tbl.y}`).join("|"),
    [tables]
  );
  const [syncedTablesKey, setSyncedTablesKey] = useState(tablesLayoutKey);

  if (!draggingId && tablesLayoutKey !== syncedTablesKey) {
    setSyncedTablesKey(tablesLayoutKey);
    setLiveTables(tables);
  }

  const canMove = Boolean(positionEditable && onTablesChange);
  const canAdd = Boolean((layoutEditable || positionEditable) && onAddTable);
  const canRemove = Boolean(layoutEditable && onTablesChange);

  const commitTables = useCallback(
    (next, fromDrag) => {
      setLiveTables(next);
      onTablesChange?.(next);
      if (fromDrag) onDragEnd?.(next);
    },
    [onTablesChange, onDragEnd]
  );

  const updateTablePosition = useCallback((tableId, x, y, snap = false) => {
    const nx = snap ? dakinisSnapPercent(x) : x;
    const ny = snap ? dakinisSnapPercent(y) : y;
    setLiveTables((prev) =>
      prev.map((tbl) =>
        tbl.id === tableId ? { ...tbl, x: dakinisClampPercent(nx), y: dakinisClampPercent(ny) } : tbl
      )
    );
  }, []);

  const handlePointerDown = (tableId, e) => {
    if (e.button !== 0) return;
    const tbl = liveTables.find((t) => t.id === tableId);
    if (!tbl) return;

    e.preventDefault();
    e.stopPropagation();
    hasMovedRef.current = false;
    dragRef.current = {
      tableId,
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
      posX: tbl.x,
      posY: tbl.y
    };

    if (canMove) {
      setDraggingId(tableId);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    const start = dragRef.current;
    if (!start || start.pointerId !== e.pointerId) return;

    const dist = Math.hypot(e.clientX - start.clientX, e.clientY - start.clientY);
    if (dist > DRAG_THRESHOLD_PX) hasMovedRef.current = true;
    if (!hasMovedRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dx = ((e.clientX - start.clientX) / rect.width) * 100;
    const dy = ((e.clientY - start.clientY) / rect.height) * 100;
    updateTablePosition(start.tableId, start.posX + dx, start.posY + dy, false);
  };

  const finishPointer = (e, snap) => {
    const start = dragRef.current;
    if (!start || start.pointerId !== e.pointerId) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }

    if (hasMovedRef.current) {
      const nextTables = liveTablesRef.current.map((tbl) => {
        if (tbl.id !== start.tableId) return tbl;
        return {
          ...tbl,
          x: dakinisClampPercent(snap ? dakinisSnapPercent(tbl.x) : tbl.x),
          y: dakinisClampPercent(snap ? dakinisSnapPercent(tbl.y) : tbl.y)
        };
      });
      commitTables(nextTables, true);
    }

    dragRef.current = null;
    setDraggingId(null);
  };

  const handlePointerUp = (tableId, e) => {
    const start = dragRef.current;
    if (!start || start.tableId !== tableId || start.pointerId !== e.pointerId) return;

    const tapped = !hasMovedRef.current;

    if (canMove) {
      finishPointer(e, true);
      if (tapped) onSelectTable(tableId);
    } else {
      dragRef.current = null;
      if (tapped) onSelectTable(tableId);
    }
  };

  const handlePointerCancel = (tableId, e) => {
    if (dragRef.current?.tableId !== tableId) return;
    if (canMove && hasMovedRef.current) {
      const start = dragRef.current;
      setLiveTables((prev) =>
        prev.map((tbl) =>
          tbl.id === start.tableId
            ? { ...tbl, x: dakinisClampPercent(start.posX), y: dakinisClampPercent(start.posY) }
            : tbl
        )
      );
    }
    if (canMove) finishPointer(e, false);
    else dragRef.current = null;
  };

  function removeSelected() {
    if (!canRemove || !selectedTableId || !onTablesChange) return;
    const next = liveTables.filter((tbl) => tbl.id !== selectedTableId);
    commitTables(next, false);
    onSelectTable(null);
  }

  const zones = Object.values(DAKINIS_RESTAURANT_FLOOR_ZONES);

  return (
    <div className="restaurant-floor">
      <div className="restaurant-floor__toolbar no-print">
        {canAdd ? (
          <div className="restaurant-floor__add-group">
            <span className="kpi-label">{label("restaurant.floorAdd", "Añadir mesa")}:</span>
            {zones.map((z) => (
              <button key={z.id} type="button" className="btn btn-outline" onClick={() => onAddTable(z.id)}>
                + {localeZoneLabel(z, label)}
              </button>
            ))}
          </div>
        ) : null}
        {canRemove && selectedTableId ? (
          <button type="button" className="btn btn-outline" onClick={removeSelected}>
            {label("restaurant.floorRemove", "Quitar mesa seleccionada")}
          </button>
        ) : null}
        {canMove || canAdd ? (
          <p className="kpi-label restaurant-floor__hint">
            {canMove
              ? label(
                  "restaurant.floorDragHint",
                  "Mantén pulsado y arrastra cada mesa; al soltar se guarda la posición (como en la tienda StreamAutomator)."
                )
              : label("restaurant.floorTapHint", "Toca una mesa para abrir el pedido.")}
          </p>
        ) : null}
      </div>

      <div className="restaurant-floor__canvas-wrap">
        <div
          ref={canvasRef}
          className={`restaurant-floor__canvas${canMove ? " restaurant-floor__canvas--editable" : ""}`}
          role="application"
          aria-label={label("restaurant.floorPlan", "Plano de mesas")}
        >
          <div className="restaurant-floor__grid" aria-hidden />
          <div className="restaurant-floor__zone restaurant-floor__zone--salon">
            {label("restaurant.zoneSalon", "Salón")}
          </div>
          <div className="restaurant-floor__zone restaurant-floor__zone--terraza">
            {label("restaurant.zoneTerraza", "Terraza")}
          </div>
          <div className="restaurant-floor__zone restaurant-floor__zone--barra">
            {label("restaurant.zoneBarra", "Barra")}
          </div>

          {liveTables.map((tbl) => {
            const busy = dakinisSessionBusy(sessions[tbl.id]);
            const total = tableTotal ? tableTotal(tbl.id) : 0;
            const selected = selectedTableId === tbl.id;
            const dragging = draggingId === tbl.id;

            return (
              <button
                key={tbl.id}
                type="button"
                className={`restaurant-floor__table${selected ? " is-selected" : ""}${busy ? " is-busy" : ""}${dragging ? " is-dragging" : ""}${canMove ? " is-draggable" : ""}`}
                style={{ left: `${tbl.x}%`, top: `${tbl.y}%` }}
                title={canMove ? `${tbl.label} — ${label("restaurant.floorDragTitle", "Arrastrar para mover")}` : tbl.label}
                aria-label={tbl.label}
                aria-pressed={selected}
                onPointerDown={(e) => handlePointerDown(tbl.id, e)}
                onPointerMove={canMove ? handlePointerMove : undefined}
                onPointerUp={(e) => handlePointerUp(tbl.id, e)}
                onPointerCancel={(e) => handlePointerCancel(tbl.id, e)}
              >
                {canMove ? <span className="restaurant-floor__table-grip" aria-hidden /> : null}
                <span className="restaurant-floor__table-label">{tbl.label}</span>
                {busy && total > 0 ? (
                  <span className="restaurant-floor__table-total">{total.toFixed(0)} €</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="restaurant-floor__legend">
        <span className="restaurant-floor__legend-item">
          <span className="restaurant-floor__swatch" /> {label("restaurant.floorFree", "Libre")}
        </span>
        <span className="restaurant-floor__legend-item">
          <span className="restaurant-floor__swatch restaurant-floor__swatch--busy" />{" "}
          {label("restaurant.floorBusy", "Con cuenta")}
        </span>
        <span className="restaurant-floor__legend-item">
          <span className="restaurant-floor__swatch restaurant-floor__swatch--selected" />{" "}
          {label("restaurant.floorSelected", "Seleccionada")}
        </span>
        {canMove ? (
          <span className="restaurant-floor__legend-item">
            <span className="restaurant-floor__swatch restaurant-floor__swatch--drag" />{" "}
            {label("restaurant.floorDragLegend", "Arrastrable")}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function localeZoneLabel(zone, label) {
  if (zone.id === "salon") return label("restaurant.zoneSalon", zone.labelEs);
  if (zone.id === "terraza") return label("restaurant.zoneTerraza", zone.labelEs);
  return label("restaurant.zoneBarra", zone.labelEs);
}

function dakinisSessionBusy(session) {
  if (!session?.cart) return false;
  return Object.values(session.cart).some((q) => Number(q) > 0);
}
