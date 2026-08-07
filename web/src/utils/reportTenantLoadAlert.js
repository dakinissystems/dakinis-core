import { dakinisTenantJsonFetch } from "../services/api.js";

const reportedKeys = new Set();

/**
 * Crea una alerta de suministro cuando falla la carga de datos del tenant.
 * Deduplica por sesión (mismo módulo + mensaje).
 */
export async function dakinisReportTenantLoadAlert({
  apiSession,
  businessId,
  businessTypeHeader,
  moduleKey,
  moduleLabel,
  errorMessage
}) {
  if (!apiSession?.token || !businessId) return;
  const msg = String(errorMessage || "").trim();
  if (!msg) return;
  if (/429|rate.?limit|demasiadas solicit/i.test(msg)) return;

  const key = `${businessId}:${moduleKey}:${msg}`;
  if (reportedKeys.has(key)) return;
  reportedKeys.add(key);

  try {
    await dakinisTenantJsonFetch("/api/tenant/supply/alerts", apiSession, {
      businessId,
      businessTypeHeader,
      method: "POST",
      body: {
        title: `Error al cargar ${moduleLabel}`,
        productRef: `system:load-error:${moduleKey}`,
        condition: msg.slice(0, 500),
        severity: "critical"
      }
    });
  } catch {
    // No bloquear la UI si la alerta no se puede crear.
  }
}
