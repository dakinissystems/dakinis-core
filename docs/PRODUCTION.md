# Core API — producción (Railway + Supabase)

## Supabase PostgreSQL (obligatorio en prod)

Usa **Transaction pooler** puerto **6543** (no el Postgres plugin de Railway).

```env
NODE_ENV=production
PORT=4001
DB_DRIVER=postgres
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@....pooler.supabase.com:6543/postgres
DATABASE_SSL=true
POSTGRES_SCHEMA=dakinis_core_prod
CORE_SEED_DEMO=false
JWT_SECRET=<mismo que dakinis-auth>
CORS_ORIGIN=https://core.dakinissystems.com
REDIS_URL=${{Redis.REDIS_URL}}
DAKINIS_EVENT_BUS=redis
TRUST_PROXY=true
```

Schemas SQL: [`docs/supabase/schemas/`](../../../docs/supabase/schemas/) — ejecutar en Supabase SQL Editor.

- `CORE_SEED_DEMO` omitido en prod + Postgres → **sin seed** automático.
- Alias: `DB_SCHEMA=core_prod` → `dakinis_core_prod`.

## Health

`GET /api/health` → `db`, `postgresSchema`, `databasePooler`, `sentry`.

## SQLite

Solo desarrollo local (`DB_DRIVER=sqlite`).

## Railway

[`docs/RAILWAY-PRODUCTION.md`](../../../docs/RAILWAY-PRODUCTION.md)
