import { randomUUID } from "node:crypto";
import {
  DAKINIS_DEFAULT_STOCK_LOCATIONS,
  dakinisDaysUntilExpiry,
  dakinisDemoInventoryLots,
  dakinisExpirySeverity,
  dakinisIsLotLabelCode
} from "@dakinis/shared/catalog/inventory-lots.js";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisRequireTenantJwt } from "./tenant-supply.js";

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function dakinisDefaultLocations() {
  return DAKINIS_DEFAULT_STOCK_LOCATIONS.map((loc, i) => ({
    id: `loc_${loc.slug}`,
    slug: loc.slug,
    name: loc.name,
    kind: loc.kind,
    sortOrder: loc.sortOrder ?? i + 1
  }));
}

function dakinisEnrichLot(lot, now = new Date()) {
  const daysUntilExpiry = dakinisDaysUntilExpiry(lot.expiryDate, now);
  return {
    ...lot,
    daysUntilExpiry,
    expirySeverity: dakinisExpirySeverity(lot.expiryDate, now)
  };
}

function dakinisBuildSummary(lots) {
  const summary = { critical: 0, warning: 0, ok: 0, expired: 0 };
  const byLocation = {};
  for (const lot of lots) {
    const sev = lot.expirySeverity || "ok";
    if (sev === "critical") summary.critical += 1;
    else if (sev === "warning") summary.warning += 1;
    else if (sev === "expired") summary.expired += 1;
    else summary.ok += 1;
    const key = lot.locationName || "Sin ubicación";
    if (!byLocation[key]) byLocation[key] = [];
    byLocation[key].push(lot);
  }
  return { summary, byLocation, lots };
}

async function dakinisLoadInventoryState(businessId, businessType) {
  const biz = await dakinisQueryOne(`SELECT config_json FROM business WHERE id = ?`, [businessId]);
  let config = {};
  try {
    config = JSON.parse(biz?.config_json || "{}");
  } catch {
    config = {};
  }

  const inv = config.inventory && typeof config.inventory === "object" ? config.inventory : {};
  const locations =
    Array.isArray(inv.locations) && inv.locations.length ? inv.locations : dakinisDefaultLocations();

  let lots;
  if (Array.isArray(inv.lots)) {
    lots = inv.lots.map((lot) => dakinisEnrichLot(lot));
  } else if (String(businessType).toLowerCase() === "restaurante") {
    lots = dakinisDemoInventoryLots();
  } else {
    lots = [];
  }

  return { config, locations, lots };
}

async function dakinisSaveInventoryState(businessId, config, inventory) {
  const next = { ...config, inventory };
  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [JSON.stringify(next), businessId]);
}

export async function dakinisHandleInventoryLocationsGet(req) {
  const business = req.dakinisBusiness;
  if (!business) return dakinisJsonError(500, "INTERNAL_ERROR", "Negocio no resuelto");
  const { locations } = await dakinisLoadInventoryState(business.id, business.type);
  return dakinisJsonSuccess({ locations }, business.type, dakinisMeta(req));
}

export async function dakinisHandleInventorySummaryGet(req) {
  const business = req.dakinisBusiness;
  if (!business) return dakinisJsonError(500, "INTERNAL_ERROR", "Negocio no resuelto");
  const { lots } = await dakinisLoadInventoryState(business.id, business.type);
  const built = dakinisBuildSummary(lots);
  return dakinisJsonSuccess(built, business.type, dakinisMeta(req));
}

export async function dakinisHandleInventoryReceivePost(req, rawBody) {
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;
  const business = req.dakinisBusiness;
  if (!business) return dakinisJsonError(500, "INTERNAL_ERROR", "Negocio no resuelto");

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const { config, locations, lots } = await dakinisLoadInventoryState(business.id, business.type);
  const loc =
    locations.find((l) => l.id === body.locationId) ||
    locations.find((l) => l.slug === body.locationId) ||
    locations[0];

  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
  const lot = dakinisEnrichLot({
    id: dakinisNewId("lot"),
    labelCode: `LOT-${year}-${seq}`,
    productName: String(body.productName || body.productBarcode || "Producto").trim() || "Producto",
    productBarcode: String(body.productBarcode || "").trim(),
    supplierLot: String(body.supplierLot || "").trim(),
    supplier: String(body.supplier || "").trim(),
    expiryDate: String(body.expiryDate || "").trim(),
    quantityRemaining: Number(body.quantity) > 0 ? Number(body.quantity) : 1,
    locationId: loc?.id || null,
    locationName: loc?.name || "Almacén"
  });

  const nextLots = [lot, ...lots];
  await dakinisSaveInventoryState(business.id, config, {
    locations,
    lots: nextLots
  });

  return dakinisJsonSuccess({ lot }, business.type, dakinisMeta(req));
}

export async function dakinisHandleInventoryLotResolveGet(req, labelCode) {
  const business = req.dakinisBusiness;
  if (!business) return dakinisJsonError(500, "INTERNAL_ERROR", "Negocio no resuelto");
  const code = String(labelCode || "").trim().toUpperCase();
  if (!dakinisIsLotLabelCode(code)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "Codigo de lote invalido");
  }
  const { lots } = await dakinisLoadInventoryState(business.id, business.type);
  const lot = lots.find((l) => String(l.labelCode || "").toUpperCase() === code);
  if (!lot) return dakinisJsonError(404, "NOT_FOUND", "Lote no encontrado");
  return dakinisJsonSuccess({ lot }, business.type, dakinisMeta(req));
}
