import { DAKINIS_CORE_INDUSTRY_KEYS } from "./business-templates.js";

/** Medias sectoriales de referencia (actualizables vía platform_kv en producción). */
const DAKINIS_SECTOR_BENCHMARK_DEFAULTS = {
  restaurante: {
    ventas_mes_delta_pct: 5,
    ocupacion_pct: 62,
    comandas_dia: 28,
    stock_alertas: 2,
    crm_contacts: 120
  },
  clinica: {
    citas_semana: 45,
    no_show_pct: 8,
    crm_contacts: 200,
    ventas_mes_delta_pct: 4
  },
  peluqueria: {
    citas_semana: 55,
    clientes_recurrentes_pct: 38,
    crm_contacts: 150,
    ventas_mes_delta_pct: 6
  },
  inmobiliaria: {
    leads_activos: 35,
    visitas_semana: 12,
    cierre_pct: 14,
    ventas_mes_delta_pct: 3
  },
  retail: {
    ticket_medio: 42,
    ventas_mes_delta_pct: 7,
    crm_contacts: 300
  },
  hotel: {
    ocupacion_pct: 68,
    ventas_mes_delta_pct: 5,
    crm_contacts: 80
  },
  default: {
    ventas_mes_delta_pct: 5,
    crm_contacts: 50,
    reservas_semana: 20,
    ocupacion_pct: 55
  }
};

export function dakinisGetSectorBenchmarks(industryKey) {
  const key = String(industryKey || "").toLowerCase();
  if (DAKINIS_SECTOR_BENCHMARK_DEFAULTS[key]) {
    return { ...DAKINIS_SECTOR_BENCHMARK_DEFAULTS.default, ...DAKINIS_SECTOR_BENCHMARK_DEFAULTS[key] };
  }
  return { ...DAKINIS_SECTOR_BENCHMARK_DEFAULTS.default };
}

/**
 * Compara métricas del tenant vs media sectorial.
 * @param {string} industryKey
 * @param {Record<string, number>} tenantMetrics
 */
export function dakinisCompareToSector(industryKey, tenantMetrics = {}) {
  const sector = dakinisGetSectorBenchmarks(industryKey);
  const comparisons = [];

  const add = (key, tenantValue, sectorValue, label, unit = "") => {
    if (sectorValue === undefined || sectorValue === null) return;
    const tv = Number(tenantValue) || 0;
    const sv = Number(sectorValue) || 0;
    const delta = sv === 0 ? (tv > 0 ? 100 : 0) : ((tv - sv) / sv) * 100;
    comparisons.push({
      key,
      label,
      tenantValue: tv,
      sectorAverage: sv,
      unit,
      deltaPct: Math.round(delta * 10) / 10,
      narrative:
        delta > 5
          ? `${Math.abs(Math.round(delta))}% superior a la media del sector`
          : delta < -5
            ? `${Math.abs(Math.round(delta))}% por debajo de la media del sector`
            : "En línea con la media del sector"
    });
  };

  add("ventas_mes_delta_pct", tenantMetrics.salesMonthDeltaPct, sector.ventas_mes_delta_pct, "Crecimiento ventas", "%");
  add("ocupacion_pct", tenantMetrics.occupancyPct, sector.ocupacion_pct, "Ocupación", "%");
  add("crm_contacts", tenantMetrics.crmContacts, sector.crm_contacts, "Contactos CRM");
  add("citas_semana", tenantMetrics.reservations7d, sector.citas_semana, "Citas / reservas (7 días)");
  add("leads_activos", tenantMetrics.crmContacts, sector.leads_activos, "Leads activos");

  const highlights = comparisons
    .filter((c) => Math.abs(c.deltaPct) >= 8)
    .sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
    .slice(0, 3);

  return {
    industry: industryKey,
    sectorSampleLabel: `Media referencia sector ${industryKey || "general"}`,
    comparisons,
    highlights,
    supportedIndustries: DAKINIS_CORE_INDUSTRY_KEYS
  };
}
