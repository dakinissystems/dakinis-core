CREATE TABLE IF NOT EXISTS tenant_whatsapp_contacts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  display_name TEXT,
  wa_profile_name TEXT,
  last_seen_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, phone),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_wa_contacts_business ON tenant_whatsapp_contacts(business_id);

CREATE TABLE IF NOT EXISTS tenant_whatsapp_messages (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  wamid TEXT,
  peer_phone TEXT NOT NULL,
  body_text TEXT,
  msg_type TEXT NOT NULL DEFAULT 'text',
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
CREATE INDEX IF NOT EXISTS idx_wa_messages_business_created
  ON tenant_whatsapp_messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_peer
  ON tenant_whatsapp_messages(business_id, peer_phone, created_at DESC);
