/** Valor por defecto inseguro (debe coincidir con `auth-tenant.js`). */
export const DAKINIS_JWT_INSECURE_PLACEHOLDER = "dakinis_dev_insecure_change_me";

const MIN_PRODUCTION_SECRET_LENGTH = 32;

/**
 * En `NODE_ENV=production` exige `JWT_SECRET` fuerte (no el placeholder y longitud mínima).
 * Llamar antes de `listen()` para fallar al arrancar si la configuración es insegura.
 */
export function dakinisAssertProductionJwtSecret() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }
  const raw = process.env.JWT_SECRET;
  const secret = typeof raw === "string" ? raw.trim() : "";
  if (!secret || secret === DAKINIS_JWT_INSECURE_PLACEHOLDER || secret.length < MIN_PRODUCTION_SECRET_LENGTH) {
    throw new Error(
      `Producción: define JWT_SECRET con al menos ${MIN_PRODUCTION_SECRET_LENGTH} caracteres ` +
        `y distinto del valor de desarrollo (${DAKINIS_JWT_INSECURE_PLACEHOLDER}).`
    );
  }
}
