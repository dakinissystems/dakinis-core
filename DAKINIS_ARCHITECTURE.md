# Dakinis Modular Architecture

## Estructura

- `src/core`: logica reusable y agnostica del nicho.
- `src/adapters`: configuracion por vertical de negocio.
- `src/index.js`: punto de entrada con exports publicos.

## Buenas practicas aplicadas

- Configuracion inmutable con `Object.freeze` recursivo.
- Validacion temprana de configuracion (`dakinisValidateConfig`).
- Modulos puros por responsabilidad (agenda, booking, crm, whatsapp, leads, dashboard).
- Separacion clara entre **motor** (core) y **customizacion** (adapters).
- Validacion de fechas y asserts para evitar errores silenciosos.

## Uso rapido

```js
import { dakinisCreatePlatformModules, dakinisClinicEstheticAdapter } from "./src/index.js";

const modules = dakinisCreatePlatformModules({
  ...dakinisClinicEstheticAdapter,
  dashboard: { currency: "EUR" }
});
```

## API Ready

- `server.js`: API REST sin dependencias externas.
- `src/api/router.js`: rutas por modulo y validaciones base.
- `src/api/contracts.js`: contrato JSON estandar (`ok`, `data`, `error`, `meta`).
- `src/api/responses.js`: helpers para respuestas consistentes.
- `src/api/adapter-resolver.js`: seleccion de adapter por query param.

Ver guia de uso completa en `API_READY.md`.
