import { DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES } from "@dakinis/shared/catalog/restaurant-floor.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisRequireTenantJwt } from "./tenant-supply.js";
import { dakinisRestaurantOnly } from "./tenant-restaurant-orders.js";

const ENTITY_SESSION = "restaurant_table_session";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisMeta(req) {
  return { businessId: req.dakinisBusiness.id, businessSlug: req.dakinisBusiness.slug };
}

async function dakinisReadBusinessConfig(businessId) {
  const biz = await dakinisQueryOne(`SELECT config_json FROM business WHERE id = ?`, [businessId]);
  try {
    return JSON.parse(biz?.config_json || "{}");
  } catch {
    return {};
  }
}

async function dakinisWriteBusinessConfig(businessId, config) {
  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [
    JSON.stringify(config),
    businessId
  ]);
}

function dakinisNormalizeTable(raw, index = 0) {
  const id = String(raw?.id || `mesa-${index + 1}`).trim();
  const zone = String(raw?.zone || "salon").trim() || "salon";
  const label = String(raw?.label || id).trim() || id;
  const x = Math.min(92, Math.max(4, Number(raw?.x) || 10));
  const y = Math.min(92, Math.max(4, Number(raw?.y) || 20));
  const seats = Math.max(1, Math.min(12, Number(raw?.seats) || 4));
  return { id, zone, label, x, y, seats };
}

function dakinisParseSessionRow(row) {
  let payload = {};
  try {
    payload = JSON.parse(row.payload || "{}");
  } catch {
    payload = {};
  }
  return {
    tableId: row.id,
    cart: payload.cart && typeof payload.cart === "object" ? payload.cart : {},
    notes: String(payload.notes || "")
  };
}

export async function dakinisHandleRestaurantFloorGet(req) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const config = await dakinisReadBusinessConfig(req.dakinisBusiness.id);
  const tables = Array.isArray(config?.floor?.tables)
    ? config.floor.tables.map(dakinisNormalizeTable)
    : DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES;

  const rows = await dakinisQueryAll(
    `SELECT id, payload FROM tenant_records WHERE business_id = ? AND entity = ?`,
    [req.dakinisBusiness.id, ENTITY_SESSION]
  );

  const sessions = Object.fromEntries(rows.map((r) => [r.id, dakinisParseSessionRow(r)]));

  return dakinisJsonSuccess({ tables, sessions }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantFloorPatch(req, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  if (!Array.isArray(body.tables) || !body.tables.length) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "tables debe ser un array no vacio");
  }

  const tables = body.tables.map(dakinisNormalizeTable);
  const ids = new Set(tables.map((t) => t.id));
  if (ids.size !== tables.length) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "ids de mesa duplicados");
  }

  const config = await dakinisReadBusinessConfig(req.dakinisBusiness.id);
  config.floor = { ...(config.floor || {}), tables };
  await dakinisWriteBusinessConfig(req.dakinisBusiness.id, config);

  return dakinisJsonSuccess({ tables }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantTableSessionPatch(req, tableId, rawBody) {
  const gate = dakinisRestaurantOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const id = String(tableId || "").trim();
  if (!id) return dakinisJsonError(400, "VALIDATION_ERROR", "tableId invalido");

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const cart =
    body.cart !== undefined && typeof body.cart === "object" && !Array.isArray(body.cart)
      ? body.cart
      : undefined;
  const notes = body.notes !== undefined ? String(body.notes).trim() : undefined;
  const clear = body.clear === true;

  const existing = await dakinisQueryOne(
    `SELECT id, payload FROM tenant_records WHERE id = ? AND business_id = ? AND entity = ?`,
    [id, req.dakinisBusiness.id, ENTITY_SESSION]
  );

  let cur = { cart: {}, notes: "" };
  if (existing) {
    try {
      cur = { ...cur, ...JSON.parse(existing.payload || "{}") };
    } catch {
      /* ignore */
    }
  }

  const next = clear
    ? { cart: {}, notes: "" }
    : {
        cart: cart !== undefined ? cart : cur.cart,
        notes: notes !== undefined ? notes : cur.notes
      };

  const hasItems = Object.values(next.cart || {}).some((q) => Number(q) > 0);
  if (!hasItems && !next.notes) {
    if (existing) {
      await dakinisRun(`DELETE FROM tenant_records WHERE id = ? AND business_id = ?`, [
        id,
        req.dakinisBusiness.id
      ]);
    }
    return dakinisJsonSuccess({ session: { tableId: id, cart: {}, notes: "" } }, req.dakinisBusiness.type, dakinisMeta(req));
  }

  const payload = JSON.stringify(next);
  if (existing) {
    await dakinisRun(`UPDATE tenant_records SET payload = ? WHERE id = ?`, [payload, id]);
  } else {
    await dakinisRun(
      `INSERT INTO tenant_records (id, business_id, entity, payload) VALUES (?, ?, ?, ?)`,
      [id, req.dakinisBusiness.id, ENTITY_SESSION, payload]
    );
  }

  return dakinisJsonSuccess(
    { session: { tableId: id, ...next } },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}
