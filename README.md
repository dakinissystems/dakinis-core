# Dakinis Core

Core modular que impulsa Dakinis Systems.

Diseñado para construir aplicaciones escalables, sistemas en tiempo real y plataformas SaaS multi-tenant sin rehacer lógica.

## Estructura del repo

- **`web/`** — SPA (Vite + React), build en `web/dist`.
- **`api/`** — Servidor Node REST (`api/server.js`).
- **`shared/`** — Paquete `@dakinis/shared` (motor y catálogo de verticales).

Raíz con **npm workspaces**: `npm run dev` (frontend), `npm run start:api` (API). Detalle en `DAKINIS_ARCHITECTURE.md` y `.env.example` para despliegues separados (p. ej. Render).
