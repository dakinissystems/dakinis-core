-- SQLite schema (MVP multi-tenant). Migrable a PostgreSQL con los mismos campos.

CREATE TABLE IF NOT EXISTS business (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  config_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tenant_api_keys (
  key_value TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('full-access', 'read-only')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_business ON tenant_api_keys(business_id);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  totp_secret TEXT,
  totp_enabled INTEGER NOT NULL DEFAULT 0,
  platform_user_id TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (email),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id);

CREATE TABLE IF NOT EXISTS tenant_records (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  entity TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_records_business_entity ON tenant_records(business_id, entity);

CREATE TABLE IF NOT EXISTS tenant_supply_deliveries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  supplier TEXT NOT NULL,
  arrival_window TEXT NOT NULL,
  contents TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Programado',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_supply_deliveries_business ON tenant_supply_deliveries(business_id);

CREATE TABLE IF NOT EXISTS tenant_supply_alerts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  title TEXT NOT NULL,
  product_ref TEXT NOT NULL DEFAULT '',
  condition_text TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_supply_alerts_business ON tenant_supply_alerts(business_id);

-- Restaurante: stock, recetas, producción y cartel QR de alergias
CREATE TABLE IF NOT EXISTS tenant_stock_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'u',
  quantity REAL NOT NULL DEFAULT 0,
  min_quantity REAL NOT NULL DEFAULT 0,
  barcode TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, slug),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_items_business ON tenant_stock_items(business_id);

CREATE TABLE IF NOT EXISTS tenant_recipes (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  output_label TEXT NOT NULL DEFAULT '',
  output_quantity REAL NOT NULL DEFAULT 1,
  output_unit TEXT NOT NULL DEFAULT 'u',
  lines_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, slug),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_recipes_business ON tenant_recipes(business_id);

CREATE TABLE IF NOT EXISTS tenant_production_batches (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  plan_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_production_batches_business ON tenant_production_batches(business_id);

CREATE TABLE IF NOT EXISTS tenant_stock_movements (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  stock_item_id TEXT NOT NULL,
  delta REAL NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  reference_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (stock_item_id) REFERENCES tenant_stock_items(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON tenant_stock_movements(business_id);

CREATE TABLE IF NOT EXISTS tenant_restaurant_profile (
  business_id TEXT PRIMARY KEY,
  public_token TEXT UNIQUE NOT NULL,
  venue_name TEXT NOT NULL DEFAULT '',
  allergies_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE TABLE IF NOT EXISTS platform_kv (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- WhatsApp Business API (Fase 3)
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
