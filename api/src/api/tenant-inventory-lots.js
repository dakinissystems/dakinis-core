import { randomUUID } from "node:crypto";
import {
  DAKINIS_DEFAULT_STOCK_LOCATIONS,
  dakinisDaysUntilExpiry,
  dakinisExpirySeverity
} from "@dakinis/shared/catalog/inventory-lots.js";
import {
  dakinisNormalizeStockScanCode,
  dakinisResolveStockItemSlug
} from "@dakinis/shared/catalog/stock-barcodes.js";
import { dakinisSqlInsertIgnore, dakinisSqlTimestampNow } from "../db/dialect.js";
import { dakinisQueryOne, dakinisQueryAll, dakinisRun } from "../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisRequireTenantJwt } from "./tenant-supply.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisInventoryForbiddenPlatform(business) {
  if (String(business.type).toLowerCase() === "platform") {
    return dakinisJsonError(403, "FORBIDDEN", "No aplica a cuentas de plataforma");
  }
  return null;
}

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisRowLocation(r) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    kind: r.kind,
    sortOrder: r.sort_order,
    createdAt: r.created_at
  };
}

function dakinisRowLot(r, locationName) {
  const expiryDate = r.expiry_date;
  return {
    id: r.id,
    labelCode: r.label_code,
    stockItemId: r.stock_item_id,
    productName: r.product_name,
    productBarcode: r.product_barcode,
    supplierLot: r.supplier_lot,
    expiryDate,
    quantity: r.quantity,
    quantityRemaining: r.quantity_remaining,
    locationId: r.location_id,
    locationName: locationName || null,
    supplier: r.supplier,
    receivedAt: r.received_at,
    status: r.status,
    notes: r.notes,
    daysUntilExpiry: dakinisDaysUntilExpiry(expiryDate),
    expirySeverity: dakinisExpirySeverity(expiryDate)
  };
}

async function dakinisNextLotLabelCode(businessId) {
  const year = new Date().getFullYear();
  const prefix = `LOT-${year}-`;
  const row = await dakinisQueryOne(
    `SELECT label_code FROM tenant_stock_lots
     WHERE business_id = ? AND label_code LIKE ?
     ORDER BY label_code DESC LIMIT 1`,
    [businessId, `${prefix}%`]
  );
  let n = 1;
  if (row?.label_code) {
    const tail = parseInt(String(row.label_code).slice(prefix.length), 10);
    if (Number.isFinite(tail)) n = tail + 1;
  }
  return `${prefix}${String(n).padStart(6, "0")}`;
}

async function dakinisEnsureDefaultLocations(businessId) {
  for (const loc of DAKINIS_DEFAULT_STOCK_LOCATIONS) {
    await dakinisRun(
      dakinisSqlInsertIgnore("tenant_stock_locations", [
        "id",
        "business_id",
        "slug",
        "name",
        "kind",
        "sort_order"
      ]),
      [dakinisNewId("loc"), businessId, loc.slug, loc.name, loc.kind, loc.sortOrder]
    );
  }
}

async function dakinisFindStockItemByBarcode(businessId, barcode) {
  const code = dakinisNormalizeStockScanCode(barcode);
  if (!code) return null;
  const row = await dakinisQueryOne(
    `SELECT id, slug, name, unit, barcode FROM tenant_stock_items
     WHERE business_id = ? AND (barcode = ? OR slug = ?) LIMIT 1`,
    [businessId, code, dakinisResolveStockItemSlug(code)]
  );
  return row || null;
}

async function dakinisListLots(businessId, { activeOnly = true } = {}) {
  const where = activeOnly ? `AND l.status = 'active' AND l.quantity_remaining > 0` : "";
  const rows = await dakinisQueryAll(
    `SELECT l.*, loc.name AS location_name
     FROM tenant_stock_lots l
     LEFT JOIN tenant_stock_locations loc ON loc.id = l.location_id
     WHERE l.business_id = ? ${where}
     ORDER BY l.expiry_date ASC, l.received_at ASC`,
    [businessId]
  );
  return rows.map((r) => dakinisRowLot(r, r.location_name));
}

async function dakinisExpirySummary(businessId) {
  const lots = await dakinisListLots(businessId, { activeOnly: true });
  const summary = { critical: 0, warning: 0, ok: 0, expired: 0 };
  for (const lot of lots) {
    const sev = lot.expirySeverity;
    if (summary[sev] != null) summary[sev] += 1;
    else summary.ok += 1;
  }
  return { summary, lots };
}

async function dakinisAdjustStockWithLot(businessId, stockItemId, delta, reason, lotId, referenceId) {
  await dakinisRun(
    `UPDATE tenant_stock_items SET quantity = quantity + ?, updated_at = ${dakinisSqlTimestampNow()}
     WHERE id = ? AND business_id = ?`,
    [delta, stockItemId, businessId]
  );
  await dakinisRun(
    `INSERT INTO tenant_stock_movements (id, business_id, stock_item_id, delta, reason, reference_id, lot_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [dakinisNewId("sm"), businessId, stockItemId, delta, reason, referenceId ?? null, lotId ?? null]
  );
}

async function dakinisConsumeFifo(businessId, { stockItemId, productName, quantity }) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    return { error: dakinisJsonError(400, "BAD_REQUEST", "Cantidad invalida") };
  }

  let lots;
  if (stockItemId) {
    lots = await dakinisQueryAll(
      `SELECT * FROM tenant_stock_lots
       WHERE business_id = ? AND stock_item_id = ? AND status = 'active' AND quantity_remaining > 0
       ORDER BY expiry_date ASC, received_at ASC`,
      [businessId, stockItemId]
    );
  } else if (productName) {
    lots = await dakinisQueryAll(
      `SELECT * FROM tenant_stock_lots
       WHERE business_id = ? AND lower(product_name) = lower(?) AND status = 'active' AND quantity_remaining > 0
       ORDER BY expiry_date ASC, received_at ASC`,
      [businessId, String(productName).trim()]
    );
  } else {
    return { error: dakinisJsonError(400, "BAD_REQUEST", "Indica producto o lote") };
  }

  let remaining = qty;
  const consumed = [];

  for (const lot of lots) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, lot.quantity_remaining);
    const nextRemaining = lot.quantity_remaining - take;
    const nextStatus = nextRemaining <= 0 ? "depleted" : "active";
    await dakinisRun(
      `UPDATE tenant_stock_lots SET quantity_remaining = ?, status = ? WHERE id = ? AND business_id = ?`,
      [nextRemaining, nextStatus, lot.id, businessId]
    );
    if (lot.stock_item_id) {
      await dakinisAdjustStockWithLot(businessId, lot.stock_item_id, -take, "fifo_sale", lot.id, lot.label_code);
    }
    consumed.push({ labelCode: lot.label_code, quantity: take, expiryDate: lot.expiry_date });
    remaining -= take;
  }

  if (remaining > 0) {
    return {
      error: dakinisJsonError(409, "INSUFFICIENT_LOT_STOCK", "Stock por lote insuficiente para FIFO", {
        requested: qty,
        fulfilled: qty - remaining,
        consumed
      })
    };
  }

  return { consumed, quantity: qty };
}

export async function dakinisHandleInventoryLocationsGet(req) {
  const gate = dakinisInventoryForbiddenPlatform(req.dakinisBusiness);
  if (gate) return gate;

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureDefaultLocations(businessId);

  const rows = await dakinisQueryAll(
    `SELECT id, slug, name, kind, sort_order, created_at
     FROM tenant_stock_locations WHERE business_id = ? ORDER BY sort_order, name`,
    [businessId]
  );

  return dakinisJsonSuccess({ locations: rows.map(dakinisRowLocation) }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleInventorySummaryGet(req) {
  const gate = dakinisInventoryForbiddenPlatform(req.dakinisBusiness);
  if (gate) return gate;

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureDefaultLocations(businessId);
  const { summary, lots } = await dakinisExpirySummary(businessId);

  const byLocation = {};
  for (const lot of lots) {
    const key = lot.locationName || "Sin ubicación";
    if (!byLocation[key]) byLocation[key] = [];
    byLocation[key].push(lot);
  }

  return dakinisJsonSuccess(
    { summary, lots, byLocation },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleInventoryLotsList(req) {
  const gate = dakinisInventoryForbiddenPlatform(req.dakinisBusiness);
  if (gate) return gate;

  const businessId = req.dakinisBusiness.id;
  const lots = await dakinisListLots(businessId, { activeOnly: true });

  return dakinisJsonSuccess({ lots }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleInventoryLotResolveGet(req, labelCode) {
  const gate = dakinisInventoryForbiddenPlatform(req.dakinisBusiness);
  if (gate) return gate;

  const code = String(labelCode || "").trim().toUpperCase();
  if (!code) return dakinisJsonError(400, "BAD_REQUEST", "Codigo de lote requerido");

  const row = await dakinisQueryOne(
    `SELECT l.*, loc.name AS location_name
     FROM tenant_stock_lots l
     LEFT JOIN tenant_stock_locations loc ON loc.id = l.location_id
     WHERE l.business_id = ? AND upper(l.label_code) = ?`,
    [req.dakinisBusiness.id, code]
  );

  if (!row) return dakinisJsonError(404, "NOT_FOUND", "Lote no encontrado");

  return dakinisJsonSuccess(
    { lot: dakinisRowLot(row, row.location_name) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleInventoryReceivePost(req, rawBody) {
  const gate = dakinisInventoryForbiddenPlatform(req.dakinisBusiness);
  if (gate) return gate;
  const jwtGate = dakinisRequireTenantJwt(req);
  if (jwtGate) return jwtGate;

  const body = dakinisParseJson(rawBody);
  if (!body) return dakinisJsonError(400, "BAD_REQUEST", "JSON invalido");

  const businessId = req.dakinisBusiness.id;
  await dakinisEnsureDefaultLocations(businessId);

  const quantity = Number(body.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return dakinisJsonError(400, "BAD_REQUEST", "Cantidad invalida");
  }

  const expiryDate = String(body.expiryDate || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) {
    return dakinisJsonError(400, "BAD_REQUEST", "Fecha de vencimiento requerida (YYYY-MM-DD)");
  }

  const supplierLot = String(body.supplierLot || body.lot || "").trim();
  const productBarcode = dakinisNormalizeStockScanCode(body.productBarcode || body.barcode || "");
  let stockItem = null;
  if (productBarcode) {
    stockItem = await dakinisFindStockItemByBarcode(businessId, productBarcode);
  }
  if (!stockItem && body.stockItemSlug) {
    stockItem = await dakinisQueryOne(
      `SELECT id, slug, name, unit, barcode FROM tenant_stock_items WHERE business_id = ? AND slug = ?`,
      [businessId, String(body.stockItemSlug).trim()]
    );
  }

  const productName = String(body.productName || stockItem?.name || "").trim();
  if (!productName) return dakinisJsonError(400, "BAD_REQUEST", "Nombre de producto requerido");

  let locationId = body.locationId ? String(body.locationId).trim() : null;
  if (!locationId && body.locationSlug) {
    const loc = await dakinisQueryOne(
      `SELECT id FROM tenant_stock_locations WHERE business_id = ? AND slug = ?`,
      [businessId, String(body.locationSlug).trim()]
    );
    locationId = loc?.id || null;
  }

  const labelCode = await dakinisNextLotLabelCode(businessId);
  const lotId = dakinisNewId("lot");
  const supplier = String(body.supplier || "").trim();
  const notes = String(body.notes || "").trim();

  await dakinisRun(
    `INSERT INTO tenant_stock_lots (
      id, business_id, label_code, stock_item_id, product_name, product_barcode,
      supplier_lot, expiry_date, quantity, quantity_remaining, location_id, supplier, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      lotId,
      businessId,
      labelCode,
      stockItem?.id || null,
      productName,
      productBarcode || stockItem?.barcode || "",
      supplierLot,
      expiryDate,
      quantity,
      quantity,
      locationId,
      supplier,
      notes
    ]
  );

  if (stockItem?.id) {
    await dakinisAdjustStockWithLot(businessId, stockItem.id, quantity, "lot_receive", lotId, labelCode);
  }

  const row = await dakinisQueryOne(
    `SELECT l.*, loc.name AS location_name
     FROM tenant_stock_lots l
     LEFT JOIN tenant_stock_locations loc ON loc.id = l.location_id
     WHERE l.id = ?`,
    [lotId]
  );

  return dakinisJsonSuccess(
    { lot: dakinisRowLot(row, row.location_name) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleInventoryConsumePost(req, rawBody) {
  const gate = dakinisInventoryForbiddenPlatform(req.dakinisBusiness);
  if (gate) return gate;
  const jwtGate = dakinisRequireTenantJwt(req);
  if (jwtGate) return jwtGate;

  const body = dakinisParseJson(rawBody);
  if (!body) return dakinisJsonError(400, "BAD_REQUEST", "JSON invalido");

  const businessId = req.dakinisBusiness.id;
  const quantity = Number(body.quantity ?? 1);

  if (body.labelCode) {
    const code = String(body.labelCode).trim().toUpperCase();
    const lot = await dakinisQueryOne(
      `SELECT * FROM tenant_stock_lots WHERE business_id = ? AND upper(label_code) = ? AND status = 'active'`,
      [businessId, code]
    );
    if (!lot) return dakinisJsonError(404, "NOT_FOUND", "Lote no encontrado");
    const result = await dakinisConsumeFifo(businessId, {
      stockItemId: lot.stock_item_id,
      productName: lot.product_name,
      quantity
    });
    if (result.error) return result.error;
    return dakinisJsonSuccess(result, req.dakinisBusiness.type, dakinisMeta(req));
  }

  const stockItemId = body.stockItemId ? String(body.stockItemId) : null;
  const productName = body.productName ? String(body.productName) : null;
  const result = await dakinisConsumeFifo(businessId, { stockItemId, productName, quantity });
  if (result.error) return result.error;
  return dakinisJsonSuccess(result, req.dakinisBusiness.type, dakinisMeta(req));
}
