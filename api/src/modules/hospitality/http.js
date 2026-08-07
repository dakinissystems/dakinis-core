import { dakinisIsHospitalityBusiness } from "@dakinis/shared/catalog/hospitality.js";
import { DAKINIS_FERMINA_HOUSE_SLUG } from "@dakinis/shared/catalog/restaurant-kitchen.js";
import { dakinisQueryOne } from "../../db/query.js";
import { dakinisJsonError, dakinisJsonSuccess } from "../../api/responses.js";
import { dakinisRequireTenantJwt, dakinisRequireTenantJwtAdmin } from "../../api/tenant-supply.js";
import { dakinisEnsureHospitalityEventDefaults } from "./events.js";
import { dakinisMenuListItems, dakinisMenuPatch } from "./MenuService.js";
import { dakinisFloorGet, dakinisFloorPatch, dakinisFloorUpsertSession } from "./FloorService.js";
import {
  dakinisOrdersList,
  dakinisOrdersCreate,
  dakinisOrdersPatch,
  dakinisInvoicesList,
  dakinisInvoicesCreate
} from "./OrderService.js";

dakinisEnsureHospitalityEventDefaults();

export function dakinisHospitalityOnly(business) {
  if (!dakinisIsHospitalityBusiness(business?.type)) {
    return dakinisJsonError(403, "FORBIDDEN", "Modulo solo para negocios de hosteleria");
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

function dakinisMeta(req) {
  return { businessId: req.dakinisBusiness.id, businessSlug: req.dakinisBusiness.slug };
}

export async function dakinisHandleRestaurantMenuGet(req) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const biz = await dakinisQueryOne(`SELECT name, slug, config_json FROM business WHERE id = ?`, [
    req.dakinisBusiness.id
  ]);
  let brand = null;
  try {
    brand = JSON.parse(biz?.config_json || "{}")?.brand ?? null;
  } catch {
    brand = null;
  }
  const menu = await dakinisMenuListItems(req.dakinisBusiness.id);

  return dakinisJsonSuccess(
    {
      venueName: biz?.name,
      slug: biz?.slug,
      brand,
      menu,
      isFermina: biz?.slug === DAKINIS_FERMINA_HOUSE_SLUG
    },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantMenuPatch(req, rawBody) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const result = await dakinisMenuPatch(req.dakinisBusiness.id, body);
  if (result.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }

  return dakinisJsonSuccess(
    {
      venueName: req.dakinisBusiness.name,
      slug: req.dakinisBusiness.slug,
      brand: result.brand,
      menu: result.menu
    },
    req.dakinisBusiness.type,
    dakinisMeta(req)
  );
}

export async function dakinisHandleRestaurantFloorGet(req) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const floor = await dakinisFloorGet(req.dakinisBusiness.id);
  return dakinisJsonSuccess(floor, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantFloorPatch(req, rawBody) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const floor = await dakinisFloorPatch(req.dakinisBusiness.id, body);
  return dakinisJsonSuccess(floor, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantTableSessionPatch(req, tableId, rawBody) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  if (!tableId) return dakinisJsonError(400, "VALIDATION_ERROR", "tableId requerido");

  const floor = await dakinisFloorUpsertSession(req.dakinisBusiness.id, decodeURIComponent(tableId), body);
  return dakinisJsonSuccess(floor, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantOrdersList(req) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const orders = await dakinisOrdersList(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ orders }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantOrdersPost(req, rawBody) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const result = await dakinisOrdersCreate(req.dakinisBusiness.id, body, {
    venueName: req.dakinisBusiness.name
  });
  if (result.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }

  return dakinisJsonSuccess({ order: result.order }, req.dakinisBusiness.type, {
    ...dakinisMeta(req),
    status: 201
  });
}

export async function dakinisHandleRestaurantOrdersPatch(req, orderId, rawBody) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const result = await dakinisOrdersPatch(req.dakinisBusiness.id, orderId, body);
  if (result.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }

  return dakinisJsonSuccess({ order: result.order }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantInvoicesList(req) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const invoices = await dakinisInvoicesList(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ invoices }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleRestaurantInvoicesPost(req, rawBody) {
  const gate = dakinisHospitalityOnly(req.dakinisBusiness);
  if (gate) return gate;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const result = await dakinisInvoicesCreate(req.dakinisBusiness.id, body, {
    venueName: req.dakinisBusiness.name
  });
  if (result.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }

  return dakinisJsonSuccess({ invoice: result.invoice }, req.dakinisBusiness.type, {
    ...dakinisMeta(req),
    status: 201
  });
}
