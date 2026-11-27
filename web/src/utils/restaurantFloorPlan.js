import { DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES } from "@dakinis/shared/catalog/restaurant-floor.js";

export function dakinisDefaultFloorTables() {
  return DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((t) => ({ ...t }));
}

export function dakinisTableLabel(tables, tableId) {
  return tables.find((t) => t.id === tableId)?.label || tableId;
}

export function dakinisTableCartLines(cart, menu, channelId = "salon") {
  void channelId;
  const menuById = new Map(menu.map((m) => [m.id, m]));
  const lines = [];
  for (const [menuId, qty] of Object.entries(cart || {})) {
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
}

export function dakinisTableCartTotal(cart, menu) {
  return dakinisTableCartLines(cart, menu).reduce((s, l) => s + l.qty * l.unitPrice, 0);
}

export function dakinisTableItemCount(cart) {
  return Object.values(cart || {}).reduce((n, q) => n + (q > 0 ? q : 0), 0);
}

const CLOSED_ORDER_STATUSES = new Set(["entregada", "cancelada", "cerrada"]);

/**
 * Mesa ocupada si:
 * - hay ítems en el carrito de sesión, o
 * - la sesión sigue abierta (p. ej. enviada a cocina con carrito vacío), o
 * - hay una comanda abierta ligada al label de la mesa (recupera el caso clear prematuro).
 */
export function dakinisTableIsOccupied(session, table = null, openOrders = []) {
  if (dakinisTableItemCount(session?.cart) > 0) return true;
  if (session && (session.openedAt || session.status === "open" || session.orderId)) return true;
  // Sesión presente tras PATCH sin clear (carrito vacío pero mesa no cobrada)
  if (session && typeof session === "object" && Object.prototype.hasOwnProperty.call(session, "cart")) {
    return true;
  }
  const label = String(table?.label || table?.id || "").trim();
  if (!label || !Array.isArray(openOrders) || openOrders.length === 0) return false;
  return openOrders.some((order) => {
    if (!order) return false;
    if (CLOSED_ORDER_STATUSES.has(String(order.status || "").toLowerCase())) return false;
    return String(order.table || "").trim() === label;
  });
}

function dakinisNextTableId(tables, zone = "salon") {
  let n = 1;
  while (tables.some((t) => t.id === `${zone}-${n}`)) n += 1;
  return `${zone}-${n}`;
}

/** Footprint % on the floor canvas — keep new tables clear of existing ones. */
const TABLE_GAP_X = 14;
const TABLE_GAP_Y = 14;

const ZONE_ROW_Y = {
  salon: [14, 28, 42],
  terraza: [58, 72, 86],
  barra: [42, 54, 66]
};

const ZONE_COL_X = [8, 25, 42, 59, 76];

function dakinisTableOverlaps(x, y, tables) {
  return tables.some(
    (t) => Math.abs(Number(t.x) - x) < TABLE_GAP_X && Math.abs(Number(t.y) - y) < TABLE_GAP_Y
  );
}

/** First free grid cell in the zone (falls back to a free cell anywhere on the canvas). */
function dakinisFindEmptyTableSlot(tables, zone) {
  const rows = ZONE_ROW_Y[zone] || ZONE_ROW_Y.salon;
  for (const y of rows) {
    for (const x of ZONE_COL_X) {
      if (!dakinisTableOverlaps(x, y, tables)) return { x, y };
    }
  }
  for (let y = 10; y <= 86; y += 14) {
    for (let x = 8; x <= 86; x += 17) {
      if (!dakinisTableOverlaps(x, y, tables)) return { x, y };
    }
  }
  return { x: 50, y: 50 };
}

/**
 * New libre table with empty cart — placed in free space (no auto session / products).
 */
export function dakinisNewTableAtZone(tables, zone) {
  const zoneTables = tables.filter((t) => t.zone === zone);
  const { x, y } = dakinisFindEmptyTableSlot(tables, zone);
  const id = dakinisNextTableId(tables, zone);
  const n = zoneTables.length + 1;
  return {
    id,
    zone,
    label: zone === "salon" ? `Salón ${n}` : zone === "terraza" ? `Terraza ${n}` : `Barra ${n}`,
    x,
    y,
    seats: 4,
    status: "libre"
  };
}
