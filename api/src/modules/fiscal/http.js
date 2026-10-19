import { dakinisJsonError, dakinisJsonSuccess } from "../../api/responses.js";
import { dakinisRequireTenantJwt, dakinisRequireTenantJwtAdmin } from "../../api/tenant-supply.js";
import {
  dakinisFiscalGetSettings,
  dakinisFiscalPatchSettings,
  dakinisFiscalListInvoices,
  dakinisFiscalGetInvoice,
  dakinisFiscalIssueInvoice,
  dakinisFiscalRectifyInvoice,
  dakinisFiscalListEvents
} from "./FiscalService.js";

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

function dakinisRequireBusiness(req) {
  if (!req.dakinisBusiness?.id) {
    return dakinisJsonError(401, "UNAUTHORIZED", "Negocio no resuelto");
  }
  return null;
}

export async function dakinisHandleFiscalSettingsGet(req) {
  const bizErr = dakinisRequireBusiness(req);
  if (bizErr) return bizErr;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const settings = await dakinisFiscalGetSettings(req.dakinisBusiness.id);
  return dakinisJsonSuccess({ settings }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleFiscalSettingsPatch(req, rawBody) {
  const bizErr = dakinisRequireBusiness(req);
  if (bizErr) return bizErr;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const result = await dakinisFiscalPatchSettings(req.dakinisBusiness.id, body);
  if (result.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }
  return dakinisJsonSuccess({ settings: result.settings }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleFiscalInvoicesList(req, url) {
  const bizErr = dakinisRequireBusiness(req);
  if (bizErr) return bizErr;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const limit = Number(url?.searchParams?.get("limit") || 80);
  const invoices = await dakinisFiscalListInvoices(req.dakinisBusiness.id, { limit });
  return dakinisJsonSuccess({ invoices }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleFiscalInvoicesPost(req, rawBody) {
  const bizErr = dakinisRequireBusiness(req);
  if (bizErr) return bizErr;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const result = await dakinisFiscalIssueInvoice(req.dakinisBusiness.id, body, {
    issuerFallbackName: req.dakinisBusiness.name
  });
  if (result.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }
  return dakinisJsonSuccess({ invoice: result.invoice }, req.dakinisBusiness.type, {
    ...dakinisMeta(req),
    status: 201
  });
}

export async function dakinisHandleFiscalInvoiceGet(req, invoiceId) {
  const bizErr = dakinisRequireBusiness(req);
  if (bizErr) return bizErr;
  const jwtErr = dakinisRequireTenantJwt(req);
  if (jwtErr) return jwtErr;

  const invoice = await dakinisFiscalGetInvoice(req.dakinisBusiness.id, invoiceId);
  if (!invoice) return dakinisJsonError(404, "NOT_FOUND", "Factura no encontrada");
  const events = await dakinisFiscalListEvents(req.dakinisBusiness.id, invoiceId);
  return dakinisJsonSuccess({ invoice, events }, req.dakinisBusiness.type, dakinisMeta(req));
}

export async function dakinisHandleFiscalInvoiceRectify(req, invoiceId, rawBody) {
  const bizErr = dakinisRequireBusiness(req);
  if (bizErr) return bizErr;
  const jwtErr = dakinisRequireTenantJwtAdmin(req);
  if (jwtErr) return jwtErr;

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");

  const result = await dakinisFiscalRectifyInvoice(req.dakinisBusiness.id, invoiceId, body);
  if (result.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }
  return dakinisJsonSuccess(
    { invoice: result.invoice, originalId: result.originalId },
    req.dakinisBusiness.type,
    { ...dakinisMeta(req), status: 201 }
  );
}

/**
 * Route dispatcher for /api/tenant/fiscal/*
 * @returns {Promise<object|null>}
 */
export async function dakinisHandleFiscalRoute(req, rawBody, path, url) {
  if (!path.startsWith("/api/tenant/fiscal")) return null;

  if (path === "/api/tenant/fiscal/settings" && req.method === "GET") {
    return dakinisHandleFiscalSettingsGet(req);
  }
  if (path === "/api/tenant/fiscal/settings" && req.method === "PATCH") {
    return dakinisHandleFiscalSettingsPatch(req, rawBody);
  }
  if (path === "/api/tenant/fiscal/invoices" && req.method === "GET") {
    return dakinisHandleFiscalInvoicesList(req, url);
  }
  if (path === "/api/tenant/fiscal/invoices" && req.method === "POST") {
    return dakinisHandleFiscalInvoicesPost(req, rawBody);
  }

  const one = /^\/api\/tenant\/fiscal\/invoices\/([^/]+)$/.exec(path);
  if (one && req.method === "GET") {
    return dakinisHandleFiscalInvoiceGet(req, decodeURIComponent(one[1]));
  }

  const rectify = /^\/api\/tenant\/fiscal\/invoices\/([^/]+)\/rectify$/.exec(path);
  if (rectify && req.method === "POST") {
    return dakinisHandleFiscalInvoiceRectify(req, decodeURIComponent(rectify[1]), rawBody);
  }

  return dakinisJsonError(404, "NOT_FOUND", "Ruta fiscal no encontrada");
}
