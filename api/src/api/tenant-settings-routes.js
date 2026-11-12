import { dakinisQueryOne, dakinisRun } from "../db/query.js";
import { dakinisBillingGetSubscription } from "../lib/billing-client.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisRequireTenantJwtAdmin } from "./tenant-supply.js";

const COLOR_FALLBACK = "#1a4fd6";

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

function dakinisBranches(config) {
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

export async function dakinisHandleTenantSettingsRoute(req, rawBody, path) {
  const business = req.dakinisBusiness;
  if (!business) return null;

  if (path === "/api/v1/tenant/profile" && req.method === "GET") {
    const { config } = await dakinisLoadConfig(business.id);
    const onboarding =
      config.onboarding && typeof config.onboarding === "object" && config.onboarding.completed === true
        ? { completed: true }
        : null;
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

  if (path === "/api/v1/tenant/branches" && req.method === "GET") {
    const { config } = await dakinisLoadConfig(business.id);
    return dakinisJsonSuccess({ branches: dakinisBranches(config) }, business.type, dakinisMeta(req));
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
