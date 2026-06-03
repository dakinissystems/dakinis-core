CREATE TABLE IF NOT EXISTS tenant_crm_companies (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  vat_number TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_crm_companies_business ON tenant_crm_companies(business_id);

CREATE TABLE IF NOT EXISTS tenant_crm_contacts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  company_id TEXT,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (company_id) REFERENCES tenant_crm_companies(id)
);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_business ON tenant_crm_contacts(business_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_phone ON tenant_crm_contacts(business_id, phone);

CREATE TABLE IF NOT EXISTS tenant_crm_activities (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  type TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (contact_id) REFERENCES tenant_crm_contacts(id)
);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON tenant_crm_activities(contact_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tenant_whatsapp_conversations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  peer_phone TEXT NOT NULL,
  last_message_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, peer_phone),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (contact_id) REFERENCES tenant_crm_contacts(id)
);
CREATE INDEX IF NOT EXISTS idx_wa_conv_contact ON tenant_whatsapp_conversations(contact_id);
