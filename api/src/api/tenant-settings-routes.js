import { randomUUID } from "node:crypto";
import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisBillingGetSubscription } from "../lib/billing-client.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import {
  dakinisApplyOnboardingAdvance,
  dakinisBuildTenantOnboarding,
} from "./tenant-onboarding.js";
import { dakinisRequireTenantJwtAdmin } from "./tenant-supply.js";

const COLOR_FALLBACK = "#1a4fd6";
const MAX_BRANCHES = 20;

function dakinisMeta(req) {
  const business = req.dakinisBusiness;
  return { businessId: business.id, businessSlug: business.slug };
}

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisPlainText(value, max) {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code < 32 || code === 127) continue;
    out += ch;
    if (out.length >= max) break;
  }
  return out.trim();
}

function dakinisHttpUrl(value) {
  const text = dakinisPlainText(value, 500);
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.href;
  } catch {
    return "";
  }
}

function dakinisVat(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 21;
  return Math.min(100, Math.max(0, Math.round(n * 100) / 100));
}

function dakinisSlug(value, fallback) {
  const text = dakinisPlainText(value, 63).toLowerCase();
  let out = "";
  for (const ch of text) {
    if ((ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9") || ch === "-") out += ch;
  }
  return out.replace(/^-+|-+$/g, "") || fallback;
}

export function dakinisPublicTenantSettings(raw) {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const color = dakinisPlainText(src.primaryColor, 7);
  return {
    logoUrl: dakinisHttpUrl(src.logoUrl),
    primaryColor: /^#[0-9a-fA-F]{6}$/.test(color) ? color : COLOR_FALLBACK,
    businessHours: dakinisPlainText(src.businessHours, 200),
    timezone: dakinisPlainText(src.timezone, 64) || "Europe/Madrid",
    currency: dakinisPlainText(src.currency, 8) || "EUR",
    locale: dakinisPlainText(src.locale, 16) || "es",
    vatRate: dakinisVat(src.vatRate),
    whatsappNumber: dakinisPlainText(src.whatsappNumber, 32)
  };
}

function dakinisPublicPortal(raw, slug) {
  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const features = Array.isArray(src.features)
    ? src.features
        .filter((item) => typeof item === "string")
        .map((item) => dakinisPlainText(item, 40))
        .filter(Boolean)
        .slice(0, 20)
    : [];
  return {
    enabled: src.enabled === true,
    subdomain: dakinisSlug(src.subdomain, slug),
    features
  };
}

async function dakinisLoadConfig(businessId) {
  const row = await dakinisQueryOne(`SELECT slug, plan, config_json FROM business WHERE id = ?`, [businessId]);
  let config = {};
  try {
    const parsed = JSON.parse(row?.config_json || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) config = parsed;
  } catch {
    config = {};
  }
  return { row, config };
}

async function dakinisSaveConfig(businessId, config) {
  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [JSON.stringify(config), businessId]);
}

export function dakinisBranches(config) {
  if (!Array.isArray(config.branches)) return [];
  return config.branches
    .filter((item) => item && typeof item === "object" && typeof item.id === "string")
    .map((item) => ({
      id: dakinisPlainText(item.id, 64),
      name: dakinisPlainText(item.name, 120),
      slug: dakinisPlainText(item.slug, 63),
      isDefault: item.isDefault === true
    }))
    .filter((item) => item.id && item.name);
}

/**
 * @param {Array<{id:string,name:string,slug:string,isDefault?:boolean}>} branches
 * @param {{ name: string, slug?: string, isDefault?: boolean }} input
 */
export function dakinisAddTenantBranch(branches, input = {}) {
  const list = Array.isArray(branches) ? [...branches] : [];
  if (list.length >= MAX_BRANCHES) {
    const err = new Error("BRANCH_LIMIT");
    err.code = "BRANCH_LIMIT";
    throw err;
  }
  const name = dakinisPlainText(input.name, 120);
  if (!name) {
    const err = new Error("BRANCH_NAME_REQUIRED");
    err.code = "BRANCH_NAME_REQUIRED";
    throw err;
  }
  const slug = dakinisSlug(input.slug || name, dakinisSlug(name, "sucursal"));
  if (list.some((b) => b.slug === slug)) {
    const err = new Error("BRANCH_SLUG_EXISTS");
    err.code = "BRANCH_SLUG_EXISTS";
    throw err;
  }
  const makeDefault = input.isDefault === true || list.length === 0;
  const next = makeDefault
    ? list.map((b) => ({ ...b, isDefault: false }))
    : list;
  next.push({
    id: `br_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    name,
    slug,
    isDefault: makeDefault,
  });
  return next;
}

/**
 * @param {Array<{id:string,name:string,slug:string,isDefault?:boolean}>} branches
 * @param {string} branchId
 * @param {{ name?: string, slug?: string, isDefault?: boolean }} patch
 */
export function dakinisPatchTenantBranch(branches, branchId, patch = {}) {
  const list = Array.isArray(branches) ? [...branches] : [];
  const id = dakinisPlainText(branchId, 64);
  const idx = list.findIndex((b) => b.id === id);
  if (idx < 0) {
    const err = new Error("BRANCH_NOT_FOUND");
    err.code = "BRANCH_NOT_FOUND";
    throw err;
  }
  const current = { ...list[idx] };
  if (typeof patch.name === "string") {
    const name = dakinisPlainText(patch.name, 120);
    if (!name) {
      const err = new Error("BRANCH_NAME_REQUIRED");
      err.code = "BRANCH_NAME_REQUIRED";
      throw err;
    }
    current.name = name;
  }
  if (typeof patch.slug === "string" && patch.slug.trim()) {
    const slug = dakinisSlug(patch.slug, current.slug);
    if (list.some((b, i) => i !== idx && b.slug === slug)) {
      const err = new Error("BRANCH_SLUG_EXISTS");
      err.code = "BRANCH_SLUG_EXISTS";
      throw err;
    }
    current.slug = slug;
  }
  list[idx] = current;
  if (patch.isDefault === true) {
    return list.map((b, i) => ({ ...b, isDefault: i === idx }));
  }
  return list;
}

/**
 * @param {Array<{id:string,name:string,slug:string,isDefault?:boolean}>} branches
 * @param {string} branchId
 */
export function dakinisRemoveTenantBranch(branches, branchId) {
  const list = Array.isArray(branches) ? [...branches] : [];
  const id = dakinisPlainText(branchId, 64);
  const idx = list.findIndex((b) => b.id === id);
  if (idx < 0) {
    const err = new Error("BRANCH_NOT_FOUND");
    err.code = "BRANCH_NOT_FOUND";
    throw err;
  }
  if (list.length <= 1) {
    const err = new Error("BRANCH_LAST");
    err.code = "BRANCH_LAST";
    throw err;
  }
  const removingDefault = list[idx].isDefault === true;
  const next = list.filter((_, i) => i !== idx);
  if (removingDefault && next.length) {
    next[0] = { ...next[0], isDefault: true };
  }
  return next;
}

export async function dakinisHandleTenantSettingsRoute(req, rawBody, path) {
  const business = req.dakinisBusiness;
  if (!business) return null;

  if (path === "/api/v1/tenant/profile" && req.method === "GET") {
    const { config } = await dakinisLoadConfig(business.id);
    const onboarding = await dakinisBuildTenantOnboarding(business.id, config, business);
    return dakinisJsonSuccess(
      {
        settings: dakinisPublicTenantSettings(config.settings),
        branches: dakinisBranches(config),
        onboarding
      },
      business.type,
      dakinisMeta(req)
    );
  }

  if (path === "/api/v1/tenant/onboarding" && req.method === "GET") {
    const { config } = await dakinisLoadConfig(business.id);
    const onboarding = await dakinisBuildTenantOnboarding(business.id, config, business);
    return dakinisJsonSuccess({ onboarding }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/onboarding/advance" && req.method === "POST") {
    const jwtErr = dakinisRequireTenantJwtAdmin(req);
    if (jwtErr) return jwtErr;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    const { config } = await dakinisLoadConfig(business.id);
    const nextConfig = dakinisApplyOnboardingAdvance(config, body);
    await dakinisSaveConfig(business.id, nextConfig);
    const onboarding = await dakinisBuildTenantOnboarding(business.id, nextConfig, business);
    return dakinisJsonSuccess({ onboarding }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/branches" && req.method === "GET") {
    const { config } = await dakinisLoadConfig(business.id);
    return dakinisJsonSuccess({ branches: dakinisBranches(config) }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/branches" && req.method === "POST") {
    const jwtErr = dakinisRequireTenantJwtAdmin(req);
    if (jwtErr) return jwtErr;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    const { config } = await dakinisLoadConfig(business.id);
    try {
      const branches = dakinisAddTenantBranch(dakinisBranches(config), body);
      await dakinisSaveConfig(business.id, { ...config, branches });
      return dakinisJsonSuccess({ branches }, business.type, dakinisMeta(req));
    } catch (err) {
      const code = err?.code || "BRANCH_ERROR";
      if (code === "BRANCH_NAME_REQUIRED") return dakinisJsonError(400, code, "Nombre de sucursal requerido");
      if (code === "BRANCH_SLUG_EXISTS") return dakinisJsonError(409, code, "Ya existe una sucursal con ese slug");
      if (code === "BRANCH_LIMIT") return dakinisJsonError(400, code, "Límite de sucursales alcanzado");
      return dakinisJsonError(400, code, err instanceof Error ? err.message : "No se pudo crear la sucursal");
    }
  }

  const branchMatch = path.match(/^\/api\/v1\/tenant\/branches\/([^/]+)$/);
  if (branchMatch && req.method === "PATCH") {
    const jwtErr = dakinisRequireTenantJwtAdmin(req);
    if (jwtErr) return jwtErr;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    const { config } = await dakinisLoadConfig(business.id);
    try {
      const branches = dakinisPatchTenantBranch(dakinisBranches(config), decodeURIComponent(branchMatch[1]), body);
      await dakinisSaveConfig(business.id, { ...config, branches });
      return dakinisJsonSuccess({ branches }, business.type, dakinisMeta(req));
    } catch (err) {
      const code = err?.code || "BRANCH_ERROR";
      if (code === "BRANCH_NOT_FOUND") return dakinisJsonError(404, code, "Sucursal no encontrada");
      if (code === "BRANCH_NAME_REQUIRED") return dakinisJsonError(400, code, "Nombre de sucursal requerido");
      if (code === "BRANCH_SLUG_EXISTS") return dakinisJsonError(409, code, "Ya existe una sucursal con ese slug");
      return dakinisJsonError(400, code, err instanceof Error ? err.message : "No se pudo actualizar");
    }
  }

  if (branchMatch && req.method === "DELETE") {
    const jwtErr = dakinisRequireTenantJwtAdmin(req);
    if (jwtErr) return jwtErr;
    const { config } = await dakinisLoadConfig(business.id);
    try {
      const branches = dakinisRemoveTenantBranch(dakinisBranches(config), decodeURIComponent(branchMatch[1]));
      await dakinisSaveConfig(business.id, { ...config, branches });
      return dakinisJsonSuccess({ branches }, business.type, dakinisMeta(req));
    } catch (err) {
      const code = err?.code || "BRANCH_ERROR";
      if (code === "BRANCH_NOT_FOUND") return dakinisJsonError(404, code, "Sucursal no encontrada");
      if (code === "BRANCH_LAST") return dakinisJsonError(400, code, "No puedes eliminar la única sucursal");
      return dakinisJsonError(400, code, err instanceof Error ? err.message : "No se pudo eliminar");
    }
  }

  if (path === "/api/v1/tenant/settings" && req.method === "PATCH") {
    const jwtErr = dakinisRequireTenantJwtAdmin(req);
    if (jwtErr) return jwtErr;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    const { config } = await dakinisLoadConfig(business.id);
    const settings = dakinisPublicTenantSettings({ ...dakinisPublicTenantSettings(config.settings), ...body });
    await dakinisSaveConfig(business.id, { ...config, settings });
    return dakinisJsonSuccess({ settings }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/billing/summary" && req.method === "GET") {
    let data = {};
    try {
      const proxied = await dakinisBillingGetSubscription(business.id);
      if (proxied.ok && proxied.data && typeof proxied.data === "object") data = proxied.data;
    } catch {
      data = {};
    }
    const billing = {
      subscription: { plan: data.planId || data.plan || business.plan },
      stripeConnected: Boolean(data.stripeSubscriptionId)
    };
    if (data.usage && typeof data.usage === "object") billing.usage = data.usage;
    const amount = Number(data.nextInvoiceEstimate?.amount);
    if (Number.isFinite(amount)) {
      billing.nextInvoiceEstimate = {
        amount,
        note: dakinisPlainText(data.nextInvoiceEstimate?.note, 200)
      };
    }
    return dakinisJsonSuccess({ billing }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/portal/settings" && req.method === "GET") {
    const { row, config } = await dakinisLoadConfig(business.id);
    const portal = dakinisPublicPortal(config.portal, row?.slug || business.slug);
    return dakinisJsonSuccess(
      { portal, suggestedFeatures: portal.features },
      business.type,
      dakinisMeta(req)
    );
  }

  if (path === "/api/v1/tenant/portal/settings" && req.method === "PATCH") {
    const jwtErr = dakinisRequireTenantJwtAdmin(req);
    if (jwtErr) return jwtErr;
    const body = dakinisParseJson(rawBody);
    if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
    const { row, config } = await dakinisLoadConfig(business.id);
    const portal = dakinisPublicPortal(
      { ...dakinisPublicPortal(config.portal, row?.slug || business.slug), ...body },
      row?.slug || business.slug
    );
    await dakinisSaveConfig(business.id, { ...config, portal });
    return dakinisJsonSuccess({ portal, suggestedFeatures: portal.features }, business.type, dakinisMeta(req));
  }

  return null;
}
