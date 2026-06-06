-- Eventos de valor por tenant (SQLite)

CREATE TABLE IF NOT EXISTS tenant_feature_events (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT,
  event_key TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
  meta_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_feature_events_business
  ON tenant_feature_events(business_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_feature_events_key
  ON tenant_feature_events(business_id, event_key, occurred_at);
