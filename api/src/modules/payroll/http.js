import { dakinisJsonError, dakinisJsonSuccess } from "../../api/responses.js";
import { dakinisRequirePayrollPermission } from "./authz.js";
import {
  dakinisPayrollGetSettings,
  dakinisPayrollPatchSettings,
  dakinisPayrollListJurisdictions,
  dakinisPayrollCreateJurisdiction,
  dakinisPayrollListComponents,
  dakinisPayrollCreateComponent,
  dakinisPayrollListEngagements,
  dakinisPayrollCreateEngagement,
  dakinisPayrollListPeriods,
  dakinisPayrollCreatePeriod,
  dakinisPayrollCreateRun,
  dakinisPayrollApproveRun,
  dakinisPayrollGetRun,
  dakinisPayrollListSlips,
  dakinisPayrollPaySlip
} from "./PayrollService.js";

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

function dakinisFromService(result, req, { status } = {}) {
  if (result?.error) {
    return dakinisJsonError(result.error.status, result.error.code, result.error.message);
  }
  const meta = status ? { ...dakinisMeta(req), status } : dakinisMeta(req);
  return dakinisJsonSuccess(result, req.dakinisBusiness.type, meta);
}

export async function dakinisHandlePayrollRoute(req, rawBody, path, url) {
  if (!path.startsWith("/api/tenant/payroll")) return null;

  const bizErr = dakinisRequireBusiness(req);
  if (bizErr) return bizErr;
  const businessId = req.dakinisBusiness.id;

  if (path === "/api/tenant/payroll/settings" && req.method === "GET") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.view");
    if (perm) return perm;
    return dakinisFromService(await dakinisPayrollGetSettings(businessId), req);
  }
  if (path === "/api/tenant/payroll/settings" && req.method === "PATCH") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.manage");
    if (perm) return perm;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    return dakinisFromService(await dakinisPayrollPatchSettings(businessId, body), req);
  }

  if (path === "/api/tenant/payroll/jurisdictions" && req.method === "GET") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.view");
    if (perm) return perm;
    return dakinisFromService(await dakinisPayrollListJurisdictions(businessId), req);
  }
  if (path === "/api/tenant/payroll/jurisdictions" && req.method === "POST") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.manage");
    if (perm) return perm;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    return dakinisFromService(await dakinisPayrollCreateJurisdiction(businessId, body), req, {
      status: 201
    });
  }

  if (path === "/api/tenant/payroll/components" && req.method === "GET") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.view");
    if (perm) return perm;
    return dakinisFromService(
      await dakinisPayrollListComponents(businessId, {
        jurisdictionCode: url?.searchParams?.get("jurisdiction") || undefined,
        onDate: url?.searchParams?.get("on") || undefined
      }),
      req
    );
  }
  if (path === "/api/tenant/payroll/components" && req.method === "POST") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.manage");
    if (perm) return perm;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    return dakinisFromService(await dakinisPayrollCreateComponent(businessId, body), req, { status: 201 });
  }

  if (path === "/api/tenant/payroll/engagements" && req.method === "GET") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.view");
    if (perm) return perm;
    return dakinisFromService(await dakinisPayrollListEngagements(businessId), req);
  }
  if (path === "/api/tenant/payroll/engagements" && req.method === "POST") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.manage");
    if (perm) return perm;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    return dakinisFromService(await dakinisPayrollCreateEngagement(businessId, body), req, { status: 201 });
  }

  if (path === "/api/tenant/payroll/periods" && req.method === "GET") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.view");
    if (perm) return perm;
    return dakinisFromService(await dakinisPayrollListPeriods(businessId), req);
  }
  if (path === "/api/tenant/payroll/periods" && req.method === "POST") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.manage");
    if (perm) return perm;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    return dakinisFromService(await dakinisPayrollCreatePeriod(businessId, body), req, { status: 201 });
  }

  if (path === "/api/tenant/payroll/runs" && req.method === "POST") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.run");
    if (perm) return perm;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    return dakinisFromService(await dakinisPayrollCreateRun(businessId, body), req, { status: 201 });
  }

  if (path === "/api/tenant/payroll/slips" && req.method === "GET") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.view");
    if (perm) return perm;
    return dakinisFromService(
      await dakinisPayrollListSlips(businessId, { runId: url?.searchParams?.get("run_id") || undefined }),
      req
    );
  }

  const runGet = /^\/api\/tenant\/payroll\/runs\/([^/]+)$/.exec(path);
  if (runGet && req.method === "GET") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.view");
    if (perm) return perm;
    return dakinisFromService(await dakinisPayrollGetRun(businessId, decodeURIComponent(runGet[1])), req);
  }

  const approve = /^\/api\/tenant\/payroll\/runs\/([^/]+)\/approve$/.exec(path);
  if (approve && req.method === "POST") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.approve");
    if (perm) return perm;
    return dakinisFromService(await dakinisPayrollApproveRun(businessId, decodeURIComponent(approve[1])), req);
  }

  const pay = /^\/api\/tenant\/payroll\/slips\/([^/]+)\/pay$/.exec(path);
  if (pay && req.method === "POST") {
    const perm = dakinisRequirePayrollPermission(req, "payroll.pay");
    if (perm) return perm;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    return dakinisFromService(await dakinisPayrollPaySlip(businessId, decodeURIComponent(pay[1]), body), req, {
      status: 201
    });
  }

  return dakinisJsonError(404, "NOT_FOUND", "Ruta de nómina no encontrada");
}
