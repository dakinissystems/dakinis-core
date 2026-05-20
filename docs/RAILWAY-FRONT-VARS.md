# Variables Railway — Core Front

| Variable | Valor |
|----------|--------|
| `RAILPACK_CONFIG_FILE` | `railpack.web.json` |
| **`API_UPSTREAM`** | **`https://dakinis-core-production.up.railway.app`** *(proxy `/api` en el front; **obligatorio** para login en core.dakinissystems.com)* |
| `NPM_CONFIG_PRODUCTION` | `false` *(instala devDependencies para Vite en build; no uses `NODE_ENV=production` aquí)* |

Opcional en build (no necesario si usas `API_UPSTREAM`): quita `VITE_API_BASE_URL` del servicio front para forzar `/api` same-origin.

Opcional si falla el copy: `RAILPACK_NODE_INSTALL_PATTERNS` = `web shared`

Eliminar en este servicio: `CORS_ORIGIN`, `JWT_SECRET`, `SQLITE_PATH`, `VITE_API_URL` (sin `https://`).

**Deploy → Start command:** déjalo **vacío** (usa `npm run start:web` del `railpack.web.json`). Si pones `npm run start:web` en el UI **y** Railpack también arranca, puedes tener dos procesos o puertos distintos y falla el healthcheck en `/`.
