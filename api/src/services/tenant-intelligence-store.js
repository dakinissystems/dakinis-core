import { randomUUID } from "node:crypto";
import { dakinisResolveDbDriver } from "../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import {
  dakinisParseBusinessConfig,
  dakinisMergeBusinessSettings,
  dakinisSerializeBusinessConfig
} from "@dakinis/shared/catalog/business-settings.js";
import { dakinisGetIndustryTemplate } from "@dakinis/shared/catalog/business-templates.js";
import { dakinisDefaultModulesForIndustry } from "@dakinis/shared/catalog/business-templates.js";

export async function dakinisLoadModuleOverrides(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT module_key, enabled FROM tenant_module_overrides WHERE business_id = ?`,
    [businessId]
  );
  /** @type {Record<string, boolean>} */
  const map = {};
  for (const r of rows) {
    const enabled = r.enabled === true || r.enabled === 1 || r.enabled === "1";
    map[r.module_key] = enabled;
  }
  return map;
}

export async function dakinisSeedDefaultBranchAsync(businessId, businessName, slug) {
  const existing = await dakinisQueryOne(`SELECT id FROM tenant_branches WHERE business_id = ? LIMIT 1`, [
    businessId
  ]);
  if (existing) return existing.id;

  const id = `br_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const branchSlug = slug || "principal";
  await dakinisRun(
    `INSERT INTO tenant_branches (id, business_id, slug, name, timezone, is_default, settings_json)
     VALUES (?, ?, ?, ?, 'Europe/Madrid', 1, '{}')`,
    [id, businessId, branchSlug, businessName || "Sucursal principal"]
  );
  return id;
}

export async function dakinisSeedIndustryModuleOverrides(businessId, businessType, plan) {
  const defaults = dakinisDefaultModulesForIndustry(businessType);
  for (const mod of defaults) {
    await dakinisRun(
      `INSERT INTO tenant_module_overrides (business_id, module_key, enabled)
       VALUES (?, ?, 1)
       ON CONFLICT(business_id, module_key) DO NOTHING`,
      [businessId, mod]
    );
  }
  if (plan === "growth" || plan === "pro") {
    await dakinisRun(
      `INSERT INTO tenant_module_overrides (business_id, module_key, enabled) VALUES (?, 'crm', 1)
       ON CONFLICT(business_id, module_key) DO NOTHING`,
      [businessId]
    );
  }
  if (plan === "pro") {
    await dakinisRun(
      `INSERT INTO tenant_module_overrides (business_id, module_key, enabled) VALUES (?, 'whatsapp', 1)
       ON CONFLICT(business_id, module_key) DO NOTHING`,
      [businessId]
    );
  }
}

export async function dakinisBuildInitialBusinessConfig(businessType) {
  const template = dakinisGetIndustryTemplate(businessType);
  const { raw } = dakinisParseBusinessConfig("{}");
  return dakinisSerializeBusinessConfig({
    ...raw,
    templateKey: template?.key || businessType,
    settings: {
      onboardingCompleted: false,
      onboardingStep: 0,
      locale: "es",
      timezone: "Europe/Madrid",
      currency: "EUR"
    }
  });
}

export async function dakinisListBranches(businessId) {
  const rows = await dakinisQueryAll(
    `SELECT id, slug, name, timezone, is_default, settings_json, created_at
     FROM tenant_branches WHERE business_id = ? ORDER BY is_default DESC, name ASC`,
    [businessId]
  );
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    timezone: r.timezone,
    isDefault: r.is_default === true || r.is_default === 1,
    settings: safeJson(r.settings_json),
    createdAt: r.created_at
  }));
}

function safeJson(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export async function dakinisUpsertModuleOverrides(businessId, patch) {
  for (const [moduleKey, enabled] of Object.entries(patch)) {
    await dakinisRun(
      `INSERT INTO tenant_module_overrides (business_id, module_key, enabled)
       VALUES (?, ?, ?)
       ON CONFLICT(business_id, module_key) DO UPDATE SET enabled = excluded.enabled`,
      [businessId, moduleKey, enabled ? 1 : 0]
    );
  }
  return dakinisLoadModuleOverrides(businessId);
}

export async function dakinisUpdateBusinessSettings(business, patch) {
  const merged = dakinisMergeBusinessSettings(
    dakinisParseBusinessConfig(business.config_json).raw,
    patch
  );
  const json = dakinisSerializeBusinessConfig(merged);
  await dakinisRun(`UPDATE business SET config_json = ? WHERE id = ?`, [json, business.id]);
  return merged.settings;
}

function dakinisSqlSinceDays(days) {
  return dakinisResolveDbDriver() === "postgres"
    ? `now() - interval '${days} days'`
    : `datetime('now', '-${days} days')`;
}

export async function dakinisGatherTenantSignals(business) {
  const businessId = business.id;
  const template = dakinisGetIndustryTemplate(business.type);
  const entity = template?.entity || "cliente";
  const since7 = dakinisSqlSinceDays(7);

  const contactsRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_crm_contacts WHERE business_id = ?`,
    [businessId]
  ).catch(() => null);
  const activitiesRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_crm_activities a
     JOIN tenant_crm_contacts c ON c.id = a.contact_id
     WHERE c.business_id = ? AND a.created_at >= ${since7}`,
    [businessId]
  ).catch(() => null);
  const recordsRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_records WHERE business_id = ? AND entity = ?`,
    [businessId, entity]
  ).catch(() => ({ n: 0 }));
  const usersRow = await dakinisQueryOne(`SELECT COUNT(*) AS n FROM users WHERE business_id = ?`, [
    businessId
  ]);
  const branchesRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_branches WHERE business_id = ?`,
    [businessId]
  ).catch(() => ({ n: 0 }));
  const alertsRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_supply_alerts WHERE business_id = ?`,
    [businessId]
  ).catch(() => ({ n: 0 }));
  const waRow = await dakinisQueryOne(
    `SELECT COUNT(*) AS n FROM tenant_whatsapp_messages
     WHERE business_id = ? AND created_at >= ${since7}`,
    [businessId]
  ).catch(() => ({ n: 0 }));

  const { settings } = dakinisParseBusinessConfig(business.config_json);

  const num = (row) => {
    const v = row?.n;
    return typeof v === "number" ? v : Number(v) || 0;
  };

  return {
    crmContacts: num(contactsRow),
    activities7d: num(activitiesRow),
    reservations7d: num(recordsRow),
    openOrders: 0,
    stockAlerts: num(alertsRow),
    whatsappMessages7d: num(waRow),
    branches: num(branchesRow),
    users: num(usersRow),
    onboardingCompleted: settings.onboardingCompleted
  };
}
