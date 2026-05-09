# Dakinis Core

Core modular que impulsa Dakinis Systems.

Diseñado para construir aplicaciones escalables, sistemas en tiempo real y plataformas SaaS multi-tenant sin rehacer lógica.

## Estructura del repo

- **`web/`** — SPA (Vite + React), build en `web/dist`.
- **`api/`** — Servidor Node REST (`api/server.js`).
- **`shared/`** — Paquete `@dakinis/shared` (motor y catálogo de verticales).

Raíz con **npm workspaces**: `npm run dev` (frontend), `npm run start:api` (API). Detalle en `DAKINIS_ARCHITECTURE.md` y `.env.example` para despliegues separados (p. ej. Render).

## Legal (base docs)

Se añadió paquete legal base en `docs/legal/` (ES/EN) para unificar políticas del ecosistema:

- `PRIVACIDAD(.en).md`
- `TERMINOS_Y_CONDICIONES(.en).md`
- `POLITICA_COOKIES(.en).md`
- `PROTECCION_LEGAL(.en).md`
- `MODERACION_CONTENIDOS(.en).md`
- `ACCOUNT_DELETION(.en).md`
- `CHILD_SAFETY(.en).md`
