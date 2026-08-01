import { dakinisQueryOne } from "../db/query.js";
import {
  dakinisIsResendConfigured,
  dakinisOpsAlertEmailHtml,
  dakinisSendResendEmail
} from "../adapters/email/resend-mail.js";

const DEDUPE_HOURS = 6;

export function dakinisOpsAlertEmailTo() {
  return (
    String(process.env.DAKINIS_OPS_ALERT_EMAIL || "").trim() || "dakinissystems@gmail.com"
  );
}

export function dakinisShouldNotifyOpsAlert({ severity, productRef }) {
  const sev = String(severity || "").toLowerCase();
  const ref = String(productRef || "");
  return sev === "critical" || ref.startsWith("system:load-error:");
}

/**
 * Envía email a ops (Resend) si la alerta es crítica / error de carga.
 * Deduplica por negocio + product_ref en ventana de 6h.
 * El hub admin lee las filas de tenant_supply_alerts (no depende de Resend).
 */
export async function dakinisNotifyOpsOfSupplyAlert({ business, alert }) {
  if (!business || !alert) return { emailed: false, reason: "missing" };
  if (!dakinisShouldNotifyOpsAlert(alert)) return { emailed: false, reason: "skip_severity" };

  const since = new Date(Date.now() - DEDUPE_HOURS * 3600 * 1000).toISOString();
  try {
    const prior = await dakinisQueryOne(
      `SELECT id FROM tenant_supply_alerts
        WHERE business_id = ? AND product_ref = ? AND id != ? AND created_at >= ?
        LIMIT 1`,
      [business.id, alert.productRef || "", alert.id, since]
    );
    if (prior) return { emailed: false, reason: "deduped" };
  } catch {
    // Continuar: mejor un email de más que silenciar un fallo de carga.
  }

  if (!dakinisIsResendConfigured()) {
    return { emailed: false, reason: "resend_not_configured" };
  }

  const to = dakinisOpsAlertEmailTo();
  const subject = `[Dakinis] ${alert.severity?.toUpperCase() || "ALERT"} · ${business.slug || business.name}: ${alert.title}`;
  const html = dakinisOpsAlertEmailHtml({
    title: alert.title,
    businessName: business.name,
    businessSlug: business.slug,
    productRef: alert.productRef,
    condition: alert.condition,
    severity: alert.severity
  });
  const text = [
    alert.title,
    `Negocio: ${business.name} (${business.slug})`,
    `Severidad: ${alert.severity}`,
    `Ref: ${alert.productRef || "—"}`,
    "",
    alert.condition
  ].join("\n");

  const result = await dakinisSendResendEmail({ to, subject, html, text });
  return { emailed: Boolean(result?.ok), reason: result?.ok ? "sent" : result?.error || "send_failed" };
}
