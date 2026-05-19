# Variables Railway — Core Front

| Variable | Valor |
|----------|--------|
| `RAILPACK_CONFIG_FILE` | `railpack.web.json` |
| `VITE_API_BASE_URL` | `https://dakinis-core-production.up.railway.app` |
| `NPM_CONFIG_PRODUCTION` | `false` *(instala devDependencies para Vite en build; no uses `NODE_ENV=production` aquí)* |

Opcional si falla el copy: `RAILPACK_NODE_INSTALL_PATTERNS` = `web shared`

Eliminar en este servicio: `CORS_ORIGIN`, `JWT_SECRET`, `SQLITE_PATH`, `VITE_API_URL` (sin `https://`).
