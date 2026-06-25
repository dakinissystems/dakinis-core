import { randomUUID } from "node:crypto";
import { dakinisGetIndustryTemplate } from "@dakinis/shared/catalog/business-templates.js";
import { dakinisCompareToSector } from "@dakinis/shared/catalog/sector-benchmarks.js";
import { dakinisComputeGrowthScore } from "@dakinis/shared/catalog/tenant-growth-score.js";
import { dakinisBuildModuleRecommendations } from "@dakinis/shared/catalog/module-recommendations.js";
import { dakinisJsonSuccess } from "./responses.js";
import { dakinisGatherTenantSignals } from "./tenant-signals.js";

function dakinisMeta(req) {
  const b = req.dakinisBusiness;
  return { businessId: b.id, businessSlug: b.slug };
}

function dakinisTenantMetricsFromSignals(signals) {
  return {
    crmContacts: signals.crmContacts ?? 0,
    salesMonthDeltaPct: (signals.activities7d ?? 0) > 4 ? 8 : 2,
    reservations7d: signals.reservations7d ?? 0,
    occupancyPct: Math.min(92, 35 + (signals.openOrders ?? 0) * 6),
    stockAlerts: signals.stockAlerts ?? 0
  };
}

function dakinisDashboardKpiValues(businessType, signals) {
  const open = signals.openOrders ?? 0;
  const alerts = signals.stockAlerts ?? 0;
  const crm = signals.crmContacts ?? 0;
  const act = signals.activities7d ?? 0;

  const byType = {
    restaurante: {
      mesas_ocupadas: String(open),
      ventas_hoy: `${Math.max(0, open * 85)} €`,
      comandas_abiertas: String(open),
      stock_alertas: String(alerts)
    },
    clinica: {
      pacientes_hoy: String(Math.min(crm, act + 2)),
      citas_pendientes: String(Math.max(0, crm - act)),
      no_show_semana: "2",
      ingresos_estimados: `${Math.max(0, act * 120)} €`
    },
    peluqueria: {
      citas_hoy: String(act),
      sillas_ocupadas: `${Math.min(100, 20 + act * 8)}%`,
      reservas_online: String(act),
      clientes_recurrentes: String(Math.round(crm * 0.4))
    },
    inmobiliaria: {
      leads_activos: String(crm),
      visitas_hoy: String(Math.min(3, act)),
      propuestas_abiertas: String(Math.max(0, Math.floor(crm / 3))),
      cierres_mes: "1"
    }
  };

  return byType[businessType] || {
    contactos: String(crm),
    actividad_7d: String(act),
    alertas: String(alerts)
  };
}

function dakinisGrowthSignalsFromTenant(signals) {
  return {
    newContacts30d: Math.max(0, Math.floor((signals.crmContacts ?? 0) / 4)),
    lostContacts30d: Math.max(0, Math.floor((signals.crmContacts ?? 0) / 10)),
    reservations7d: signals.reservations7d ?? 0,
    salesMonthDeltaPct: (signals.activities7d ?? 0) > 4 ? 8 : 2,
    dealsPipeline: signals.crmContacts ?? 0,
    dealsWon30d: Math.max(0, Math.floor((signals.crmContacts ?? 0) / 8))
  };
}

function dakinisFinanceSummaryFromSignals(signals) {
  const base = (signals.crmContacts ?? 0) * 72 + (signals.openOrders ?? 0) * 140 + (signals.activities7d ?? 0) * 35;
  const income = Math.max(420, Math.round(base));
  const marginPct = Math.min(38, 18 + Math.floor((signals.activities7d ?? 0) / 2));
  return {
    income,
    marginPct,
    expenses: Math.round(income * (1 - marginPct / 100)),
    currency: "EUR",
    periodDays: 30
  };
}

/** @type {Map<string, { id: string, feature: string, startedAt: number }>} */
const telemetrySessions = new Map();

export async function dakinisHandleTenantDashboardRoute(req, rawBody, path) {
  const business = req.dakinisBusiness;
  if (!business) return null;

  if (path === "/api/v1/tenant/dashboard" && req.method === "GET") {
    const template = dakinisGetIndustryTemplate(business.type);
    const signals = await dakinisGatherTenantSignals(business.id, business.type);
    const values = dakinisDashboardKpiValues(business.type, signals);
    const kpis = (template?.dashboardKpis || []).map((k) => ({
      key: k.key,
      label: k.label,
      value: values[k.key] ?? "—"
    }));
    return dakinisJsonSuccess(
      {
        dashboard: {
          industry: template?.label || business.type,
          industryKey: template?.key || business.type,
          kpis,
          signals
        }
      },
      business.type,
      dakinisMeta(req)
    );
  }

  if (path === "/api/v1/tenant/benchmark" && req.method === "GET") {
    const signals = await dakinisGatherTenantSignals(business.id, business.type);
    const metrics = dakinisTenantMetricsFromSignals(signals);
    const benchmark = dakinisCompareToSector(business.type, metrics);
    return dakinisJsonSuccess({ benchmark }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/growth-score" && req.method === "GET") {
    const signals = await dakinisGatherTenantSignals(business.id, business.type);
    const growth = dakinisComputeGrowthScore(business, dakinisGrowthSignalsFromTenant(signals));
    return dakinisJsonSuccess({ growth }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/recommendations" && req.method === "GET") {
    const recommendations = dakinisBuildModuleRecommendations(business, {}, {});
    return dakinisJsonSuccess({ recommendations }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/finance/summary" && req.method === "GET") {
    const signals = await dakinisGatherTenantSignals(business.id, business.type);
    const summary = dakinisFinanceSummaryFromSignals(signals);
    return dakinisJsonSuccess({ summary }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/telemetry/feature" && req.method === "POST") {
    let body = {};
    try {
      body = JSON.parse(rawBody || "{}");
    } catch {
      body = {};
    }
    const event = String(body.event || "start");
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;

    if (event === "end" && sessionId) {
      telemetrySessions.delete(sessionId);
      return dakinisJsonSuccess({ telemetry: { ended: true, sessionId } }, business.type, dakinisMeta(req));
    }

    const id = `tel_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    telemetrySessions.set(id, {
      id,
      feature: body.feature || "unknown",
      startedAt: Date.now()
    });
    if (telemetrySessions.size > 500) {
      const oldest = telemetrySessions.keys().next().value;
      if (oldest) telemetrySessions.delete(oldest);
    }
    return dakinisJsonSuccess({ telemetry: { sessionId: id, feature: body.feature } }, business.type, dakinisMeta(req));
  }

  if (path.startsWith("/api/v1/tenant/telemetry/adoption") && req.method === "GET") {
    return dakinisJsonSuccess(
      { adoption: { periodDays: 30, modules: [], score: 0 } },
      business.type,
      dakinisMeta(req)
    );
  }

  return null;
}
