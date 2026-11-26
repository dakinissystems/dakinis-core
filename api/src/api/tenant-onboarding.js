/**
 * B10 — Checklist guiado de onboarding (estado derivado + deep links).
 */

import { dakinisQueryOne } from "../db/query.js";

const HUB_MEMBERS_URL = "https://hub.dakinissystems.com/admin/members";

/**
 * @param {object} settings
 */
function settingsLookConfigured(settings) {
  if (!settings || typeof settings !== "object") return false;
  const name = String(settings.businessName || settings.name || settings.displayName || "").trim();
  const city = String(settings.city || settings.address || "").trim();
  return Boolean(name) || Boolean(city);
}

/**
 * @param {string} businessId
 * @param {object} config
 * @param {{ type?: string }} business
 */
export async function dakinisBuildTenantOnboarding(businessId, config = {}, business = {}) {
  const forced =
    config.onboarding && typeof config.onboarding === "object" && config.onboarding.completed === true;

  let menuCount = 0;
  let stockReady = 0;
  let orderCount = 0;
  let teamCount = 1;

  try {
    const menu = await dakinisQueryOne(
      `SELECT COUNT(*) AS c FROM tenant_menu_items WHERE business_id = ?`,
      [businessId]
    );
    menuCount = Number(menu?.c || 0);
  } catch {
    menuCount = 0;
  }

  try {
    const stock = await dakinisQueryOne(
      `SELECT COUNT(*) AS c FROM tenant_stock_items WHERE business_id = ? AND quantity > 0`,
      [businessId]
    );
    stockReady = Number(stock?.c || 0);
  } catch {
    stockReady = 0;
  }

  try {
    const orders = await dakinisQueryOne(
      `SELECT COUNT(*) AS c FROM tenant_records WHERE business_id = ? AND entity = 'restaurant_order'`,
      [businessId]
    );
    orderCount = Number(orders?.c || 0);
  } catch {
    orderCount = 0;
  }

  try {
    const users = await dakinisQueryOne(
      `SELECT COUNT(*) AS c FROM users WHERE business_id = ?`,
      [businessId]
    );
    teamCount = Math.max(1, Number(users?.c || 1));
  } catch {
    teamCount = 1;
  }

  const skipped = new Set(
    Array.isArray(config.onboarding?.skipped) ? config.onboarding.skipped.map(String) : []
  );

  const steps = [
    {
      id: "empresa",
      label: "Datos de la empresa",
      href: "/app/settings",
      done: skipped.has("empresa") || settingsLookConfigured(config.settings),
    },
    {
      id: "empleados",
      label: "Invitar al equipo",
      href: HUB_MEMBERS_URL,
      external: true,
      done: skipped.has("empleados") || teamCount > 1,
      detail: teamCount > 1 ? `${teamCount} usuarios` : "Desde Hub → Admin → Miembros",
    },
    {
      id: "carta",
      label: "Cargar la carta",
      href: "/sistema/restaurante?task=config&sub=carta",
      done: skipped.has("carta") || menuCount > 0,
      detail: menuCount > 0 ? `${menuCount} productos` : "Añade al menos un producto",
    },
    {
      id: "inventario",
      label: "Poner stock",
      href: "/sistema/restaurante?task=inventario",
      done: skipped.has("inventario") || stockReady > 0,
      detail: stockReady > 0 ? `${stockReady} con cantidad` : "Revisa cantidades mínimas",
    },
    {
      id: "venta",
      label: "Primera venta",
      href: "/sistema/restaurante?task=sala",
      done: skipped.has("venta") || orderCount > 0,
      detail: orderCount > 0 ? `${orderCount} pedidos` : "Abre sala y cobra un pedido",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const derivedComplete = completedCount === steps.length;
  const completed = forced || derivedComplete;

  return {
    title: "Pon en marcha tu negocio",
    completed,
    completedCount,
    total: steps.length,
    businessType: business.type || null,
    steps,
    source: forced ? "marked" : "derived",
  };
}

/**
 * @param {object} config
 * @param {{ markComplete?: boolean; stepId?: string }} body
 */
export function dakinisApplyOnboardingAdvance(config, body = {}) {
  const next = { ...(config && typeof config === "object" ? config : {}) };
  const onboarding = {
    ...(next.onboarding && typeof next.onboarding === "object" ? next.onboarding : {}),
  };
  if (body.markComplete === true) {
    onboarding.completed = true;
    onboarding.completedAt = new Date().toISOString();
  }
  if (typeof body.stepId === "string" && body.stepId.trim()) {
    const skipped = Array.isArray(onboarding.skipped) ? [...onboarding.skipped] : [];
    if (!skipped.includes(body.stepId)) skipped.push(body.stepId.trim());
    onboarding.skipped = skipped;
  }
  next.onboarding = onboarding;
  return next;
}
