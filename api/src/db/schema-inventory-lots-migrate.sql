CREATE TABLE IF NOT EXISTS tenant_stock_locations (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'storage' CHECK (kind IN ('fridge', 'freezer', 'storage', 'floor', 'prep')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, slug),
  FOREIGN KEY (business_id) REFERENCES business(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_locations_business ON tenant_stock_locations(business_id);

CREATE TABLE IF NOT EXISTS tenant_stock_lots (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  label_code TEXT NOT NULL,
  stock_item_id TEXT,
  product_name TEXT NOT NULL,
  product_barcode TEXT NOT NULL DEFAULT '',
  supplier_lot TEXT NOT NULL DEFAULT '',
  expiry_date TEXT NOT NULL,
  quantity REAL NOT NULL,
  quantity_remaining REAL NOT NULL,
  location_id TEXT,
  supplier TEXT NOT NULL DEFAULT '',
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'depleted', 'waste')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, label_code),
  FOREIGN KEY (business_id) REFERENCES business(id),
  FOREIGN KEY (stock_item_id) REFERENCES tenant_stock_items(id),
  FOREIGN KEY (location_id) REFERENCES tenant_stock_locations(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_lots_business_expiry ON tenant_stock_lots(business_id, expiry_date);
CREATE INDEX IF NOT EXISTS idx_stock_lots_business_status ON tenant_stock_lots(business_id, status);
CREATE INDEX IF NOT EXISTS idx_stock_lots_location ON tenant_stock_lots(business_id, location_id);
