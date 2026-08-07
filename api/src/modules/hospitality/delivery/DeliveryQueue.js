import { randomUUID } from "node:crypto";
import { dakinisSqlTimestampNow } from "../../../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../../../db/query.js";

function dakinisNewId(prefix) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

const MAX_ATTEMPTS = 5;
/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const timers = new Map();

/**
 * Cola ligera de jobs delivery (persistida en tenant_delivery_jobs).
 * Usa dialect now()/datetime('now') según driver.
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
  const t = setTimeout(() => {
    timers.delete(jobId);
    dakinisProcessDeliveryJob(jobId).catch((err) => {
      console.warn("[delivery:queue]", jobId, err?.message || err);
    });
  }, delayMs);
  timers.set(jobId, t);
}

/**
 * @param {string} jobId
 * @param {(job: object) => Promise<void>} [handler]
 */
export async function dakinisProcessDeliveryJob(jobId, handler) {
  const row = await dakinisQueryOne(`SELECT * FROM tenant_delivery_jobs WHERE id = ?`, [jobId]);
  if (!row || row.status === "done" || row.status === "cancelled") return;

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
      `UPDATE tenant_delivery_jobs SET status = 'done', last_error = NULL, updated_at = ${now} WHERE id = ?`,
      [jobId]
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const nextAttempts = attempts + 1;
    if (nextAttempts >= MAX_ATTEMPTS) {
      await dakinisRun(
        `UPDATE tenant_delivery_jobs SET status = 'failed', last_error = ?, updated_at = ${now} WHERE id = ?`,
        [msg.slice(0, 500), jobId]
      );
      return;
    }
    await dakinisRun(
      `UPDATE tenant_delivery_jobs SET status = 'pending', last_error = ?, updated_at = ${now} WHERE id = ?`,
      [msg.slice(0, 500), jobId]
    );
    const backoff = Math.min(60_000, 1000 * 2 ** nextAttempts);
    dakinisScheduleJob(jobId, backoff);
  }
}

export async function dakinisListDeliveryJobs(businessId, limit = 40) {
  const rows = await dakinisQueryAll(
    `SELECT id, provider, job_type, status, attempts, last_error, created_at, updated_at
     FROM tenant_delivery_jobs WHERE business_id = ?
     ORDER BY created_at DESC LIMIT ?`,
    [businessId, limit]
  );
  return rows;
}
