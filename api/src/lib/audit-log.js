import { randomUUID } from "node:crypto";
import { dakinisStructuredLog } from "../api/structured-logger.js";
import { dakinisGetDbDriver } from "../db/index.js";
import { dakinisRun } from "../db/query.js";

/**
 * Auditoría — logs JSON + tabla tenant_audit_logs (Postgres).
 * @param {object} entry
 */
export async function dakinisAuditLog(entry) {
  const row = {
    ...entry,
    ts: new Date().toISOString()
  };
  dakinisStructuredLog({ level: "info", msg: "audit", ...row });

  if (dakinisGetDbDriver() !== "postgres") return;

  try {
    await dakinisRun(
      `INSERT INTO tenant_audit_logs (id, business_id, actor_user_id, action, resource_type, resource_id, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        `aud_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
        entry.tenantId || entry.businessId || null,
        entry.userId || entry.actorUserId || null,
        String(entry.action || "unknown"),
        entry.resourceType || null,
        entry.resourceId || null,
        JSON.stringify(entry)
      ]
    );
  } catch (err) {
    console.warn("[audit] persist skipped:", err instanceof Error ? err.message : err);
  }
}
