# Dakinis Core en Railway (API + frontend)

Dos servicios desde el mismo repo `dakinissystems/dakinis-core`, raíz `/`.

## Servicio A — API (`dakinis-core`)

| Campo | Valor |
|-------|--------|
| Config file | `railpack.api.json` (o `railpack.json` por defecto) |
| Build command | *(vacío — Railpack solo hace `npm ci`)* |
| Start command | `npm run start -w @dakinis/api` |
| Healthcheck | `/api/health` |

Variables: `NODE_ENV=production`, `JWT_SECRET`, `SQLITE_PATH`, `CORS_ORIGIN=https://core.dakinissystems.com`

Dominio sugerido: `dakinis-core-production.up.railway.app` (no el dominio del SPA).

---

## Servicio B — Frontend (`core.dakinissystems.com`)

| Campo | Valor |
|-------|--------|
| **Config file** | **`railpack.web.json`** (Settings → Config-as-code → Add path) |
| **Build command** | **Vacío** (no pongas `npm ci && ...` — duplica `npm ci` y falla con `EBUSY` en `.vite`) |
| **Start command** | Vacío (usa `railpack.web.json`) o `npm run start:web` *(requiere `package.json` en `main` con ese script)* |
| Healthcheck | `/` |

Variables de **build** (Railway las inyecta en el paso build):

| Variable | Ejemplo |
|----------|---------|
| `VITE_API_BASE_URL` | `https://dakinis-core-production.up.railway.app` |

Sin `JWT_SECRET` ni `SQLITE_PATH` en este servicio.

Dominio: **core.dakinissystems.com**

---

## Error `EBUSY ... web/node_modules/.vite`

Causa habitual: **Custom Build Command** con `npm ci && npm run build` cuando Railpack ya ejecutó `npm ci` en el paso install.

Solución: borrar el build command personalizado y usar solo `railpack.web.json`.

---

## Error `Missing script: "start:web"`

El servicio **Core Front** tiene Custom Start `npm run start:web` pero ese script no estaba en GitHub.

1. Haz pull/deploy del commit que añade `start:web` en `package.json`.
2. O cambia Start a: `npm run preview -w @dakinis/web -- --host 0.0.0.0 --port $PORT` (sin depender del script).
3. Confirma **Config file** = `railpack.web.json` (no `railpack.json`, que arranca la API).

Si el build usa `railpack.json` y el start es `npm start`, arrancas la API en el servicio del SPA: el healthcheck en `/` fallará.
