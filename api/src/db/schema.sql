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
