export function dakinisCreateDashboardModule(config) {
  /** KPIs del día en formato legible (ingresos, citas, conversión de leads). */
  function dakinisSummarizeDashboardKpis({ appointments, cancellations, revenue, leads }) {
    const conversionRate = leads.total > 0 ? (leads.closed / leads.total) * 100 : 0;
    return {
      appointmentsToday: appointments,
      cancellationsToday: cancellations,
      estimatedRevenue: `${revenue} ${config.dashboard.currency}`,
      leadConversionRate: config.dashboard.includeLeadConversion
        ? `${conversionRate.toFixed(1)}%`
        : "disabled"
    };
  }

  return {
    dakinisSummarizeDashboardKpis
  };
}
