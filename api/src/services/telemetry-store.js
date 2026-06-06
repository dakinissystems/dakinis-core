import { randomUUID } from "node:crypto";
import { dakinisResolveDbDriver } from "../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";
import {
  dakinisComputeAdoptionScores,
  dakinisComputeBusinessValueScores
} from "@dakinis/shared/catalog/telemetry-scores.js";

function dakinisSqlSinceDays(days) {
  return dakinisResolveDbDriver() === "postgres"
    ? `now() - interval '${days} days'`
    : `datetime('now', '-${days} days')`;
}

function num(v) {
  return typeof v === "number" ? v : Number(v) || 0;
}

function dakinisParseMeta(raw) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export async function dakinisStartFeatureSession(businessId, userId, feature, meta = {}) {
  const id = `tel_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const metaJson = JSON.stringify(meta || {});
  try {
    await dakinisRun(
      `INSERT INTO tenant_feature_usage (id, business_id, user_id, feature, meta_json)
       VALUES (?, ?, ?, ?, ?)`,
      [id, businessId, userId || null, feature, metaJson]
    );
    const row = await dakinisQueryOne(`SELECT * FROM tenant_feature_usage WHERE id = ?`, [id]);
    return {
      sessionId: id,
      feature,
      startedAt: row?.started_at || new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export async function dakinisEndFeatureSession(businessId, sessionId) {
  if (!sessionId) return null;
  try {
    const row = await dakinisQueryOne(
      `SELECT * FROM tenant_feature_usage WHERE id = ? AND business_id = ?`,
      [sessionId, businessId]
    );
    if (!row || row.ended_at) {
      return { sessionId, alreadyClosed: true };
    }

    if (dakinisResolveDbDriver() === "postgres") {
      await dakinisRun(
        `UPDATE tenant_feature_usage
         SET ended_at = now(),
             duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (now() - started_at))::INTEGER)
         WHERE id = ? AND business_id = ?`,
        [sessionId, businessId]
      );
    } else {
      await dakinisRun(
        `UPDATE tenant_feature_usage
         SET ended_at = datetime('now'),
             duration_seconds = CASE
               WHEN (julianday(datetime('now')) - julianday(started_at)) * 86400 < 0 THEN 0
               ELSE CAST((julianday(datetime('now')) - julianday(started_at)) * 86400 AS INTEGER)
             END
         WHERE id = ? AND business_id = ?`,
        [sessionId, businessId]
      );
    }

    const updated = await dakinisQueryOne(`SELECT * FROM tenant_feature_usage WHERE id = ?`, [sessionId]);
    return {
      sessionId,
      feature: updated?.feature,
      durationSeconds: num(updated?.duration_seconds),
      endedAt: updated?.ended_at
    };
  } catch {
    return null;
  }
}

export async function dakinisGetAdoptionSummary(businessId, days = 30) {
  const since = dakinisSqlSinceDays(days);
  try {
    const byFeature = await dakinisQueryAll(
      `SELECT feature,
              COUNT(*) AS sessions,
              COUNT(DISTINCT user_id) AS unique_users,
              COALESCE(SUM(duration_seconds), 0) AS total_seconds,
              COALESCE(AVG(duration_seconds), 0) AS avg_seconds,
              SUM(CASE WHEN duration_seconds IS NOT NULL AND duration_seconds < 10 THEN 1 ELSE 0 END) AS bounces
       FROM tenant_feature_usage
       WHERE business_id = ? AND started_at >= ${since}
       GROUP BY feature
       ORDER BY sessions DESC`,
      [businessId]
    );

    const totals = await dakinisQueryOne(
      `SELECT COUNT(*) AS sessions,
              COUNT(DISTINCT user_id) AS unique_users,
              COUNT(DISTINCT feature) AS features_used,
              COALESCE(SUM(duration_seconds), 0) AS total_seconds
       FROM tenant_feature_usage
       WHERE business_id = ? AND started_at >= ${since}`,
      [businessId]
    );

    const openSessions = await dakinisQueryOne(
      `SELECT COUNT(*) AS n FROM tenant_feature_usage
       WHERE business_id = ? AND ended_at IS NULL AND started_at >= ${since}`,
      [businessId]
    );

    return {
      periodDays: days,
      totals: {
        sessions: num(totals?.sessions),
        uniqueUsers: num(totals?.unique_users),
        featuresUsed: num(totals?.features_used),
        totalMinutes: Math.round((num(totals?.total_seconds) / 60) * 10) / 10,
        openSessions: num(openSessions?.n)
      },
      byFeature: (byFeature || []).map((row) => ({
        feature: row.feature,
        sessions: num(row.sessions),
        uniqueUsers: num(row.unique_users),
        totalMinutes: Math.round((num(row.total_seconds) / 60) * 10) / 10,
        avgSeconds: Math.round(num(row.avg_seconds)),
        bounceRatePct:
          num(row.sessions) > 0 ? Math.round((num(row.bounces) / num(row.sessions)) * 1000) / 10 : 0
      }))
    };
  } catch {
    return {
      periodDays: days,
      totals: { sessions: 0, uniqueUsers: 0, featuresUsed: 0, totalMinutes: 0, openSessions: 0 },
      byFeature: []
    };
  }
}

export async function dakinisRecordFeatureEvent(businessId, userId, eventKey, meta = {}) {
  const key = String(eventKey || "").trim();
  if (!key) return null;
  const id = `tev_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  try {
    await dakinisRun(
      `INSERT INTO tenant_feature_events (id, business_id, user_id, event_key, meta_json)
       VALUES (?, ?, ?, ?, ?)`,
      [id, businessId, userId || null, key, JSON.stringify(meta || {})]
    );
    return { id, eventKey: key };
  } catch {
    return null;
  }
}

/** Fire-and-forget — no bloquea operaciones de negocio. */
export function dakinisEmitFeatureEvent(businessId, userId, eventKey, meta = {}) {
  dakinisRecordFeatureEvent(businessId, userId, eventKey, meta).catch(() => {});
}

export async function dakinisGetEventCounts(businessId, days = 30) {
  const since = dakinisSqlSinceDays(days);
  try {
    const rows = await dakinisQueryAll(
      `SELECT event_key, COUNT(*) AS n
       FROM tenant_feature_events
       WHERE business_id = ? AND occurred_at >= ${since}
       GROUP BY event_key`,
      [businessId]
    );
    return Object.fromEntries((rows || []).map((r) => [r.event_key, num(r.n)]));
  } catch {
    return {};
  }
}

export async function dakinisGetTelemetryScores(businessId, days = 30) {
  const adoption = await dakinisGetAdoptionSummary(businessId, days);
  const eventCounts = await dakinisGetEventCounts(businessId, days);
  return {
    periodDays: days,
    adoptionScores: dakinisComputeAdoptionScores(adoption.byFeature, days),
    businessValueScores: dakinisComputeBusinessValueScores(eventCounts, days),
    eventCounts
  };
}

export async function dakinisListRecentFeatureEvents(businessId, limit = 20) {
  try {
    const rows = await dakinisQueryAll(
      `SELECT id, user_id, event_key, occurred_at, meta_json
       FROM tenant_feature_events
       WHERE business_id = ?
       ORDER BY occurred_at DESC
       LIMIT ?`,
      [businessId, limit]
    );
    return (rows || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      eventKey: row.event_key,
      occurredAt: row.occurred_at,
      meta: dakinisParseMeta(row.meta_json)
    }));
  } catch {
    return [];
  }
}

export async function dakinisGetPlatformTelemetrySummary(days = 30) {
  const since = dakinisSqlSinceDays(days);
  try {
    const businesses = await dakinisQueryAll(
      `SELECT id, slug, name, type, plan FROM business WHERE lower(type) != 'platform' ORDER BY name ASC`
    );
    const summaries = [];
    for (const biz of businesses) {
      const sessions = await dakinisQueryOne(
        `SELECT COUNT(*) AS n, COALESCE(SUM(duration_seconds), 0) AS secs
         FROM tenant_feature_usage WHERE business_id = ? AND started_at >= ${since}`,
        [biz.id]
      ).catch(() => ({ n: 0, secs: 0 }));
      const events = await dakinisQueryOne(
        `SELECT COUNT(*) AS n FROM tenant_feature_events WHERE business_id = ? AND occurred_at >= ${since}`,
        [biz.id]
      ).catch(() => ({ n: 0 }));
      const topEvents = await dakinisQueryAll(
        `SELECT event_key, COUNT(*) AS n FROM tenant_feature_events
         WHERE business_id = ? AND occurred_at >= ${since}
         GROUP BY event_key ORDER BY n DESC LIMIT 5`,
        [biz.id]
      ).catch(() => []);
      const scores = await dakinisGetTelemetryScores(biz.id, days);
      summaries.push({
        businessId: biz.id,
        slug: biz.slug,
        name: biz.name,
        type: biz.type,
        plan: biz.plan,
        sessions: num(sessions?.n),
        totalMinutes: Math.round((num(sessions?.secs) / 60) * 10) / 10,
        valueEvents: num(events?.n),
        topEvents: (topEvents || []).map((r) => ({ eventKey: r.event_key, count: num(r.n) })),
        topAdoption: (scores.adoptionScores || []).slice(0, 3),
        topValue: (scores.businessValueScores || []).slice(0, 3)
      });
    }
    return { periodDays: days, tenants: summaries };
  } catch {
    return { periodDays: days, tenants: [] };
  }
}

export async function dakinisListRecentFeatureSessions(businessId, limit = 20) {
  try {
    const rows = await dakinisQueryAll(
      `SELECT id, user_id, feature, started_at, ended_at, duration_seconds, meta_json
       FROM tenant_feature_usage
       WHERE business_id = ?
       ORDER BY started_at DESC
       LIMIT ?`,
      [businessId, limit]
    );
    return (rows || []).map((row) => ({
      sessionId: row.id,
      userId: row.user_id,
      feature: row.feature,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      durationSeconds: row.duration_seconds != null ? num(row.duration_seconds) : null,
      meta: dakinisParseMeta(row.meta_json)
    }));
  } catch {
    return [];
  }
}
