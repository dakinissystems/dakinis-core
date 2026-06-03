import { dakinisPlanModuleDenialOrNull } from "../../api/plan-access.js";
import {
  dakinisHandleCrmContactsList,
  dakinisHandleCrmContactsPost,
  dakinisHandleCrmContactGet,
  dakinisHandleCrmContactPatch,
  dakinisHandleCrmContactTimeline,
  dakinisHandleCrmActivitiesList,
  dakinisHandleCrmActivitiesPost,
  dakinisHandleCrmCompaniesList,
  dakinisHandleCrmCompaniesPost,
  dakinisHandleCrmMeta
} from "../../api/tenant-crm-routes.js";
import { dakinisHandleApiRequest } from "../../api/router.js";

const DAKINIS_CRM_LEGACY = "/api/crm";

function dakinisCrmPlanGate(business, legacyPath = DAKINIS_CRM_LEGACY) {
  return dakinisPlanModuleDenialOrNull(business, legacyPath);
}

export function dakinisHandleCrmRoute(req, rawBody, url) {
  const business = req.dakinisBusiness;
  if (!business) return null;

  const contactIdMatch = /^\/api\/v1\/crm\/contacts\/([^/]+)$/.exec(url.pathname);
  const timelineMatch = /^\/api\/v1\/crm\/contacts\/([^/]+)\/timeline$/.exec(url.pathname);
  const activitiesMatch = /^\/api\/v1\/crm\/contacts\/([^/]+)\/activities$/.exec(url.pathname);

  if (req.method === "GET" && url.pathname === "/api/v1/crm/meta") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmMeta(req);
  }

  if (req.method === "GET" && url.pathname === "/api/v1/crm/contacts") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmContactsList(req, url);
  }

  if (req.method === "POST" && url.pathname === "/api/v1/crm/contacts") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmContactsPost(req, rawBody);
  }

  if (contactIdMatch && req.method === "GET") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmContactGet(req, decodeURIComponent(contactIdMatch[1]));
  }

  if (contactIdMatch && req.method === "PATCH") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmContactPatch(req, decodeURIComponent(contactIdMatch[1]), rawBody);
  }

  if (timelineMatch && req.method === "GET") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmContactTimeline(req, decodeURIComponent(timelineMatch[1]));
  }

  if (activitiesMatch && req.method === "GET") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmActivitiesList(req, decodeURIComponent(activitiesMatch[1]));
  }

  if (activitiesMatch && req.method === "POST") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmActivitiesPost(req, decodeURIComponent(activitiesMatch[1]), rawBody);
  }

  if (req.method === "GET" && url.pathname === "/api/v1/crm/companies") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmCompaniesList(req);
  }

  if (req.method === "POST" && url.pathname === "/api/v1/crm/companies") {
    const denied = dakinisCrmPlanGate(business);
    if (denied) return denied;
    return dakinisHandleCrmCompaniesPost(req, rawBody);
  }

  const legacyUrl = new URL(url.toString());
  const routeMap = {
    "POST /api/v1/crm/segment": "/api/crm/segment",
    "POST /api/v1/crm/timeline": "/api/crm/timeline"
  };
  const key = `${req.method} ${url.pathname}`;
  const legacyPath = routeMap[key];
  if (!legacyPath) return null;

  const denied = dakinisCrmPlanGate(business, legacyPath);
  if (denied) return denied;

  legacyUrl.pathname = legacyPath;
  return dakinisHandleApiRequest(req, rawBody, legacyUrl);
}
