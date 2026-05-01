export function dakinisCreateDashboardModule(config) {
  function dakinisBuildDashboardMetrics({ appointments, cancellations, revenue, leads }) {
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
    dakinisBuildDashboardMetrics
  };
}
