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

-- Hospitality Fase 1: carta y mesas fuera de config_json
CREATE TABLE IF NOT EXISTS tenant_menu_categories (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON tenant_menu_categories(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  category_id TEXT,
  name TEXT NOT NULL,
  name_es TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  station TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (category_id) REFERENCES tenant_menu_categories(id)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_business ON tenant_menu_items(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_prices (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'salon',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  UNIQUE (business_id, item_id, channel),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (item_id) REFERENCES tenant_menu_items(id)
);

CREATE INDEX IF NOT EXISTS idx_menu_prices_business ON tenant_menu_prices(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_modifiers (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  allergen_tags_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_menu_modifiers_business ON tenant_menu_modifiers(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_item_modifiers (
  item_id TEXT NOT NULL,
  modifier_id TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 0,
  max_qty INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (item_id, modifier_id),
  FOREIGN KEY (item_id) REFERENCES tenant_menu_items(id),
  FOREIGN KEY (modifier_id) REFERENCES tenant_menu_modifiers(id)
);

CREATE TABLE IF NOT EXISTS tenant_tables (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  zone TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL,
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0,
  seats INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'libre',
  meta_json TEXT NOT NULL DEFAULT '{}',
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_tables_business ON tenant_tables(business_id);

CREATE TABLE IF NOT EXISTS tenant_table_sessions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  table_id TEXT NOT NULL,
  opened_at TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at TEXT,
  cart_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  waiter_user_id TEXT,
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (table_id) REFERENCES tenant_tables(id)
);

CREATE INDEX IF NOT EXISTS idx_table_sessions_business ON tenant_table_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_open ON tenant_table_sessions(business_id, table_id, closed_at);

-- Hospitality: tarifas por canal + integraciones delivery
CREATE TABLE IF NOT EXISTS tenant_price_lists (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT '',
  is_default INTEGER NOT NULL DEFAULT 0,
  markup_pct REAL,
  markup_fixed_cents INTEGER,
  round_to_cents INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE (business_id, key),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_price_lists_business ON tenant_price_lists(business_id);

CREATE TABLE IF NOT EXISTS tenant_price_list_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  price_list_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  UNIQUE (price_list_id, item_id),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (price_list_id) REFERENCES tenant_price_lists(id),
  FOREIGN KEY (item_id) REFERENCES tenant_menu_items(id)
);

CREATE INDEX IF NOT EXISTS idx_price_list_items_business ON tenant_price_list_items(business_id);

CREATE TABLE IF NOT EXISTS tenant_delivery_integrations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  api_key TEXT,
  refresh_token TEXT,
  store_id TEXT,
  location TEXT,
  webhook_secret TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_sync_at TEXT,
  last_error TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE (business_id, provider),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_delivery_integrations_business ON tenant_delivery_integrations(business_id);

CREATE TABLE IF NOT EXISTS tenant_delivery_jobs (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  job_type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_delivery_jobs_business ON tenant_delivery_jobs(business_id, status);

CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT,
  usage_type TEXT NOT NULL DEFAULT 'advisor',
  year_month TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_business_month ON ai_usage(business_id, usage_type, year_month);

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

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  business_id TEXT PRIMARY KEY,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TEXT,
  current_period_end TEXT,
  entitled_plan TEXT,
  access_state TEXT NOT NULL DEFAULT 'active',
  access_reason TEXT,
  access_note TEXT,
  closed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (business_id) REFERENCES business(id)
);
