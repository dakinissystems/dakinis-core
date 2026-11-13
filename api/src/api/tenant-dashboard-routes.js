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
    stockAlerts: signals.stockAlerts ?? 0
  };
}

function dakinisDashboardKpiValues(businessType, signals) {
  const open = signals.openOrders ?? 0;
  const alerts = signals.stockAlerts ?? 0;
  const crm = signals.crmContacts ?? 0;

  const byType = {
    restaurante: {
      mesas_ocupadas: "Datos no disponibles",
      ventas_hoy: "Datos no disponibles",
      comandas_abiertas: String(open),
      stock_alertas: String(alerts)
    },
    clinica: {
      pacientes_hoy: "Datos no disponibles",
      citas_pendientes: "Datos no disponibles",
      no_show_semana: "Datos no disponibles",
      ingresos_estimados: "Datos no disponibles"
    },
    peluqueria: {
      citas_hoy: "Datos no disponibles",
      sillas_ocupadas: "Datos no disponibles",
      reservas_online: "Datos no disponibles",
      clientes_recurrentes: "Datos no disponibles"
    },
    inmobiliaria: {
      leads_activos: String(crm),
      visitas_hoy: "Datos no disponibles",
      propuestas_abiertas: "Datos no disponibles",
      cierres_mes: "Datos no disponibles"
    }
  };

  return byType[businessType] || {
    contactos: String(crm),
    actividad_7d: String(act),
    alertas: String(alerts)
  };
}

function dakinisFinanceSummaryFromSignals() {
  return {
    available: false,
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
    const growth = dakinisComputeGrowthScore(business, {});
    return dakinisJsonSuccess(
      { growth: growth.factors?.length ? growth : null },
      business.type,
      dakinisMeta(req)
    );
  }

  if (path === "/api/v1/tenant/recommendations" && req.method === "GET") {
    const recommendations = dakinisBuildModuleRecommendations(business, {}, {});
    return dakinisJsonSuccess({ recommendations }, business.type, dakinisMeta(req));
  }

  if (path === "/api/v1/tenant/finance/summary" && req.method === "GET") {
    const summary = dakinisFinanceSummaryFromSignals();
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
