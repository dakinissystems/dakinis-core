-- Tenant intelligence: sucursales, overrides de módulos, webhooks API keys

CREATE TABLE IF NOT EXISTS tenant_branches (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Madrid',
  is_default INTEGER NOT NULL DEFAULT 0,
  settings_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, slug),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_branches_business ON tenant_branches(business_id);

CREATE TABLE IF NOT EXISTS tenant_module_overrides (
  business_id TEXT NOT NULL,
  module_key TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  installed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (business_id, module_key),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE TABLE IF NOT EXISTS tenant_api_key_webhooks (
  id TEXT PRIMARY KEY,
  api_key_value TEXT NOT NULL,
  business_id TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  events_json TEXT NOT NULL DEFAULT '[]',
  secret TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (api_key_value) REFERENCES tenant_api_keys(key_value)
);
CREATE INDEX IF NOT EXISTS idx_webhooks_business ON tenant_api_key_webhooks(business_id);
