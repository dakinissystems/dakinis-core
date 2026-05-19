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
| **Railpack config** | Variable **`RAILPACK_CONFIG_FILE`** = **`railpack.web.json`** *(obligatorio; si no, usa `railpack.json` = API)* |
| **Build command** | **Vacío** (borra `npm run build` del UI — Railpack ya construye el SPA) |
| **Start command** | Vacío o `npm run start:web` |
| Healthcheck | `/` |

Variables del servicio (build + runtime):

| Variable | Valor |
|----------|--------|
| `RAILPACK_CONFIG_FILE` | `railpack.web.json` |
| `VITE_API_BASE_URL` | `https://dakinis-core-production.up.railway.app` |
| `NODE_ENV` | `production` |

Quita del front: `JWT_SECRET`, `SQLITE_PATH`, `CORS_ORIGIN` (solo API).

En Build Logs debe aparecer: `Using config file railpack.web.json` y el deploy `vite preview`, no `npm run start -w @dakinis/api`.

Dominio: **core.dakinissystems.com**

---

## Error `EBUSY ... web/node_modules/.vite`

- No uses **Custom Build Command** con `npm ci && npm run build` (duplica install).
- No ejecutes `rm -rf web/node_modules/.vite` en `railpack.web.json`: Railpack monta esa ruta en caché y `rm` falla con *Device or resource busy*.

---

## Error `Missing script: "start:web"`

El servicio **Core Front** tiene Custom Start `npm run start:web` pero ese script no estaba en GitHub.

1. Haz pull/deploy del commit que añade `start:web` en `package.json`.
2. O cambia Start a: `npm run preview -w @dakinis/web -- --host 0.0.0.0 --port $PORT` (sin depender del script).
3. Confirma **Config file** = `railpack.web.json` (no `railpack.json`, que arranca la API).

Si el build usa `railpack.json` y el start es `npm start`, arrancas la API en el servicio del SPA: el healthcheck en `/` fallará.

---

## Error `ENOENT ... /app/package.json`

No definas un paso `install` con solo `npm install` / `npm ci` en `railpack.json`: **sustituye** el plan de Railpack y ejecuta npm antes de copiar el código.

Deja que Railpack genere el paso `install` (solo personaliza `build` y `deploy`).

## Error `npm ci` / `package-lock.json`

Asegúrate de que `package-lock.json` está en `main` (raíz del repo). Si falla `npm ci`, no añadas un `install` custom; usa el install automático de Railpack.
