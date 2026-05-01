# Dakinis API Ready

## Ejecutar

- `npm run start:api`
- Base URL: `http://localhost:8787`

## Stack del sistema

- Frontend: `JavaScript` + `CSS` + `React`
- Backend: `Node.js`

## Seguridad

- Header requerido para casi todos los endpoints: `x-api-key`.
- `GET /api/health` queda publico para checks de monitoreo.
- API keys via env: `DAKINIS_API_KEYS` (formato `key:role,key:role`).
- Roles soportados:
  - `full-access` (lectura + escritura)
  - `read-only` (solo lectura)
- Defaults local dev:
  - `dakinis-dev-key:full-access`
  - `dakinis-read-key:read-only`
- Headers de respuesta para trazabilidad:
  - `X-Api-Key-Role`
  - `X-Api-Key-Source` (`env` o `file`)

### Rotacion de API keys sin reiniciar

- Si existe el archivo `.dakinis-keys.json` en la raiz del proyecto, se usa como fuente activa.
- Cambios en ese archivo se recargan automaticamente por `mtime` en caliente.
- Ejemplo de formato en `.dakinis-keys.example.json`.
- Variable opcional para ruta custom: `DAKINIS_API_KEYS_FILE`.
- Campos soportados por key:
  - `value` (string, requerido)
  - `role` (`full-access` o `read-only`, requerido)
  - `expiresAt` (ISO datetime, opcional)
  - `revoked` (boolean, opcional)

### Revocacion y expiracion

- `revoked: true` bloquea la key inmediatamente (sin reinicio).
- Si `expiresAt` ya paso, la key devuelve `KEY_EXPIRED`.
- Header de trazabilidad adicional (si aplica): `X-Api-Key-Expires-At`.

### Rate limiting

- Ventana: `DAKINIS_RATE_LIMIT_WINDOW_MS` (default `60000`).
- Max requests por ventana: `DAKINIS_RATE_LIMIT_MAX_REQUESTS` (default `60`).
- Headers de respuesta:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Contrato JSON estandar

### Success

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "requestId": "dk_...",
    "adapter": "clinica|peluqueria|inmobiliaria|custom"
  }
}
```

### Error

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje",
    "details": {}
  },
  "meta": {
    "requestId": "dk_..."
  }
}
```

## Seleccion de tipo de negocio (adapter)

Metodo recomendado por header HTTP:

- `x-business-type: clinica`
- `x-business-type: peluqueria`
- `x-business-type: inmobiliaria`
- `x-business-type: custom`

Compatibilidad legacy (opcional): query param `?adapter=...`

Prioridad:
1. `x-business-type`
2. `?adapter=...`
3. `custom` por defecto

## Endpoints

- `GET /api/health`
- `GET /api/config`
- `POST /api/agenda/slots`
- `POST /api/agenda/can-schedule`
- `POST /api/booking/validate`
- `POST /api/booking/link`
- `POST /api/crm/segment`
- `POST /api/crm/timeline`
- `POST /api/whatsapp/confirmation`
- `POST /api/whatsapp/reminder`
- `POST /api/whatsapp/reactivation`
- `GET /api/whatsapp/rules`
- `POST /api/leads/move-stage`
- `POST /api/leads/pipeline-summary`
- `POST /api/dashboard/metrics`

## Ejemplos rapidos

### Health

```bash
curl http://localhost:8787/api/health
```

### Validar reserva (clinica por header)

```bash
curl -X POST "http://localhost:8787/api/booking/validate" ^
  -H "x-api-key: dakinis-dev-key" ^
  -H "x-business-type: clinica" ^
  -H "Content-Type: application/json" ^
  -d "{\"serviceId\":\"botox\",\"date\":\"2026-05-12\",\"time\":\"17:00\",\"customerName\":\"Ana\",\"phone\":\"+34...\",\"whatsApp\":\"+34...\"}"
```

### Metricas dashboard (inmobiliaria por header)

```bash
curl -X POST "http://localhost:8787/api/dashboard/metrics" ^
  -H "x-api-key: dakinis-dev-key" ^
  -H "x-business-type: inmobiliaria" ^
  -H "Content-Type: application/json" ^
  -d "{\"appointments\":12,\"cancellations\":2,\"revenue\":5400,\"leads\":{\"total\":20,\"closed\":5}}"
```

### Ejemplo read-only (debe fallar en POST)

```bash
curl -X POST "http://localhost:8787/api/booking/link" ^
  -H "x-api-key: dakinis-read-key" ^
  -H "Content-Type: application/json" ^
  -d "{\"businessSlug\":\"demo\"}"
```
