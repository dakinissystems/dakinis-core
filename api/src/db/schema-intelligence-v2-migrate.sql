-- Intelligence v2 + CRM deals (SQLite)

CREATE TABLE IF NOT EXISTS tenant_crm_deals (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  contact_id TEXT,
  company_id TEXT,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead',
  value_amount REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  expected_close TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_crm_deals_business ON tenant_crm_deals(business_id, stage);

CREATE TABLE IF NOT EXISTS tenant_goals (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  branch_id TEXT,
  goal_key TEXT NOT NULL,
  label TEXT NOT NULL,
  target_value REAL NOT NULL,
  current_value REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT 'monthly',
  period_start TEXT,
  period_end TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_goals_business ON tenant_goals(business_id, period);

CREATE TABLE IF NOT EXISTS tenant_finance_entries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  branch_id TEXT,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT NOT NULL DEFAULT '',
  occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_finance_business ON tenant_finance_entries(business_id, occurred_at);

CREATE TABLE IF NOT EXISTS tenant_knowledge_docs (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  doc_kind TEXT NOT NULL DEFAULT 'process',
  content_text TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_kb_business ON tenant_knowledge_docs(business_id);

CREATE TABLE IF NOT EXISTS tenant_module_usage (
  business_id TEXT NOT NULL,
  module_key TEXT NOT NULL,
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TEXT,
  PRIMARY KEY (business_id, module_key),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE TABLE IF NOT EXISTS tenant_network_links (
  id TEXT PRIMARY KEY,
  from_business_id TEXT NOT NULL,
  to_business_id TEXT NOT NULL,
  link_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (from_business_id) REFERENCES business(id),
  FOREIGN KEY (to_business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_network_from ON tenant_network_links(from_business_id);
CREATE INDEX IF NOT EXISTS idx_network_to ON tenant_network_links(to_business_id);
