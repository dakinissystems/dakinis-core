-- Telemetría de adopción por tenant (SQLite)

CREATE TABLE IF NOT EXISTS tenant_feature_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT,
  feature TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at TEXT,
  duration_seconds INTEGER,
  meta_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_business
  ON tenant_feature_usage(business_id, started_at);

CREATE INDEX IF NOT EXISTS idx_feature_usage_feature
  ON tenant_feature_usage(business_id, feature, started_at);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user
  ON tenant_feature_usage(business_id, user_id, started_at);
