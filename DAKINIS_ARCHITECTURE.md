# Dakinis — Arquitectura

Documento único: **estructura del repo**, **cómo encaja el producto** y **camino hacia SaaS**. Detalle de endpoints en `API_READY.md`; variables en `.env.example`.

## Producto y visión

**Dakinis One** (Scheduler + CRM + WhatsApp en la UI) apunta a un **SaaS multi-tenant**: varios negocios aislados, cada uno con panel propio, datos separados y configuración por plan.

No es solo una demo de scheduler: el valor está en **encajar con flujos reales** (clínica, peluquería/barbería, restaurante, inmobiliaria).

### Estado actual vs objetivo SaaS

| Aspecto | Hoy en el repo | Objetivo SaaS |
|--------|----------------|---------------|
| Identidad del negocio | Tabla `business` (id, slug, `type`); resolución por **`x-business-id`** (id o slug). | Mismo modelo ampliado: facturación, límites por plan, más campos operativos. |
| Aislamiento de datos | SQLite: `tenant_records`, supply, usuarios por `business_id`; parte de la UI sigue siendo **mock en memoria**. | PostgreSQL (u otro) con **`business_id` en todas** las tablas de dominio; CRUD real end-to-end. |
| API | JWT (`/api/auth/login`, `/api/me`), **x-api-key**, validación tenant/plataforma; router por `business.type`. | Refinar autorización, auditoría, rate limits por plan. |
| Autenticación | Email/password + JWT; rol `platform_admin` + API `/api/platform/*`; TOTP opcional para plataforma. | 2FA más amplio, invitaciones, roles finos si hace falta. |
| Producto en UI | Rutas `/sistema/:vertical`, mockups `/vista/`, merge de config remota. | Dashboard con datos persistidos, métricas por tenant, módulos activables por plan. |

## Monorepo y comandos

El repo está en **tres carpetas** (`web/`, `api/`, `shared/`) y **npm workspaces** (`@dakinis/web`, `@dakinis/api`, `@dakinis/shared`), para desplegar SPA y API por separado (p. ej. dos servicios en Render).

Instalación (una vez, en la raíz): `npm install`.

| Comando | Acción |
|---------|--------|
| `npm run dev` | Vite en `web/` — workspace `@dakinis/web`; proxy `/api` → API local. |
| `npm run dev:full` | **Una terminal**: `concurrently` arranca API + Vite (mismo proxy que arriba). |
| `npm run preview` | Sirve `web/dist` con Vite preview (útil tras `npm run build`). |
| `npm run start:api` | Node — workspace `@dakinis/api`; ejecuta `api/server.js`. |
| `npm run build` | Build de producción del SPA → **`web/dist/`**. |
| `npm run lint` / `npm run lint:fix` | ESLint: `eslint.config.js`, `shared/`, `web/src`, `web/vite.config.js`, `api/` (incluye `server.js`). |
| `npm run format` / `npm run format:check` | Prettier sobre `shared/`, `web/`, `api/` y `eslint.config.js` (ver `.prettierignore`). |

Desarrollo local: **`npm run dev:full`** o **dos terminales** — `npm run start:api` y `npm run dev` — para que el proxy de Vite reenvíe `/api` al puerto de la API (`8787` por defecto, configurable con `PORT` y `VITE_DEV_API_PROXY` en `web/`). Si la API no está en marcha, el navegador puede devolver **502** en llamadas a `/api`.

## Frontend y backend (mapa)

```mermaid
flowchart LR
  subgraph browser["Frontend — web/"]
    SPA["web/src/main.jsx"]
    Pages["pages / components / context"]
    HTTP["services/api.js"]
  end
  subgraph nodejs["Backend — api/"]
    SRV["api/server.js"]
    API["api/src/api/*"]
    DB["api/src/db/* + data/*.db"]
  end
  subgraph pkg["shared/ — @dakinis/shared"]
    IDX["index.js"]
    CORE["core/"]
    ADP["adapters/"]
    CAT["catalog/"]
  end
  SPA --> HTTP
  HTTP -->|"proxy /api dev"| SRV
  HTTP -->|"VITE_API_BASE_URL prod"| SRV
  SRV --> API
  API --> DB
  SPA --> pkg
  API --> pkg
```

### Backend (`api/`)

No forma parte del bundle de Vite. Arranque: `npm run start:api` (equivalente a `npm run start -w @dakinis/api`).

| Ruta | Rol |
|------|-----|
| `api/server.js` | HTTP: CORS (`CORS_ORIGIN` / `FRONTEND_URL`), rate limit, rutas `/api/*` (incl. plataforma en `server.js` + `platform-routes.js`), JWT (`jwt-config` valida secreto en producción), autenticación tenant y `platform-auth`. **No** sirve el SPA. |
| `api/src/api/` | REST: `router`, `contracts`, `responses`, `security`, `jwt-config`, `auth-tenant`, `auth-routes`, `business-context`, `adapter-resolver`, `platform-auth`, `platform-routes`, `tenant-users`, `tenant-supply`. |
| `api/src/db/` | SQLite: `schema.sql`, `seed.js`, `index.js` (inicialización y acceso). |
| `data/` (raíz del repo) | Base de datos por defecto `dakinis.db` (ruta absoluta/relativa vía `SQLITE_PATH`). |

### Frontend (`web/`)

Vite + React. Salida de build: `web/dist/` (ignorada en Git; ver `.gitignore`).

| Ruta | Rol |
|------|-----|
| `web/index.html`, `web/styles.css` | Shell del SPA y estilos globales. |
| `web/public/` | Estáticos en la raíz del sitio (`/…`), p. ej. logos. |
| `web/vite.config.js` | Proxy hacia la API en dev/preview; objetivo por defecto `http://127.0.0.1:8787`, sobrescribible con `VITE_DEV_API_PROXY` (ver `.env.example`). |
| `web/src/` | `App.jsx`, `pages/` (incl. `VistaMockupPage.jsx`), `mockups/` (maquetas estáticas por vertical), `components/`, `context/`, `services/api.js`, `data/systemPages.js`, `config/`. |

`VITE_API_BASE_URL`: **vacío** en local (rutas relativas `/api` + proxy). En producción, URL pública de la API **sin barra final**.

#### Rutas del SPA (`web/src/App.jsx`)

Resolución en este orden: `/login` → `/admin` → **`/vista/:vertical`** → **`/sistema/:vertical`** → inicio (`/`).

Sin `react-router`: `window.location.pathname`, **`history.pushState`** / `popstate`.

| Prefijo | Constante (`shared/catalog/routes.js`) | Uso |
|---------|----------------------------------------|-----|
| `/vista/` | `DAKINIS_VISTA_ROUTE_PREFIX` | **Mockups de panel** (solo presentación): componentes en `web/src/mockups/*`; no persisten datos ni sustituyen la demo funcional. |
| `/sistema/` | `DAKINIS_SYSTEM_ROUTE_PREFIX` | **Página de sistema** por vertical: formularios demo, listados tenant, supply, equipo, etc. |

Con **sesión JWT de tenant**, el cliente solo puede permanecer en la vertical de `business.type` (tanto en `/sistema/…` como en `/vista/…`). Los **platform_admin** no usan rutas de vertical de tenant; gestionan negocios vía `/admin` y API `/api/platform/*`.

**Nota SaaS:** en el futuro la URL podría evolucionar a `/app/<business_id>` o `/b/<slug>`; el **tipo** de vertical seguiría siendo metadato del negocio, no el único identificador.

### Paquete compartido (`shared/`)

**`@dakinis/shared`**: motor de módulos (`core/`) — `agenda`, `booking`, `crm`, `whatsapp`, `leads`, `dashboard` — **adapters** por vertical (`clinic-esthetic`, `barbershop-premium`, `restaurante`, `real-estate`), **catalog** (`system-registry`, `system-modules`, `business-mapping`, `routes`, `business-type-display`). Lo consumen el cliente y, en el servidor, `api/src/api/router.js` y `adapter-resolver.js` (`from "@dakinis/shared"`).

| Ruta | Rol |
|------|-----|
| `shared/index.js` | Exports: `dakinisCreatePlatformModules`, adapters, etc. |
| `shared/catalog/routes.js` | Prefijos de rutas cliente: `/sistema/`, `/vista/`, vertical por defecto. |
| `shared/package.json` | Mapa `exports` para subrutas del `catalog/` usadas desde `web/`. |

Presentación local: p. ej. `web/src/config/public-defaults.js`; el catálogo de módulos viene de `@dakinis/shared`.

### Raíz del repositorio

| Archivo / carpeta | Rol |
|-------------------|-----|
| `package.json` | Workspaces: `shared`, `web`, `api` (nombres de paquete con prefijo `@dakinis/`). |
| `eslint.config.js` | ESLint 9 (flat config), React, Prettier. |
| `.prettierrc.json`, `.prettierignore` | Formato; exclusiones p. ej. `node_modules`, `dist`. |
| `.gitignore` | `node_modules/`, `web/dist/`, `data/*.db*`, `.env`, `.idea/`, `.vscode/`, cachés Vite, etc. |
| `.env.example` | Plantilla: API (`PORT`, `SQLITE_PATH`, `CORS_ORIGIN`, `JWT_SECRET`, `DAKINIS_PLATFORM_TOTP_SECRET` opcional) y build del front (`VITE_API_BASE_URL`, `VITE_DEV_API_PROXY`). **No** commitear `.env` real. |
| `render.yaml` | Blueprint de ejemplo (Static Site + Web Service); ajustar nombres y recursos. |
| `docker-compose.yml` | Postgres opcional para fases futuras; el MVP usa SQLite en `data/`. |

## Multi-tenant (concepto y reglas)

- **`business_id`** (UUID en DB; **slug** legible opcional en URLs y header) identifica al tenant.
- Headers típicos: `Authorization: Bearer <JWT>` y/o `x-api-key`, más **`x-business-id`** cuando la ruta lo exige; **`x-business-type`** debe ser coherente con el negocio resuelto (ver `contracts.js` y `router.js`).
- **Regla de oro:** toda lectura/escritura de datos de negocio debe filtrar por el negocio autorizado; no confiar solo en el front.

## Persistencia

**Hoy (SQLite):** `business`, `users`, `tenant_api_keys`, `tenant_records`, tablas de supply, etc. (`schema.sql`). Rutas como `GET/POST /api/tenant/mock-records` apoyan demos.

**Objetivo:** PostgreSQL (u otro) con el mismo patrón `business_id`; tablas de dominio (citas, clientes finales del negocio, leads, logs de mensajes…) siguiendo ese esquema.

Los **mockups** en React pueden seguir existiendo para UX; la fuente de verdad para producto vendible es la **API + DB por tenant**.

## Autenticación (resumen)

| Mecanismo | Uso |
|-----------|-----|
| **JWT** | `POST /api/auth/login`, `GET /api/me`; sesión en el SPA para tenants y flujos autorizados. |
| **x-api-key** | Claves en `tenant_api_keys` (roles full-access / read-only). |
| **Plataforma** | Usuarios `platform_admin`; rutas `/api/platform/*` con `platform-auth` y TOTP opcional (`DAKINIS_PLATFORM_TOTP_SECRET`). |

**Evolutivo:** pagos (Stripe), planes, límites; WhatsApp real (Meta) cuando los datos por tenant estén sólidos.

## Principios de diseño

- Configuración validada (`dakinisValidateConfig`) y módulos con responsabilidad única.
- Separación **motor** (`core` + factory) vs **vertical** (`adapters`) vs **tenant** (fila en `business` + datos en `tenant_*`).
- Contrato de respuestas API: `ok`, `data`, `meta` — `api/src/api/contracts.js` y `responses.js`.

## Uso rápido (motor en código)

```js
import { dakinisCreatePlatformModules, dakinisClinicEstheticAdapter } from "@dakinis/shared";

const modules = dakinisCreatePlatformModules({
  ...dakinisClinicEstheticAdapter,
  dashboard: { currency: "EUR" }
});
```

## API y persistencia (piezas)

| Pieza | Función |
|-------|---------|
| `api/server.js` | Inicializa DB (`dakinisInitDb`), `dakinisAssertProductionJwtSecret`, rate limit, resolución de tenant, autenticación; despacha rutas `/api/platform/*` y otras antes del router genérico. |
| `api/src/api/router.js` | Monta módulos según `business.type` y `config_json`; `/api/config`, módulos, `GET/POST /api/tenant/mock-records`, tenant users (`tenant-users.js`), supply (`tenant-supply.js`). Las rutas `/api/platform/*` se implementan en `platform-routes.js` y se enlazan desde `server.js`. |
| `api/src/api/auth-routes.js` | `POST /api/auth/login`, `GET /api/me` (vía `server.js`). |
| `api/src/db/schema.sql` | `business`, `users`, `tenant_api_keys`, `tenant_records`, `tenant_supply_deliveries`, `tenant_supply_alerts`. |

## Capas del sistema (lectura rápida)

- **Presentación**: `web/src/*` (más `web/public/`, estilos y Vite).
- **Dominio compartido**: `@dakinis/shared` (`core`, `adapters`, `catalog`).
- **Infraestructura API y datos**: `api/server.js`, `api/src/api/*`, `api/src/db/*`, SQLite bajo `data/`.

## Casos de uso por vertical (referencia de roadmap)

- **Clínica:** citas por recurso, recordatorios, historial y segmentación.
- **Peluquería / barbería:** agenda por profesional, reservas, recurrencia.
- **Inmobiliaria:** leads, visitas agendadas, embudo por fuente/agente.

## Roadmap técnico (orientado a venta)

| Fase | Contenido |
|------|------------|
| **1 — Actual** | Monorepo, SQLite multi-tenant base, JWT + plataforma, adapters, mockups + sistema por vertical, API modular. |
| **2** | PostgreSQL, modelo de dominio amplio con **`business_id`**, CRUD persistido y aislado. |
| **3** | Profundizar auth (invitaciones, roles), observabilidad. |
| **4** | Pagos (ej. Stripe), planes, límites. |
| **5** | WhatsApp real (Meta), automatizaciones sobre datos por tenant. |

## Deuda y próximos pasos

- **`App.jsx` concentra** rutas, sesión y navegación manual; al crecer el producto conviene extraer **router** declarativo y trocear por dominio (`services/`, hooks, bloques por módulo).
- Sustituir progresivamente **mocks en memoria** por datos que vivan en API + DB con filtro por tenant.
- Catálogo evolutivo: de verticales fijas a **módulos activables por plan** (`agenda`, `crm`, `whatsapp`…) con presets por `business.type`.

## Despliegue en Render (resumen)

1. **API** (Web Service, Node): directorio raíz del repo; `npm ci`; comando `npm run start -w @dakinis/api`. Definir `CORS_ORIGIN` con la URL del front. SQLite en producción: **disco persistente** y `SQLITE_PATH` en el volumen (p. ej. `/var/data/dakinis.db`).
2. **Frontend** (Static Site o equivalente): `npm ci && npm run build -w @dakinis/web`; publicar **`web/dist`**. Build: **`VITE_API_BASE_URL`** = URL HTTPS de la API (sin `/` final).

Más detalle en `.env.example` y comentarios en `render.yaml`.

## Calidad de código

| Comando | Uso |
|---------|-----|
| `npm run lint` | ESLint en workspaces y config raíz. |
| `npm run format` | Escribir formato Prettier. |
| `npm run format:check` | CI: falla si el formato no coincide. |

Antes de commit o PR: `npm run lint && npm run format:check && npm run build`.

## Referencias

- Endpoints y ejemplos: `API_READY.md`.
- Variables de entorno: `.env.example`.
