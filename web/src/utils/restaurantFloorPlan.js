import { DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES } from "@dakinis/shared/catalog/restaurant-floor.js";

export function dakinisDefaultFloorTables() {
  return DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES.map((t) => ({ ...t }));
}

export function dakinisTableLabel(tables, tableId) {
  return tables.find((t) => t.id === tableId)?.label || tableId;
}

export function dakinisTableCartLines(cart, menu, channelId = "salon") {
  return Object.entries(cart || {})
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
}

export function dakinisTableCartTotal(cart, menu) {
  return dakinisTableCartLines(cart, menu).reduce((s, l) => s + l.qty * l.unitPrice, 0);
}

export function dakinisTableItemCount(cart) {
  return Object.values(cart || {}).reduce((n, q) => n + (q > 0 ? q : 0), 0);
}

export function dakinisNextTableId(tables, zone = "salon") {
  let n = 1;
  while (tables.some((t) => t.id === `${zone}-${n}`)) n += 1;
  return `${zone}-${n}`;
}

export function dakinisNewTableAtZone(tables, zone) {
  const zoneTables = tables.filter((t) => t.zone === zone);
  const x = 8 + (zoneTables.length % 5) * 17;
  const y = zone === "terraza" ? 62 : zone === "barra" ? 42 : 22;
  const id = dakinisNextTableId(tables, zone);
  return {
    id,
    zone,
    label: zone === "salon" ? `Salón ${zoneTables.length + 1}` : zone === "terraza" ? `Terraza ${zoneTables.length + 1}` : `Barra ${zoneTables.length + 1}`,
    x,
    y,
    seats: 4
  };
}
