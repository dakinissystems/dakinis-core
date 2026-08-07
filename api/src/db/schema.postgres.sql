-- PostgreSQL schema for Dakinis Core (dakinis_core). Multi-tenant with tenant_id on rows.

CREATE SCHEMA IF NOT EXISTS dakinis_core;

SET search_path TO dakinis_core, public;

CREATE TABLE IF NOT EXISTS business (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  config_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_api_keys (
  key_value TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  role TEXT NOT NULL CHECK (role IN ('full-access', 'read-only'))
);

CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_business ON tenant_api_keys(business_id);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  totp_secret TEXT,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  platform_user_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_business ON users(business_id);

CREATE TABLE IF NOT EXISTS tenant_records (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  entity TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_records_business_entity ON tenant_records(business_id, entity);

CREATE TABLE IF NOT EXISTS tenant_supply_deliveries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  supplier TEXT NOT NULL,
  arrival_window TEXT NOT NULL,
  contents TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Programado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supply_deliveries_business ON tenant_supply_deliveries(business_id);

CREATE TABLE IF NOT EXISTS tenant_supply_alerts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  title TEXT NOT NULL,
  product_ref TEXT NOT NULL DEFAULT '',
  condition_text TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supply_alerts_business ON tenant_supply_alerts(business_id);

CREATE TABLE IF NOT EXISTS tenant_stock_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'u',
  quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  min_quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_stock_items_business ON tenant_stock_items(business_id);

CREATE TABLE IF NOT EXISTS tenant_recipes (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  output_label TEXT NOT NULL DEFAULT '',
  output_quantity DOUBLE PRECISION NOT NULL DEFAULT 1,
  output_unit TEXT NOT NULL DEFAULT 'u',
  lines_json TEXT NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_recipes_business ON tenant_recipes(business_id);

CREATE TABLE IF NOT EXISTS tenant_production_batches (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  label TEXT NOT NULL DEFAULT '',
  plan_json TEXT NOT NULL,
  outputs_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_batches_business ON tenant_production_batches(business_id);

CREATE TABLE IF NOT EXISTS tenant_stock_movements (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  stock_item_id TEXT NOT NULL REFERENCES tenant_stock_items(id),
  delta DOUBLE PRECISION NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON tenant_stock_movements(business_id);

CREATE TABLE IF NOT EXISTS tenant_restaurant_profile (
  business_id TEXT PRIMARY KEY REFERENCES business(id),
  public_token TEXT UNIQUE NOT NULL,
  venue_name TEXT NOT NULL DEFAULT '',
  allergies_json TEXT NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_menu_categories (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_business ON tenant_menu_categories(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  category_id TEXT REFERENCES tenant_menu_categories(id),
  name TEXT NOT NULL,
  name_es TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  station TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_menu_items_business ON tenant_menu_items(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_prices (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  item_id TEXT NOT NULL REFERENCES tenant_menu_items(id),
  channel TEXT NOT NULL DEFAULT 'salon',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  UNIQUE (business_id, item_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_menu_prices_business ON tenant_menu_prices(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_modifiers (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  allergen_tags_json TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_menu_modifiers_business ON tenant_menu_modifiers(business_id);

CREATE TABLE IF NOT EXISTS tenant_menu_item_modifiers (
  item_id TEXT NOT NULL REFERENCES tenant_menu_items(id),
  modifier_id TEXT NOT NULL REFERENCES tenant_menu_modifiers(id),
  required INTEGER NOT NULL DEFAULT 0,
  max_qty INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (item_id, modifier_id)
);

CREATE TABLE IF NOT EXISTS tenant_tables (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  zone TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL,
  x DOUBLE PRECISION NOT NULL DEFAULT 0,
  y DOUBLE PRECISION NOT NULL DEFAULT 0,
  seats INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'libre',
  meta_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_tables_business ON tenant_tables(business_id);

CREATE TABLE IF NOT EXISTS tenant_table_sessions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  table_id TEXT NOT NULL REFERENCES tenant_tables(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  cart_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  waiter_user_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_table_sessions_business ON tenant_table_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_open ON tenant_table_sessions(business_id, table_id, closed_at);

CREATE TABLE IF NOT EXISTS tenant_price_lists (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT '',
  is_default INTEGER NOT NULL DEFAULT 0,
  markup_pct DOUBLE PRECISION,
  markup_fixed_cents INTEGER,
  round_to_cents INTEGER,
  active INTEGER NOT NULL DEFAULT 1,
  UNIQUE (business_id, key)
);

CREATE INDEX IF NOT EXISTS idx_price_lists_business ON tenant_price_lists(business_id);

CREATE TABLE IF NOT EXISTS tenant_price_list_items (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  price_list_id TEXT NOT NULL REFERENCES tenant_price_lists(id),
  item_id TEXT NOT NULL REFERENCES tenant_menu_items(id),
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  UNIQUE (price_list_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_price_list_items_business ON tenant_price_list_items(business_id);

CREATE TABLE IF NOT EXISTS tenant_delivery_integrations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  provider TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  api_key TEXT,
  refresh_token TEXT,
  store_id TEXT,
  location TEXT,
  webhook_secret TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE (business_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_delivery_integrations_business ON tenant_delivery_integrations(business_id);

CREATE TABLE IF NOT EXISTS tenant_delivery_jobs (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  provider TEXT NOT NULL,
  job_type TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_jobs_business ON tenant_delivery_jobs(business_id, status);

CREATE TABLE IF NOT EXISTS ai_usage (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  user_id TEXT,
  usage_type TEXT NOT NULL DEFAULT 'advisor',
  year_month TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_business_month ON ai_usage(business_id, usage_type, year_month);

CREATE TABLE IF NOT EXISTS tenant_whatsapp_contacts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  phone TEXT NOT NULL,
  display_name TEXT,
  wa_profile_name TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (business_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_wa_contacts_business ON tenant_whatsapp_contacts(business_id);

CREATE TABLE IF NOT EXISTS tenant_whatsapp_messages (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES business(id),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  wamid TEXT,
  peer_phone TEXT NOT NULL,
  body_text TEXT,
  msg_type TEXT NOT NULL DEFAULT 'text',
  payload_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_business_created
  ON tenant_whatsapp_messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wa_messages_peer
  ON tenant_whatsapp_messages(business_id, peer_phone, created_at DESC);

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  business_id TEXT PRIMARY KEY REFERENCES business(id),
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  entitled_plan TEXT,
  access_state TEXT NOT NULL DEFAULT 'active',
  access_reason TEXT,
  access_note TEXT,
  closed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PostgREST lockdown (Supabase Advisor): Core API uses pooler, not anon key.
-- Apply also via docs/supabase/migrations/056_dakinis_core_rls_deny_policies.sql
DO $$
DECLARE
  r RECORD;
  pol text := 'dakinis_block_anon_authenticated';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    RETURN;
  END IF;
  FOR r IN
    SELECT c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r' AND n.nspname = 'dakinis_core' AND NOT c.relispartition
  LOOP
    EXECUTE format('ALTER TABLE dakinis_core.%I ENABLE ROW LEVEL SECURITY', r.table_name);
    EXECUTE format('DROP POLICY IF EXISTS %I ON dakinis_core.%I', pol, r.table_name);
    EXECUTE format(
      'CREATE POLICY %I ON dakinis_core.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
      pol,
      r.table_name
    );
  END LOOP;
END $$;
