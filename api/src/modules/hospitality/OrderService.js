import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../db/query.js";
import { DAKINIS_HOSPITALITY_EVENTS, dakinisHospitalityEmit } from "./events.js";
import { dakinisApplyPriceListToLines } from "./PriceListService.js";

export const ENTITY_ORDER = "restaurant_order";
export const ENTITY_INVOICE = "restaurant_invoice";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisParsePayload(row) {
  try {
    return { ...JSON.parse(row.payload || "{}"), id: row.id, createdAt: row.created_at };
  } catch {
    return { id: row.id, createdAt: row.created_at };
  }
}

function dakinisNextNumber(rows, field) {
  let max = 0;
  for (const row of rows) {
    const p = dakinisParsePayload(row);
    const n = Number(p[field] || 0);
    if (n > max) max = n;
  }
  return max + 1;
}

function dakinisSumLines(lines = []) {
  return lines.reduce((acc, l) => acc + Number(l.qty || 0) * Number(l.unitPrice || 0), 0);
}

export async function dakinisOrdersList(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT id, payload, created_at FROM tenant_records
     WHERE business_id = ? AND entity = ?
     ORDER BY created_at DESC LIMIT 80`,
    [businessId, ENTITY_ORDER]
  );
  return rows.map(dakinisParsePayload);
}

/**
 * @param {string} businessId
 * @param {object} body
 * @param {{ venueName?: string }} [ctx]
 */
export async function dakinisOrdersCreate(businessId, body, ctx = {}) {
  let lines = Array.isArray(body.lines) ? body.lines : [];
  if (!lines.length) {
    return { error: { status: 400, code: "VALIDATION_ERROR", message: "La comanda necesita al menos un plato" } };
  }

  const channel = body.channel || "salon";
  // Tarifas por canal: resuelve precio si falta unitPrice o si viene de delivery (forcePriceList)
  lines = await dakinisApplyPriceListToLines(businessId, lines, channel, {
    force: body.forcePriceList === true || Boolean(body.externalProvider)
  });

  const existing = await dakinisQueryAll(
    `SELECT id, payload FROM tenant_records WHERE business_id = ? AND entity = ?`,
    [businessId, ENTITY_ORDER]
  );
  const orderNumber = dakinisNextNumber(existing, "orderNumber");
  const subtotal = dakinisSumLines(lines);
  const total = Math.round((subtotal + Number(body.tax || 0)) * 100) / 100;

  const payload = {
    orderNumber,
    channel,
    table: String(body.table || "").trim(),
    customerName: String(body.customerName || "Cliente").trim() || "Cliente",
    status: "nueva",
    notes: String(body.notes || "").trim(),
    lines: lines.map((l) => ({
      menuId: l.menuId,
      name: l.name,
      qty: Number(l.qty) || 1,
      unitPrice: Number(l.unitPrice) || 0,
      notes: String(l.notes || "").trim(),
      priceListKey: l.priceListKey,
      priceSource: l.priceSource
    })),
    subtotal,
    tax: Number(body.tax || 0),
    total,
    venueName: ctx.venueName || "",
    delivery: body.delivery || null,
    payment: body.payment || null,
    externalOrderId: body.externalOrderId || null,
    externalProvider: body.externalProvider || null
  };

  const id = dakinisNewId("ord");
  await dakinisRun(`INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)`, [
    id,
    businessId,
    ENTITY_ORDER,
    JSON.stringify(payload)
  ]);

  const order = { id, ...payload, createdAt: new Date().toISOString() };
  dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.OrderCreated, {
    businessId,
    orderId: id,
    status: payload.status,
    channel: payload.channel
  });
  return { order };
}

/**
 * @param {string} businessId
 * @param {string} orderId
 * @param {object} body
 */
export async function dakinisOrdersPatch(businessId, orderId, body) {
  const row = await dakinisQueryOne(
    `SELECT id, payload FROM tenant_records WHERE id = ? AND business_id = ? AND entity = ?`,
    [orderId, businessId, ENTITY_ORDER]
  );
  if (!row) {
    return { error: { status: 404, code: "NOT_FOUND", message: "Comanda no encontrada" } };
  }

  const current = dakinisParsePayload(row);
  const prevStatus = current.status;
  const next = {
    ...current,
    ...(body.status ? { status: body.status } : {}),
    ...(body.table !== undefined ? { table: String(body.table).trim() } : {}),
    ...(body.customerName !== undefined ? { customerName: String(body.customerName).trim() } : {}),
    ...(body.notes !== undefined ? { notes: String(body.notes).trim() } : {})
  };

  await dakinisRun(`UPDATE tenant_records SET payload = ? WHERE id = ?`, [JSON.stringify(next), orderId]);

  if (body.status && body.status !== prevStatus) {
    dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.OrderStatusChanged, {
      businessId,
      orderId,
      from: prevStatus,
      to: body.status
    });
    if (body.status === "lista") {
      dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.KitchenReady, { businessId, orderId });
    }
    if (body.status === "entregada" || body.paid === true) {
      dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.OrderPaid, { businessId, orderId });
    }
  }

  return { order: { id: orderId, ...next } };
}

export async function dakinisInvoicesList(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT id, payload, created_at FROM tenant_records
     WHERE business_id = ? AND entity = ?
     ORDER BY created_at DESC LIMIT 80`,
    [businessId, ENTITY_INVOICE]
  );
  return rows.map(dakinisParsePayload);
}

/**
 * @param {string} businessId
 * @param {object} body
 * @param {{ venueName?: string }} [ctx]
 */
export async function dakinisInvoicesCreate(businessId, body, ctx = {}) {
  const invoiceType = body.type === "gestor" ? "gestor" : "cliente";
  let lines = Array.isArray(body.lines) ? [...body.lines] : [];
  if (!lines.length && body.orderId) {
    const orderRow = await dakinisQueryOne(
      `SELECT payload FROM tenant_records WHERE id = ? AND business_id = ? AND entity = ?`,
      [body.orderId, businessId, ENTITY_ORDER]
    );
    if (orderRow) {
      const order = dakinisParsePayload(orderRow);
      lines.push(...(order.lines || []));
    }
  }
  if (!lines.length) {
    return { error: { status: 400, code: "VALIDATION_ERROR", message: "La factura necesita lineas o orderId" } };
  }

  const existing = await dakinisQueryAll(
    `SELECT id, payload FROM tenant_records WHERE business_id = ? AND entity = ?`,
    [businessId, ENTITY_INVOICE]
  );
  const seq = dakinisNextNumber(existing, "seq");
  const prefix = invoiceType === "gestor" ? "FF-G" : "FF-C";
  const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`;
  const subtotal = dakinisSumLines(lines);
  const tax = Number(body.tax || 0);
  const total = Math.round((subtotal + tax) * 100) / 100;

  const payload = {
    seq,
    invoiceNumber,
    type: invoiceType,
    orderId: body.orderId || null,
    orderNumber: body.orderNumber ?? null,
    customerName: String(body.customerName || "Cliente").trim() || "Cliente",
    taxId: String(body.taxId || "").trim(),
    lines: lines.map((l) => ({
      name: l.name,
      qty: Number(l.qty) || 1,
      unitPrice: Number(l.unitPrice) || 0
    })),
    subtotal,
    tax,
    total,
    venueName: ctx.venueName || "",
    issuedAt: new Date().toISOString()
  };

  const id = dakinisNewId("inv");
  await dakinisRun(`INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)`, [
    id,
    businessId,
    ENTITY_INVOICE,
    JSON.stringify(payload)
  ]);

  const invoice = { id, ...payload, createdAt: new Date().toISOString() };
  dakinisHospitalityEmit(DAKINIS_HOSPITALITY_EVENTS.InvoiceGenerated, {
    businessId,
    invoiceId: id,
    orderId: payload.orderId
  });
  return { invoice };
}

/** Pedidos activos para KDS (Fase 1 thin). */
export async function dakinisKitchenActiveOrders(businessId) {
  const orders = await dakinisOrdersList(businessId);
  return orders.filter((o) => ["nueva", "cocina", "lista"].includes(String(o.status || "")));
}
