import { randomUUID } from "node:crypto";
import { dakinisResolveDbDriver } from "../db/dialect.js";
import { dakinisQueryAll, dakinisQueryOne, dakinisRun } from "../db/query.js";

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
