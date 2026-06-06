/** Valor por defecto solo para desarrollo local. */
export const DAKINIS_INSECURE_MASTER_API_KEY = "dakinis-dev-key";

const MIN_PRODUCTION_MASTER_KEY_LENGTH = 24;

/**
 * @returns {string}
 */
export function dakinisResolveMasterApiKey() {
  return String(process.env.DAKINIS_MASTER_API_KEY ?? DAKINIS_INSECURE_MASTER_API_KEY).trim();
}

/**
 * Falla al arrancar en producción si la master key es la de dev o demasiado corta.
 */
export function dakinisAssertProductionMasterApiKey() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const key = dakinisResolveMasterApiKey();
  if (!key || key === DAKINIS_INSECURE_MASTER_API_KEY) {
    throw new Error(
      "Producción: define DAKINIS_MASTER_API_KEY distinta de dakinis-dev-key (mín. 24 caracteres)."
    );
  }
  if (key.length < MIN_PRODUCTION_MASTER_KEY_LENGTH) {
    throw new Error(
      `Producción: DAKINIS_MASTER_API_KEY debe tener al menos ${MIN_PRODUCTION_MASTER_KEY_LENGTH} caracteres.`
    );
  }
}
