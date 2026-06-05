-- Dakinis BOS (SQLite)

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  business_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TEXT,
  current_period_end TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE TABLE IF NOT EXISTS tenant_invoices (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'draft',
  line_items_json TEXT NOT NULL DEFAULT '[]',
  period_start TEXT,
  period_end TEXT,
  stripe_invoice_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_invoices_business ON tenant_invoices(business_id, created_at);

CREATE TABLE IF NOT EXISTS tenant_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'count',
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_usage_business_metric ON tenant_usage(business_id, metric_key, recorded_at);

CREATE TABLE IF NOT EXISTS tenant_ai_usage_log (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'heuristic',
  question_hash TEXT NOT NULL DEFAULT '',
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cost_eur REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_ai_usage_business ON tenant_ai_usage_log(business_id, created_at);

CREATE TABLE IF NOT EXISTS tenant_pending_actions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  label TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  executed_at TEXT,
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_pending_actions_business ON tenant_pending_actions(business_id, status);

CREATE TABLE IF NOT EXISTS tenant_automation_rules (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  action_type TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_automation_business ON tenant_automation_rules(business_id, event_type);

CREATE TABLE IF NOT EXISTS tenant_network_orders (
  id TEXT PRIMARY KEY,
  from_business_id TEXT NOT NULL,
  to_business_id TEXT NOT NULL,
  link_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  lines_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (from_business_id) REFERENCES business(id),
  FOREIGN KEY (to_business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_network_orders_from ON tenant_network_orders(from_business_id);
CREATE INDEX IF NOT EXISTS idx_network_orders_to ON tenant_network_orders(to_business_id);

CREATE TABLE IF NOT EXISTS tenant_portal_settings (
  business_id TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  subdomain TEXT NOT NULL DEFAULT '',
  features_json TEXT NOT NULL DEFAULT '[]',
  welcome_text TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE TABLE IF NOT EXISTS tenant_knowledge_chunks (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  doc_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  content_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_doc ON tenant_knowledge_chunks(doc_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_business ON tenant_knowledge_chunks(business_id);
