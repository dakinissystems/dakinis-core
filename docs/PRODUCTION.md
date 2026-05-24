# Core API — producción (Railway / Docker)

## PostgreSQL (recomendado)

En Railway (servicio `dakinis-core-api`):

```env
DB_DRIVER=postgres
DATABASE_URL=postgresql://USER:PASS@HOST:5432/dakinis
CORE_SEED_DEMO=false
JWT_SECRET=<mismo que auth>
CORS_ORIGIN=https://core.dakinissystems.com
```

El schema `dakinis_core` se crea con `docker/postgres/init/03-dakinis-core-schema.sql`.  
En Postgres gestionado, ejecuta ese SQL una vez.

## SQLite (solo dev / demos)

```env
DB_DRIVER=sqlite
SQLITE_PATH=/app/data/dakinis.db
```

## Observabilidad

```env
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
```

## Fastify (opt-in)

```env
USE_FASTIFY=true
```

## Event bus (Redis)

```env
DAKINIS_EVENT_BUS=redis
REDIS_URL=redis://...
```
