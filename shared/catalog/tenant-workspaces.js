/** Áreas de trabajo con dashboards dedicados. */
export const DAKINIS_TENANT_WORKSPACES = Object.freeze({
  operations: {
    key: "operations",
    label: "Operaciones",
    icon: "ops",
    kpiKeys: ["comandas_abiertas", "stock_alertas", "citas_hoy", "ordenes_abiertas"],
    routes: ["/app/dashboard", "/sistema/restaurante"]
  },
  marketing: {
    key: "marketing",
    label: "Marketing",
    icon: "marketing",
    kpiKeys: ["clientes_recurrentes", "leads_activos", "conversion"],
    routes: ["/app/crm", "/app/whatsapp"]
  },
  finance: {
    key: "finance",
    label: "Finanzas",
    icon: "finance",
    kpiKeys: ["ventas_hoy", "ingresos_mes", "margen"],
    routes: ["/api/v1/tenant/finance/summary"]
  },
  hr: {
    key: "hr",
    label: "RRHH",
    icon: "hr",
    kpiKeys: ["team_size"],
    routes: ["/api/tenant/users"]
  }
});

export function dakinisGetWorkspaceCatalog() {
  return Object.values(DAKINIS_TENANT_WORKSPACES);
}

export function dakinisFilterKpisForWorkspace(workspaceKey, kpis = []) {
  const ws = DAKINIS_TENANT_WORKSPACES[workspaceKey];
  if (!ws) return kpis;
  const set = new Set(ws.kpiKeys);
  const filtered = kpis.filter((k) => set.has(k.key));
  return filtered.length ? filtered : kpis.slice(0, 4);
}
