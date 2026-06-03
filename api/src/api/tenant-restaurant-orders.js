import { randomUUID } from "node:crypto";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisRequireTenantJwt } from "./tenant-supply.js";
import {
  DAKINIS_FERMINA_HOUSE_SLUG,
  dakinisNormalizeRestaurantChannel,
  dakinisNormalizeRestaurantPayment
} from "@dakinis/shared/catalog/restaurant-kitchen.js";

const ENTITY_ORDER = "restaurant_order";
const ENTITY_INVOICE = "restaurant_invoice";

export function dakinisRestaurantOnly(business) {
  if (String(business.type).toLowerCase() !== "restaurante") {
    return dakinisJsonError(403, "FORBIDDEN", "Modulo solo para negocios tipo restaurante");
  }
  return null;
}

function dakinisRequireRestaurantAdmin(req) {
  const role = req.dakinisAuth?.role || "admin";
  if (role !== "admin" && role !== "platform_admin") {
    return dakinisJsonError(403, "FORBIDDEN", "Solo administradores del negocio");
  }
  return null;
}

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

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

function dakinisMeta(req) {
  return { businessId: req.dakinisBusiness.id, businessSlug: req.dakinisBusiness.slug };
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

export async function dakinisHandleRestaurantMenuGet(req) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const biz = await dakinisQueryOne(`SELECT name, slug, config_json FROM business WHERE id = ?`, [
    req.dakinisBusiness.id
  ]);
  let config = {};
  try {
    config = JSON.parse(biz?.config_json || "{}");
  } catch {
    config = {};
  }

  const menu = config?.menu?.items ?? [];
  const brand = config?.brand ?? null;

  const floorTables = Array.isArray(config?.floor?.tables) ? config.floor.tables : null;

  return dakinisJsonSuccess(
    {
      venueName: biz?.name,
      slug: biz?.slug,
      brand,
      menu,
      floorTables,
      isFermina: biz?.slug === DAKINIS_FERMINA_HOUSE_SLUG
    },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantMenuPatch(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  const adminErr = dakinisRequireRestaurantAdmin(req);
  if (adminErr) return adminErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const items = Array.isArray(body.items) ? body.items : null;
  if (!items?.length) return dakinisJsonError(400, "VALIDATION_ERROR", "items requerido");

  const biz = await dakinisQueryOne(`SELECT config_json FROM business WHERE id = ?`, [
    req.dakinisBusiness.id
  ]);
  let config = {};
  try {
    config = JSON.parse(biz?.config_json || "{}");
  } catch {
    config = {};
  }

  const menuItems = config?.menu?.items ?? [];
  const byId = Object.fromEntries(
    items
      .filter((it) => it?.id)
      .map((it) => [String(it.id), Number(it.priceEur)])
  );

  const nextMenu = menuItems.map((item) => {
    if (byId[item.id] === undefined || Number.isNaN(byId[item.id])) return item;
    return { ...item, priceEur: Math.round(byId[item.id] * 100) / 100 };
  });

  config.menu = { ...(config.menu || {}), items: nextMenu };
  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [
    JSON.stringify(config),
    req.dakinisBusiness.id
  ]);

  return dakinisJsonSuccess({ menu: nextMenu }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantOrdersList(req) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const rows = await dakinisQueryAll(
    `SELECT id, payload, created_at FROM tenant_records
     WHERE business_id = ? AND entity = ?
     ORDER BY created_at DESC LIMIT 80`,
    [req.dakinisBusiness.id, ENTITY_ORDER]
  );

  return dakinisJsonSuccess(
    { orders: rows.map(dakinisParsePayload) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantOrdersPost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!lines.length) return dakinisJsonError(400, "VALIDATION_ERROR", "La comanda necesita al menos un plato");

  const existing = await dakinisQueryAll(
    `SELECT id, payload FROM tenant_records WHERE business_id = ? AND entity = ?`,
    [req.dakinisBusiness.id, ENTITY_ORDER]
  );
  const orderNumber = dakinisNextNumber(existing, "orderNumber");
  const subtotal = dakinisSumLines(lines);
  const total = Math.round((subtotal + Number(body.tax || 0)) * 100) / 100;

  const payload = {
    orderNumber,
    channel: dakinisNormalizeRestaurantChannel(body.channel),
    paymentMethod: dakinisNormalizeRestaurantPayment(body.paymentMethod),
    table: String(body.table || "").trim(),
    customerName: String(body.customerName || "Cliente").trim() || "Cliente",
    status: "nueva",
    notes: String(body.notes || "").trim(),
    lines: lines.map((l) => ({
      menuId: l.menuId,
      name: l.name,
      qty: Number(l.qty) || 1,
      unitPrice: Number(l.unitPrice) || 0,
      notes: String(l.notes || "").trim()
    })),
    subtotal,
    tax: Number(body.tax || 0),
    total,
    venueName: req.dakinisBusiness.name
  };

  const id = dakinisNewId("ord");
  await dakinisRun(
    `INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)`,
    [id, req.dakinisBusiness.id, ENTITY_ORDER, JSON.stringify(payload)]
  );

  return dakinisJsonSuccess({ order: { id, ...payload, createdAt: new Date().toISOString() } }, req.dakinisBusiness.type, {
    ...dakinisMeta(req),
    status: 201
  });
}

export async function dakinisHandleRestaurantOrdersPatch(req, orderId, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const row = await dakinisQueryOne(
    `SELECT id, payload, created_at FROM tenant_records WHERE id = ? AND business_id = ? AND entity = ?`,
    [orderId, req.dakinisBusiness.id, ENTITY_ORDER]
  );
  if (!row) return dakinisJsonError(404, "NOT_FOUND", "Comanda no encontrada");

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const current = dakinisParsePayload(row);
  const next = {
    ...current,
    ...(body.status ? { status: body.status } : {}),
    ...(body.channel !== undefined ? { channel: dakinisNormalizeRestaurantChannel(body.channel) } : {}),
    ...(body.paymentMethod !== undefined
      ? { paymentMethod: dakinisNormalizeRestaurantPayment(body.paymentMethod) }
      : {}),
    ...(body.table !== undefined ? { table: String(body.table).trim() } : {}),
    ...(body.customerName !== undefined ? { customerName: String(body.customerName).trim() } : {}),
    ...(body.notes !== undefined ? { notes: String(body.notes).trim() } : {})
  };

  await dakinisRun(`UPDATE tenant_records SET payload = ? WHERE id = ?`, [
    JSON.stringify(next),
    orderId
  ]);

  const updated = await dakinisQueryOne(
    `SELECT id, payload, created_at FROM tenant_records WHERE id = ?`,
    [orderId]
  );
  return dakinisJsonSuccess({ order: dakinisParsePayload(updated) }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantInvoicesList(req) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const rows = await dakinisQueryAll(
    `SELECT id, payload, created_at FROM tenant_records
     WHERE business_id = ? AND entity = ?
     ORDER BY created_at DESC LIMIT 80`,
    [req.dakinisBusiness.id, ENTITY_INVOICE]
  );

  return dakinisJsonSuccess(
    { invoices: rows.map(dakinisParsePayload) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantInvoicesPost(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const invoiceType = body.type === "gestor" ? "gestor" : "cliente";
  const lines = Array.isArray(body.lines) ? body.lines : [];
  let orderMeta = null;
  if (body.orderId) {
    const orderRow = await dakinisQueryOne(
      `SELECT payload FROM tenant_records WHERE id = ? AND business_id = ? AND entity = ?`,
      [body.orderId, req.dakinisBusiness.id, ENTITY_ORDER]
    );
    if (orderRow) {
      const order = dakinisParsePayload(orderRow);
      orderMeta = order;
      if (!lines.length) lines.push(...(order.lines || []));
    }
  }
  if (!lines.length) return dakinisJsonError(400, "VALIDATION_ERROR", "La factura necesita lineas o orderId");

  const existing = await dakinisQueryAll(
    `SELECT id, payload FROM tenant_records WHERE business_id = ? AND entity = ?`,
    [req.dakinisBusiness.id, ENTITY_INVOICE]
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
    orderNumber: body.orderNumber ?? orderMeta?.orderNumber ?? null,
    channel: orderMeta?.channel ?? dakinisNormalizeRestaurantChannel(body.channel),
    paymentMethod: orderMeta?.paymentMethod ?? dakinisNormalizeRestaurantPayment(body.paymentMethod),
    customerName: String(body.customerName || orderMeta?.customerName || "Cliente").trim() || "Cliente",
    taxId: String(body.taxId || "").trim(),
    lines: lines.map((l) => ({
      name: l.name,
      qty: Number(l.qty) || 1,
      unitPrice: Number(l.unitPrice) || 0
    })),
    subtotal,
    tax,
    total,
    venueName: req.dakinisBusiness.name,
    issuedAt: new Date().toISOString()
  };

  const id = dakinisNewId("inv");
  await dakinisRun(
    `INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)`,
    [id, req.dakinisBusiness.id, ENTITY_INVOICE, JSON.stringify(payload)]
  );

  return dakinisJsonSuccess(
    { invoice: { id, ...payload, createdAt: new Date().toISOString() } },
    req.dakinisBusiness.type,
    { ...dakinisMeta(req), status: 201 }
  );
}
