/** Capability → lazy module id (aligns with @dakinis/shared-platform product-capabilities). */
export const MODULES = Object.freeze({
  dashboard: { id: "dashboard", capability: "hub", path: "/app/dashboard" },
  crm: { id: "crm", capability: "crm", path: "/app/crm" },
  sales: { id: "sales", capability: "sales", path: "/app/ventas" },
  inventory: { id: "inventory", capability: "inventory", path: "/app/inventario" },
  reports: { id: "reports", capability: "reports", path: "/app/reportes" },
  whatsapp: { id: "whatsapp", capability: "whatsapp", path: "/app/whatsapp" },
  settings: { id: "settings", capability: null, path: "/app/settings" },
});

export function resolveModule(id) {
  return MODULES[id] || null;
}

export default MODULES;
