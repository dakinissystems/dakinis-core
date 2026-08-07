import { randomUUID } from "node:crypto";
import { dakinisSqlTimestampNow } from "../../../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../../db/query.js";
import { dakinisDeliveryTelemetryRecord } from "./DeliveryTelemetry.js";
import { dakinisProviderResilience } from "./DeliveryProvider.js";
import { dakinisGetDeliveryProvider } from "./providers/index.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

/** Estados de cola (API estable). Interno: pending|running|retry|failed|completed|cancelled */
export const DAKINIS_DELIVERY_JOB_STATUSES = Object.freeze({
  pending: "pending",
  running: "running",
  retry: "retry",
  failed: "failed",
  completed: "completed",
  cancelled: "cancelled"
});

const MAX_ATTEMPTS_DEFAULT = 5;
/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const timers = new Map();
/** @type {Map<string, number>} next run epoch ms */
const nextRunAt = new Map();

/**
 * Cola ligera de jobs delivery (persistida en tenant_delivery_jobs).
 * Usa dialect now()/datetime('now') según driver.
 * Dead Letter: status=failed tras agotar retries (DLQ lógica).
 */
export async function dakinisEnqueueDeliveryJob(businessId, provider, jobType, payload) {
  const id = dakinisNewId("djob");
  const now = dakinisSqlTimestampNow();
  await dakinisRun(
    `INSERT INTO tenant_delivery_jobs
      (id, business_id, provider, job_type, payload_json, status, attempts, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'pending', 0, ${now}, ${now})`,
    [id, businessId, provider, jobType, JSON.stringify(payload || {})]
  );
  dakinisScheduleJob(id, 0);
  return id;
}

function dakinisScheduleJob(jobId, delayMs) {
  if (timers.has(jobId)) clearTimeout(timers.get(jobId));
  if (delayMs > 0) nextRunAt.set(jobId, Date.now() + delayMs);
  else nextRunAt.delete(jobId);
  const t = setTimeout(() => {
    timers.delete(jobId);
    nextRunAt.delete(jobId);
    dakinisProcessDeliveryJob(jobId).catch((err) => {
      console.warn("[delivery:queue]", jobId, err?.message || err);
    });
  }, delayMs);
  timers.set(jobId, t);
}

function dakinisMaxAttemptsForProvider(providerId) {
  const provider = dakinisGetDeliveryProvider(providerId);
  if (!provider) return MAX_ATTEMPTS_DEFAULT;
  return dakinisProviderResilience(provider).retries || MAX_ATTEMPTS_DEFAULT;
}

/**
 * @param {string} jobId
 * @param {(job: object) => Promise<void>} [handler]
 */
export async function dakinisProcessDeliveryJob(jobId, handler) {
  const row = await dakinisQueryOne(`SELECT * FROM tenant_delivery_jobs WHERE id = ?`, [jobId]);
  if (!row || row.status === "completed" || row.status === "done" || row.status === "cancelled") return;

  let payload = {};
  try {
    payload = JSON.parse(row.payload_json || "{}");
  } catch {
    payload = {};
  }

  const attempts = Number(row.attempts) || 0;
  const now = dakinisSqlTimestampNow();
  await dakinisRun(
    `UPDATE tenant_delivery_jobs SET status = 'running', attempts = ?, updated_at = ${now} WHERE id = ?`,
    [attempts + 1, jobId]
  );

  try {
    if (typeof handler === "function") {
      await handler({ ...row, payload, attempts: attempts + 1 });
    } else {
      const { dakinisRunDeliveryJob } = await import("./DeliveryService.js");
      await dakinisRunDeliveryJob({ ...row, payload, attempts: attempts + 1 });
    }
    await dakinisRun(
      `UPDATE tenant_delivery_jobs SET status = 'completed', last_error = NULL, updated_at = ${now} WHERE id = ?`,
      [jobId]
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const nextAttempts = attempts + 1;
    const maxAttempts = dakinisMaxAttemptsForProvider(row.provider);
    dakinisDeliveryTelemetryRecord(row.provider, "retry");

    if (nextAttempts >= maxAttempts) {
      // Dead Letter Queue (persistida como failed)
      await dakinisRun(
        `UPDATE tenant_delivery_jobs SET status = 'failed', last_error = ?, updated_at = ${now} WHERE id = ?`,
        [msg.slice(0, 500), jobId]
      );
      dakinisDeliveryTelemetryRecord(row.provider, "failure");
      return;
    }

    const backoff = Math.min(60_000, 1000 * 2 ** nextAttempts);
    await dakinisRun(
      `UPDATE tenant_delivery_jobs SET status = 'retry', last_error = ?, updated_at = ${now} WHERE id = ?`,
      [msg.slice(0, 500), jobId]
    );
    dakinisScheduleJob(jobId, backoff);
  }
}

/**
 * Lista jobs + contadores por estado + hint de retry.
 */
export async function dakinisListDeliveryJobs(businessId, limit = 40) {
  const rows = await dakinisQueryAll(
    `SELECT id, provider, job_type, status, attempts, last_error, created_at, updated_at
     FROM tenant_delivery_jobs WHERE business_id = ?
     ORDER BY created_at DESC LIMIT ?`,
    [businessId, limit]
  );

  const counts = {
    pending: 0,
    running: 0,
    retry: 0,
    failed: 0,
    completed: 0,
    cancelled: 0
  };

  const jobs = rows.map((row) => {
    let status = String(row.status || "pending");
    if (status === "done") status = "completed";
    if (counts[status] !== undefined) counts[status] += 1;
    else counts.pending += 1;

    const attempts = Number(row.attempts) || 0;
    const waitingMs = nextRunAt.has(row.id) ? Math.max(0, nextRunAt.get(row.id) - Date.now()) : null;
    const maxAttempts = dakinisMaxAttemptsForProvider(row.provider);

    return {
      id: row.id,
      provider: row.provider,
      job_type: row.job_type,
      status,
      attempts,
      maxAttempts,
      retryLabel: status === "retry" ? `Retry #${attempts}` : null,
      waitingMs,
      waitingLabel: waitingMs != null ? `Waiting ${Math.ceil(waitingMs / 1000)}s` : null,
      last_error: row.last_error,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  });

  return { jobs, counts };
}
