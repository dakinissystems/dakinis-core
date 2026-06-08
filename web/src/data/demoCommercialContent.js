/** Datos estáticos para demos comerciales por vertical (4 activas). */
export const DAKINIS_DEMO_VERTICALS = ["restaurante", "clinica", "peluqueria", "inmobiliaria"];

export function dakinisGetDemoCommercialMetrics(verticalKey) {
  const metrics = {
    restaurante: {
      monthSales: "€18.420",
      newClients: 47,
      topProduct: "Bites cheddar",
      estimatedProfit: "€4.280",
      alerts: [
        { severity: "warning", text: "Stock bajo: jalapeños (caduca en 3 días)" },
        { severity: "info", text: "12 reservas sin confirmar para el viernes" }
      ]
    },
    clinica: {
      monthSales: "€12.850",
      newClients: 23,
      topProduct: "Botox cabina 2",
      estimatedProfit: "€5.120",
      alerts: [
        { severity: "warning", text: "6 citas sin confirmar mañana" },
        { severity: "info", text: "Lote toxina bajo mínimo" }
      ]
    },
    peluqueria: {
      monthSales: "€9.640",
      newClients: 31,
      topProduct: "Color + corte",
      estimatedProfit: "€3.890",
      alerts: [
        { severity: "warning", text: "4 ausencias esta semana — activar recordatorio WA" },
        { severity: "info", text: "Tinte nº6: reposición en 5 días" }
      ]
    },
    inmobiliaria: {
      monthSales: "€24.000",
      newClients: 18,
      topProduct: "Piso centro 3 hab.",
      estimatedProfit: "€8.400",
      alerts: [
        { severity: "warning", text: "3 leads sin seguimiento > 48 h" },
        { severity: "info", text: "2 visitas pendientes de confirmar" }
      ]
    }
  };
  return metrics[verticalKey] || metrics.clinica;
}
