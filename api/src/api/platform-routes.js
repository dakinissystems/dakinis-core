import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  dakinisIsValidBusinessTypeKey,
  dakinisNormalizeBusinessTypeKey
} from "@dakinis/shared/catalog/business-type-display.js";
import { dakinisParseCommercialPlanForStorage } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun, dakinisWithTransaction } from "../db/query.js";
import { dakinisSqlOrderCreatedAtDesc, dakinisSqlOrderEmail } from "../db/dialect.js";
import { dakinisOpsAlertEmailTo } from "../lib/ops-alerts.js";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import { dakinisPublishEvent } from "../lib/event-bus.js";
import {
  dakinisInternalBaseUrl,
  dakinisInternalConfigured,
  dakinisInternalRequest,
  dakinisInternalServiceKey,
} from "../lib/internal-client.js";

const PLATFORM_CATALOG_KV_KEY = "hub_catalog";
const HUB_DEFAULT_PRODUCTS = ["core"];
const HUB_ECOSYSTEM_PRODUCT_IDS = ["core", "lifeflow", "streamautomator", "akoenet", "tabletop"];
const __platformRoutesDir = path.dirname(fileURLToPath(import.meta.url));

async function dakinisReadJsonFile(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function dakinisDefaultCatalogPayload() {
  const brandRoot = path.join(__platformRoutesDir, "../../packages/shared-brand/src");
  const products = (await dakinisReadJsonFile(path.join(brandRoot, "products.json"))) || [];
  const hubModules = (await dakinisReadJsonFile(path.join(brandRoot, "hub-modules.json"))) || [];
  return {
    products,
    hubModules,
    source: "repo",
    updatedAt: null
  };
}

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisParseBusinessConfig(configJson) {
  if (!configJson) return {};
  try {
    return typeof configJson === "string" ? JSON.parse(configJson) : configJson;
  } catch {
    return {};
  }
}

function dakinisNormalizeHubProducts(list) {
  const set = new Set(["core"]);
  if (Array.isArray(list)) {
    for (const id of list) {
      const key = String(id || "").trim();
      if (HUB_ECOSYSTEM_PRODUCT_IDS.includes(key)) set.add(key);
    }
  }
  return HUB_ECOSYSTEM_PRODUCT_IDS.filter((id) => set.has(id));
}

async function dakinisSyncHubTenantAccess(slug, products) {
  if (!dakinisInternalConfigured() || !dakinisInternalServiceKey()) {
    console.warn("[platform] hub tenant sync skipped: missing internal API URL/key");
    return;
  }
  const normalized = dakinisNormalizeHubProducts(products);
  try {
    const { ok, status } = await dakinisInternalRequest(
      `/hub/tenant-access/${encodeURIComponent(slug)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: normalized }),
      },
    );
    if (!ok) {
      console.warn("[platform] hub tenant sync failed", slug, status, "base=", dakinisInternalBaseUrl());
    }
  } catch (err) {
    console.warn("[platform] hub tenant sync error", slug, err);
  }
}

function dakinisBusinessRowPublic(row) {
  if (!row) return row;
  const config = dakinisParseBusinessConfig(row.config_json);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    plan: row.plan,
    created_at: row.created_at,
    hubProducts: dakinisNormalizeHubProducts(config.hubProducts || HUB_DEFAULT_PRODUCTS),
  };
}

export async function dakinisHandlePlatformBusinessCreate(rawBody) {
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const type = dakinisNormalizeBusinessTypeKey(typeof body.type === "string" ? body.type : "");
  const planParsed = dakinisParseCommercialPlanForStorage(
    typeof body.plan === "string" && body.plan.trim() ? body.plan.trim() : "starter"
  );
  if (planParsed === null) {
    return dakinisJsonError(400, "INVALID_PLAN", "plan debe ser starter, growth o pro (aliases: advanced, enterprise -> pro)");
  }

  if (!name || !slug || !type) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "name, slug y type son obligatorios");
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "slug: solo minusculas, numeros y guiones");
  }
  if (!dakinisIsValidBusinessTypeKey(type, { allowPlatform: false })) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "type: usa clinica, peluqueria, restaurante (u hosteleria: burger, pizzeria, bar, cafeteria, heladeria, foodtruck), inmobiliaria o una clave personalizada (minusculas, numeros, guiones, 2-48 caracteres). No uses platform al crear.");
  }

  const exists = await dakinisQueryOne("SELECT id FROM business WHERE lower(slug) = lower(?)", [slug]);
  if (exists) {
    return dakinisJsonError(409, "SLUG_TAKEN", "Ya existe un negocio con ese slug");
  }

  const ownerEmail =
    typeof body.ownerEmail === "string" ? body.ownerEmail.trim().toLowerCase() : "";
  const ownerPassword = typeof body.ownerPassword === "string" ? body.ownerPassword : "";

  if (ownerEmail || ownerPassword) {
    if (!ownerEmail || !ownerPassword) {
      return dakinisJsonError(
        400,
        "VALIDATION_ERROR",
        "Para crear el primer administrador incluye ownerEmail y ownerPassword"
      );
    }
    if (ownerPassword.length < 8) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "ownerPassword: minimo 8 caracteres");
    }
    const emailTaken = await dakinisQueryOne("SELECT id FROM users WHERE lower(email) = lower(?)", [ownerEmail]);
    if (emailTaken) {
      return dakinisJsonError(409, "EMAIL_TAKEN", "Ya existe un usuario con ownerEmail");
    }
  }

  const id = `biz_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const uid =
    ownerEmail && ownerPassword ? `usr_${randomUUID().replace(/-/g, "").slice(0, 16)}` : null;
  const passwordHash =
    ownerEmail && ownerPassword ? bcrypt.hashSync(ownerPassword, 10) : null;

  await dakinisWithTransaction(async (tx) => {
    await tx.run(
      `INSERT INTO business (id, slug, name, type, plan, config_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, slug, name, type, planParsed, JSON.stringify({ hubProducts: HUB_DEFAULT_PRODUCTS })]
    );
    if (uid && passwordHash) {
      await tx.run(
        `INSERT INTO users (id, business_id, email, password_hash, role, totp_secret, totp_enabled)
         VALUES (?, ?, ?, ?, 'admin', NULL, ?)`,
        [uid, id, ownerEmail, passwordHash, 0]
      );
    }
  });

  let initialUser = null;
  if (uid) {
    initialUser = await dakinisQueryOne(
      `SELECT id, email, role, created_at FROM users WHERE id = ?`,
      [uid]
    );
  }

  const row = await dakinisQueryOne(
    "SELECT id, slug, name, type, plan, config_json, created_at FROM business WHERE id = ?",
    [id]
  );

  await dakinisPublishEvent("tenant.created", {
    tenantId: id,
    slug,
    name,
    type,
    plan: planParsed,
    ownerUserId: uid ?? null,
    hubProducts: HUB_DEFAULT_PRODUCTS,
  });

  await dakinisSyncHubTenantAccess(slug, HUB_DEFAULT_PRODUCTS);

  return dakinisJsonSuccess({ business: dakinisBusinessRowPublic(row), initialUser }, "platform", {});
}

export async function dakinisHandlePlatformBusinessUpdate(businessId, rawBody) {
  const id = typeof businessId === "string" ? businessId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de negocio invalido");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }

  const existing = await dakinisQueryOne("SELECT * FROM business WHERE id = ?", [id]);
  if (!existing) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  let slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : undefined;
  const typeRaw = typeof body.type === "string" ? body.type : "";
  const type =
    typeRaw === "" ? undefined : dakinisNormalizeBusinessTypeKey(typeRaw);
  const plan = typeof body.plan === "string" ? body.plan.trim() : undefined;

  if (plan !== undefined && plan !== "") {
    const planParsed = dakinisParseCommercialPlanForStorage(plan);
    if (planParsed === null) {
      return dakinisJsonError(400, "INVALID_PLAN", "plan debe ser starter, growth o pro (aliases: advanced, enterprise -> pro)");
    }
  }

  if (slug !== undefined) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return dakinisJsonError(400, "VALIDATION_ERROR", "slug: solo minusculas, numeros y guiones");
    }
    if (slug !== existing.slug) {
      const clash = await dakinisQueryOne(
        "SELECT id FROM business WHERE lower(slug) = lower(?) AND id != ?",
        [slug, id]
      );
      if (clash) {
        return dakinisJsonError(409, "SLUG_TAKEN", "Ya existe otro negocio con ese slug");
      }
    }
  }
  if (type !== undefined && !dakinisIsValidBusinessTypeKey(type, { allowPlatform: true })) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "type no valido (presets, platform o clave personalizada 2-48 caracteres)");
  }
  if (name !== undefined && !name) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "name no puede estar vacio");
  }

  const nextName = name !== undefined ? name : existing.name;
  const nextSlug = slug !== undefined ? slug : existing.slug;
  const nextType = type !== undefined ? type : existing.type;
  const nextPlan =
    plan !== undefined && plan !== ""
      ? dakinisParseCommercialPlanForStorage(plan)
      : existing.plan;

  const config = dakinisParseBusinessConfig(existing.config_json);
  if (Array.isArray(body.hubProducts)) {
    config.hubProducts = dakinisNormalizeHubProducts(body.hubProducts);
  }
  const nextConfigJson = JSON.stringify(config);

  await dakinisRun(
    `UPDATE business SET name = ?, slug = ?, type = ?, plan = ?, config_json = ? WHERE id = ?`,
    [nextName, nextSlug, nextType, nextPlan, nextConfigJson, id]
  );

  const row = await dakinisQueryOne(
    "SELECT id, slug, name, type, plan, config_json, created_at FROM business WHERE id = ?",
    [id]
  );

  await dakinisPublishEvent("tenant.updated", {
    tenantId: id,
    slug: nextSlug,
    type: nextType,
    plan: nextPlan,
    hubProducts: config.hubProducts || HUB_DEFAULT_PRODUCTS,
  });

  await dakinisSyncHubTenantAccess(nextSlug, config.hubProducts || HUB_DEFAULT_PRODUCTS);

  return dakinisJsonSuccess({ business: dakinisBusinessRowPublic(row) }, "platform", {});
}

export async function dakinisHandlePlatformBusinesses() {
  const orderName = dakinisSqlOrderEmail("name");
  const rows = await dakinisQueryAll(
    `SELECT id, slug, name, type, plan, config_json, created_at
       FROM business
       ORDER BY ${orderName}`
  );
  return dakinisJsonSuccess(
    { businesses: rows.map(dakinisBusinessRowPublic) },
    "platform",
    {}
  );
}

export async function dakinisHandlePlatformUsers() {
  const orderBiz = dakinisSqlOrderEmail("b.name");
  const orderEmail = dakinisSqlOrderEmail("u.email");
  const rows = await dakinisQueryAll(
    `SELECT u.id, u.email, u.role, u.created_at,
              b.slug AS business_slug, b.name AS business_name, b.type AS business_type, b.plan AS business_plan
       FROM users u
       JOIN business b ON b.id = u.business_id
       ORDER BY ${orderBiz}, ${orderEmail}`
  );
  return dakinisJsonSuccess({ users: rows }, "platform", {});
}

export async function dakinisHandlePlatformCatalogGet() {
  try {
    const row = await dakinisQueryOne(
      "SELECT value_json, updated_at FROM platform_kv WHERE key = ?",
      [PLATFORM_CATALOG_KV_KEY]
    );
    if (row?.value_json) {
      const parsed = JSON.parse(row.value_json);
      return dakinisJsonSuccess({
        products: parsed.products || [],
        hubModules: parsed.hubModules || [],
        source: "database",
        updatedAt: row.updated_at || null
      });
    }
  } catch {
    /* platform_kv puede no existir en SQLite dev */
  }
  const defaults = await dakinisDefaultCatalogPayload();
  return dakinisJsonSuccess(defaults);
}

export async function dakinisHandlePlatformCatalogPut(rawBody) {
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }
  if (!Array.isArray(body.products)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "products debe ser un array");
  }
  const payload = {
    products: body.products,
    hubModules: Array.isArray(body.hubModules) ? body.hubModules : []
  };
  const valueJson = JSON.stringify(payload);
  const updatedAt = new Date().toISOString();
  const existing = await dakinisQueryOne("SELECT key FROM platform_kv WHERE key = ?", [
    PLATFORM_CATALOG_KV_KEY
  ]);
  if (existing) {
    await dakinisRun("UPDATE platform_kv SET value_json = ?, updated_at = ? WHERE key = ?", [
      valueJson,
      updatedAt,
      PLATFORM_CATALOG_KV_KEY
    ]);
  } else {
    await dakinisRun("INSERT INTO platform_kv (key, value_json, updated_at) VALUES (?, ?, ?)", [
      PLATFORM_CATALOG_KV_KEY,
      valueJson,
      updatedAt
    ]);
  }
  const row = await dakinisQueryOne(
    "SELECT value_json, updated_at FROM platform_kv WHERE key = ?",
    [PLATFORM_CATALOG_KV_KEY]
  );
  const parsed = row?.value_json ? JSON.parse(row.value_json) : payload;
  return dakinisJsonSuccess({
    products: parsed.products || [],
    hubModules: parsed.hubModules || [],
    source: "database",
    updatedAt: row?.updated_at || null
  });
}

export async function dakinisHandlePlatformTelemetrySummary(searchParams) {
  const daysRaw = Number(searchParams.get("days") || 30);
  const periodDays = Number.isFinite(daysRaw) && daysRaw > 0 ? Math.min(daysRaw, 365) : 30;
  const orderName = dakinisSqlOrderEmail("name");
  const rows = await dakinisQueryAll(
    `SELECT id, slug, name, type, plan, created_at
       FROM business
       WHERE lower(type) != 'platform'
       ORDER BY ${orderName}`
  );
  const tenants = rows.map((b) => ({
    businessId: b.id,
    slug: b.slug,
    name: b.name,
    type: b.type,
    plan: b.plan,
    featureSessions: 0,
    adoptionScore: 0
  }));
  return dakinisJsonSuccess({
    telemetry: { periodDays, tenants }
  });
}

/** Alertas operativas de todos los tenants (hub admin + mirror de email ops). */
export async function dakinisHandlePlatformAlertsList(searchParams) {
  const limitRaw = Number(searchParams?.get?.("limit") || 50);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50;
  const rows = await dakinisQueryAll(
    `SELECT a.id, a.title, a.product_ref, a.condition_text, a.severity, a.created_at,
            b.id AS business_id, b.slug AS business_slug, b.name AS business_name, b.type AS business_type
       FROM tenant_supply_alerts a
       INNER JOIN business b ON b.id = a.business_id
      WHERE lower(a.severity) IN ('warning', 'critical')
         OR a.product_ref LIKE 'system:load-error:%'
      ORDER BY ${dakinisSqlOrderCreatedAtDesc("a.created_at")}
      LIMIT ?`,
    [limit]
  );
  const alerts = rows.map((r) => ({
    id: r.id,
    title: r.title,
    productRef: r.product_ref,
    condition: r.condition_text,
    severity: r.severity,
    createdAt: r.created_at,
    businessId: r.business_id,
    businessSlug: r.business_slug,
    businessName: r.business_name,
    businessType: r.business_type
  }));
  return dakinisJsonSuccess({
    alerts,
    opsEmail: dakinisOpsAlertEmailTo()
  });
}

export async function dakinisHandlePlatformBusinessHubProductsGet(businessId) {
  const id = typeof businessId === "string" ? businessId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de negocio invalido");
  }
  const row = await dakinisQueryOne("SELECT slug, config_json FROM business WHERE id = ?", [id]);
  if (!row) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }
  const config = dakinisParseBusinessConfig(row.config_json);
  return dakinisJsonSuccess(
    {
      businessId: id,
      slug: row.slug,
      hubProducts: dakinisNormalizeHubProducts(config.hubProducts || HUB_DEFAULT_PRODUCTS),
    },
    "platform",
    {}
  );
}

export async function dakinisHandlePlatformBusinessHubProductsPatch(businessId, rawBody) {
  const id = typeof businessId === "string" ? businessId.trim() : "";
  if (!id) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "id de negocio invalido");
  }
  const body = dakinisParseJson(rawBody);
  if (body === null) {
    return dakinisJsonError(400, "INVALID_JSON", "JSON invalido");
  }
  if (!Array.isArray(body.hubProducts)) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "hubProducts debe ser un array");
  }
  const existing = await dakinisQueryOne("SELECT slug, config_json FROM business WHERE id = ?", [id]);
  if (!existing) {
    return dakinisJsonError(404, "NOT_FOUND", "Negocio no encontrado");
  }
  const config = dakinisParseBusinessConfig(existing.config_json);
  config.hubProducts = dakinisNormalizeHubProducts(body.hubProducts);
  await dakinisRun("UPDATE business SET config_json = ? WHERE id = ?", [
    JSON.stringify(config),
    id,
  ]);
  await dakinisSyncHubTenantAccess(existing.slug, config.hubProducts);
  return dakinisJsonSuccess(
    {
      businessId: id,
      slug: existing.slug,
      hubProducts: config.hubProducts,
    },
    "platform",
    {}
  );
}
