/**
 * Resolve master API key for Cross-tenant ops.
 * Production: disabled unless DAKINIS_MASTER_API_KEY is set to a non-default value.
 * Development: falls back to dakinis-dev-key when unset.
 */
export const DAKINIS_DEV_MASTER_API_KEY = "dakinis-dev-key";

/**
 * En producción, si alguien deja la clave de desarrollo en la variable, no arrancar.
 * Ausente o vacía = master deshabilitada (válido). Solo tumba el valor de desarrollo.
 */
export function dakinisAssertProductionMasterApiKey() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const configured = String(process.env.DAKINIS_MASTER_API_KEY ?? "").trim();
  if (configured === DAKINIS_DEV_MASTER_API_KEY) {
    throw new Error(
      `Producción: DAKINIS_MASTER_API_KEY no puede ser la clave de desarrollo (${DAKINIS_DEV_MASTER_API_KEY}).`
    );
  }
}

export function dakinisResolveMasterApiKey() {
  const configured = String(process.env.DAKINIS_MASTER_API_KEY ?? "").trim();
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    if (!configured || configured === DAKINIS_DEV_MASTER_API_KEY) return null;
    return configured;
  }
  return configured || DAKINIS_DEV_MASTER_API_KEY;
}

export function dakinisMasterApiKeyEnabled() {
  return Boolean(dakinisResolveMasterApiKey());
}
