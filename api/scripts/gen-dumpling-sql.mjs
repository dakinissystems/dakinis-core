import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const payloadPath = path.resolve(__dirname, "../../../../docs/supabase/seeds/_dumpling-payload.json");
const outPath = path.resolve(__dirname, "../../../../docs/supabase/seeds/04-tenant-dumpling-house.sql");

const { allergies, config } = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
const configStr = JSON.stringify(config).replace(/'/g, "''");
const allergiesStr = JSON.stringify(allergies).replace(/'/g, "''");
const passwordHash = "$2b$10$pdt519qiKewgzbJWEInh5OgGKoFnohVWi8p2PZjJ0aE9iqj38PFci";

const sql = `-- Dumpling House — tenant restaurante (menú + alérgenos)
-- Ejecutar en Supabase SQL Editor tras 02-dakinis-core-prod.sql
-- Fuente: C:\\Users\\Christian\\Downloads\\Dumplings
-- Login: admin@dumpling-house.local / demo123
-- QR público: /alergenos/dumplinghouseqr2026

DO $$
BEGIN
  IF to_regclass('dakinis_core_prod.business') IS NULL THEN
    RAISE EXCEPTION 'Falta dakinis_core_prod.business. Ejecuta primero schemas/02-dakinis-core-prod.sql en Supabase.';
  END IF;
END $$;

INSERT INTO dakinis_core_prod.business (id, slug, name, type, plan, config_json)
VALUES (
  'biz_dumpling_house',
  'dumpling-house',
  'Dumpling House',
  'restaurante',
  'starter',
  '${configStr}'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  plan = EXCLUDED.plan,
  config_json = EXCLUDED.config_json;

INSERT INTO dakinis_core_prod.users (id, business_id, email, password_hash, role)
VALUES (
  'usr_dumpling_house_1',
  'biz_dumpling_house',
  'admin@dumpling-house.local',
  '${passwordHash}',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  business_id = EXCLUDED.business_id,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

INSERT INTO dakinis_core_prod.tenant_restaurant_profile (business_id, public_token, venue_name, allergies_json)
VALUES (
  'biz_dumpling_house',
  'dumplinghouseqr2026',
  'Dumpling House',
  '${allergiesStr}'
)
ON CONFLICT (business_id) DO UPDATE SET
  venue_name = EXCLUDED.venue_name,
  allergies_json = EXCLUDED.allergies_json,
  updated_at = now();

-- Stock básico (opcional)
INSERT INTO dakinis_core_prod.tenant_stock_items (id, business_id, slug, name, unit, quantity, min_quantity)
VALUES
  ('stk_dh_harina', 'biz_dumpling_house', 'harina-trigo', 'Harina de trigo', 'kg', 25, 5),
  ('stk_dh_arroz', 'biz_dumpling_house', 'arroz', 'Arroz', 'kg', 20, 5),
  ('stk_dh_cerdo', 'biz_dumpling_house', 'cerdo', 'Cerdo', 'kg', 15, 3),
  ('stk_dh_pollo', 'biz_dumpling_house', 'pollo', 'Pollo', 'kg', 15, 3),
  ('stk_dh_ternera', 'biz_dumpling_house', 'ternera', 'Ternera', 'kg', 10, 2),
  ('stk_dh_pato', 'biz_dumpling_house', 'pato', 'Pato', 'kg', 8, 2),
  ('stk_dh_langostino', 'biz_dumpling_house', 'langostino', 'Langostino', 'kg', 6, 2),
  ('stk_dh_verduras', 'biz_dumpling_house', 'verduras', 'Verduras mix', 'kg', 12, 3),
  ('stk_dh_soja', 'biz_dumpling_house', 'soja-salsa', 'Salsa de soja', 'L', 4, 1),
  ('stk_dh_sesamo', 'biz_dumpling_house', 'sesamo', 'Sésamo', 'kg', 2, 0.5)
ON CONFLICT (business_id, slug) DO NOTHING;
`;

fs.writeFileSync(outPath, sql);
console.log("SQL written:", outPath, "bytes", sql.length);
