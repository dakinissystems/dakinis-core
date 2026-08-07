import { randomUUID } from "node:crypto";
import { dakinisSqlOrderCreatedAtDesc } from "../db/dialect.js";
import { dakinisQueryOne, dakinisQueryAll, dakinisRun } from "../db/query.js";
import { dakinisNotifyOpsOfSupplyAlert } from "../lib/ops-alerts.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { DAKINIS_ROLES, dakinisRequireRoles } from "../middleware/rbac.js";

const SEVERITIES = new Set(["info", "warning", "critical"]);

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

/** Mutaciones: solo usuario humano con JWT (admin o miembro del negocio). */
export function dakinisRequireTenantJwt(req) {
  const auth = req.dakinisAuth;
  if (!auth || auth.method !== "jwt") {
    return dakinisJsonError(
      403,
      "FORBIDDEN",
      "Gestiona entregas y alertas iniciando sesion en el negocio (JWT). La API key maestra solo permite lectura."
    );
  }
  return null;
}

/** Mutaciones sensibles (stock, inventario, supply, perfil): JWT + rol admin. */
export function dakinisRequireTenantJwtAdmin(req) {
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  return dakinisRequireRoles([
    DAKINIS_ROLES.ADMIN,
    DAKINIS_ROLES.TENANT_ADMIN,
    DAKINIS_ROLES.PLATFORM_ADMIN
  ])(req);
}

function dakinisSupplyForbiddenPlatform(business) {
  if (String(business.type).toLowerCase() === "platform") {
    return dakinisJsonError(403, "FORBIDDEN", "No aplica a cuentas de plataforma");
  }
  return null;
}

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisRowDelivery(r) {
  return {
    id: r.id,
    supplier: r.supplier,
    arrivalWindow: r.arrival_window,
    contents: r.contents,
    status: r.status,
    createdAt: r.created_at
  };
}

function dakinisRowAlert(r) {
  return {
    id: r.id,
    title: r.title,
    productRef: r.product_ref,
    condition: r.condition_text,
    severity: r.severity,
    createdAt: r.created_at
  };
}

export async function dakinisHandleSupplyDeliveriesList(req) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;

  const rows = await dakinisQueryAll(
    `SELECT id, supplier, arrival_window, contents, status, created_at
       FROM tenant_supply_deliveries
       WHERE business_id = ?
       ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}`,
    [req.dakinisBusiness.id]
  );

  return dakinisJsonSuccess(
    { deliveries: rows.map(dakinisRowDelivery) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleSupplyDeliveriesPost(req, rawBody) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const supplier = typeof body.supplier === "string" ? body.supplier.trim() : "";
  const arrivalWindow = typeof body.arrivalWindow === "string" ? body.arrivalWindow.trim() : "";
  const contents = typeof body.contents === "string" ? body.contents.trim() : "";
  const status = typeof body.status === "string" && body.status.trim() ? body.status.trim() : "Programado";

  if (!supplier || !arrivalWindow) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "supplier y arrivalWindow son obligatorios");
  }

  const id = `sd_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await dakinisRun(
    `INSERT INTO tenant_supply_deliveries (id, business_id, supplier, arrival_window, contents, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, req.dakinisBusiness.id, supplier, arrivalWindow, contents, status]
  );

  const row = await dakinisQueryOne(`SELECT * FROM tenant_supply_deliveries WHERE id = ?`, [id]);
  return dakinisJsonSuccess({ delivery: dakinisRowDelivery(row) }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleSupplyDeliveriesPatch(req, deliveryId, rawBody) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const id = typeof deliveryId === "string" ? deliveryId.trim() : "";
  if (!id) return dakinisJsonError(400, "VALIDATION_ERROR", "id invalido");

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const existing = await dakinisQueryOne(
    `SELECT * FROM tenant_supply_deliveries WHERE id = ? AND business_id = ?`,
    [id, req.dakinisBusiness.id]
  );
  if (!existing) return dakinisJsonError(404, "NOT_FOUND", "Entrega no encontrada");

  const supplier =
    body.supplier !== undefined ? String(body.supplier).trim() : existing.supplier;
  const arrivalWindow =
    body.arrivalWindow !== undefined ? String(body.arrivalWindow).trim() : existing.arrival_window;
  const contents =
    body.contents !== undefined ? String(body.contents).trim() : existing.contents;
  const status =
    body.status !== undefined && String(body.status).trim()
      ? String(body.status).trim()
      : existing.status;

  if (!supplier || !arrivalWindow) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "supplier y arrivalWindow no pueden quedar vacios");
  }

  await dakinisRun(
    `UPDATE tenant_supply_deliveries SET supplier = ?, arrival_window = ?, contents = ?, status = ? WHERE id = ? AND business_id = ?`,
    [supplier, arrivalWindow, contents, status, id, req.dakinisBusiness.id]
  );

  const row = await dakinisQueryOne(`SELECT * FROM tenant_supply_deliveries WHERE id = ?`, [id]);
  return dakinisJsonSuccess({ delivery: dakinisRowDelivery(row) }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleSupplyDeliveriesDelete(req, deliveryId) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const id = typeof deliveryId === "string" ? deliveryId.trim() : "";
  if (!id) return dakinisJsonError(400, "VALIDATION_ERROR", "id invalido");

  const r = await dakinisRun(`DELETE FROM tenant_supply_deliveries WHERE id = ? AND business_id = ?`, [
    id,
    req.dakinisBusiness.id
  ]);
  if (r.changes === 0) return dakinisJsonError(404, "NOT_FOUND", "Entrega no encontrada");

  return dakinisJsonSuccess({ deleted: true, id }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleSupplyAlertsList(req) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;

  const rows = await dakinisQueryAll(
    `SELECT id, title, product_ref, condition_text, severity, created_at
       FROM tenant_supply_alerts
       WHERE business_id = ?
       ORDER BY ${dakinisSqlOrderCreatedAtDesc("created_at")}`,
    [req.dakinisBusiness.id]
  );

  return dakinisJsonSuccess(
    { alerts: rows.map(dakinisRowAlert) },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleSupplyAlertsPost(req, rawBody) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const productRef = typeof body.productRef === "string" ? body.productRef.trim() : "";
  const conditionText = typeof body.condition === "string" ? body.condition.trim() : "";
  let severity = typeof body.severity === "string" ? body.severity.trim().toLowerCase() : "info";
  if (!SEVERITIES.has(severity)) severity = "info";

  if (!title || !conditionText) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "title y condition son obligatorios");
  }

  const id = `sa_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await dakinisRun(
    `INSERT INTO tenant_supply_alerts (id, business_id, title, product_ref, condition_text, severity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, req.dakinisBusiness.id, title, productRef, conditionText, severity]
  );

  const row = await dakinisQueryOne(`SELECT * FROM tenant_supply_alerts WHERE id = ?`, [id]);
  const alert = dakinisRowAlert(row);
  try {
    await dakinisNotifyOpsOfSupplyAlert({
      business: req.dakinisBusiness,
      alert
    });
  } catch {
    // La alerta ya está persistida; el email no debe tumbar el POST.
  }
  return dakinisJsonSuccess({ alert }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleSupplyAlertsPatch(req, alertId, rawBody) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const id = typeof alertId === "string" ? alertId.trim() : "";
  if (!id) return dakinisJsonError(400, "VALIDATION_ERROR", "id invalido");

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const existing = await dakinisQueryOne(`SELECT * FROM tenant_supply_alerts WHERE id = ? AND business_id = ?`, [
    id,
    req.dakinisBusiness.id
  ]);
  if (!existing) return dakinisJsonError(404, "NOT_FOUND", "Alerta no encontrada");

  const title = body.title !== undefined ? String(body.title).trim() : existing.title;
  const productRef = body.productRef !== undefined ? String(body.productRef).trim() : existing.product_ref;
  const conditionText =
    body.condition !== undefined ? String(body.condition).trim() : existing.condition_text;
  let severity =
    body.severity !== undefined ? String(body.severity).trim().toLowerCase() : existing.severity;
  if (!SEVERITIES.has(severity)) severity = existing.severity;

  if (!title || !conditionText) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "title y condition no pueden quedar vacios");
  }

  await dakinisRun(
    `UPDATE tenant_supply_alerts SET title = ?, product_ref = ?, condition_text = ?, severity = ? WHERE id = ? AND business_id = ?`,
    [title, productRef, conditionText, severity, id, req.dakinisBusiness.id]
  );

  const row = await dakinisQueryOne(`SELECT * FROM tenant_supply_alerts WHERE id = ?`, [id]);
  return dakinisJsonSuccess({ alert: dakinisRowAlert(row) }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleSupplyAlertsDelete(req, alertId) {
  const p = dakinisSupplyForbiddenPlatform(req.dakinisBusiness);
  if (p) return p;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const id = typeof alertId === "string" ? alertId.trim() : "";
  if (!id) return dakinisJsonError(400, "VALIDATION_ERROR", "id invalido");

  const r = await dakinisRun(`DELETE FROM tenant_supply_alerts WHERE id = ? AND business_id = ?`, [
    id,
    req.dakinisBusiness.id
  ]);
  if (r.changes === 0) return dakinisJsonError(404, "NOT_FOUND", "Alerta no encontrada");

  return dakinisJsonSuccess({ deleted: true, id }, req.dakinisBusiness.type, dakinisMeta(req));
}
