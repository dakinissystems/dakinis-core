# Dakinis One (Core)

Sistema de gestión empresarial **modular** para centralizar clientes, operaciones y procesos de negocio (hospitality, CRM, conectores).

> **Nombre comercial:** Dakinis One · **Código / repo:** Core ([dakinis-core](https://github.com/dakinissystems/dakinis-core))  
> **No confundir** con el repo de orquestación [`dakinis-systems`](https://github.com/dakinissystems/dakinis-systems) (gateway, contratos, Docker).

| | |
|---|---|
| **Web** | https://core.dakinissystems.com |
| **API (gateway)** | https://api.dakinissystems.com/core/ |
| **Health** | https://api.dakinissystems.com/core/api/health |
| **Estado** | [STATUS.md](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) (piloto / módulos por madurez) |

## Qué incluye (alcance)

Los módulos existen en distintos grados de madurez. **No** asumir que todo está listo para venderse:

| Área | Notas |
|------|--------|
| Shell / TPV / hospitality | En evolución — ver STATUS (migraciones floor/menu/delivery) |
| CRM | API v1 + migraciones |
| Inventario, reservas, WhatsApp, facturación, IA | Capacidades de plataforma / producto; consultar STATUS antes de comprometer alcance comercial |

## Estructura

| Carpeta | Rol |
|---------|-----|
| `web/` | SPA (Vite + React) |
| `api/` | API Node (Express / Fastify según flag) |
| `shared/` | Código compartido / verticales |

## Desarrollo local

Requisitos: Node.js 20+, acceso a Postgres (Supabase u otro) según `.env`.

```bash
npm install
cp .env.example .env   # si existe; completar DATABASE_URL / secrets
npm run dev            # solo la web
npm run dev:full       # web y API a la vez
```

La API arranca con `npm run start:api` (`node server.js`). Fastify es opcional: `npm run start:fastify` en `api/` pone `USE_FASTIFY=true`. Health local típico: `/api/health`. El puerto está en `.env.example`.

## Docs canónicas

Estado → [STATUS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/STATUS.md) ·
Mapa → [SYSTEMS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/SYSTEMS.md) ·
Ops → [OPERATIONS](https://github.com/dakinissystems/dakinis-systems/blob/main/docs/OPERATIONS.md) ·
Legal → [docs/legal](https://github.com/dakinissystems/dakinis-systems/tree/main/docs/legal) ·
Índice → [docs](https://github.com/dakinissystems/dakinis-systems/tree/main/docs)
