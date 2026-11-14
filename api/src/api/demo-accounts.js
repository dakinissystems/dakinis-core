/**
 * Cuentas y seeds de demostración (A6).
 * En producción no deben autenticarse ni sembrarse.
 */

/** Solo cuentas seed de demo — no el piloto Copérnico (`heladeria-copernico.local`). */
const DAKINIS_DEMO_EMAILS = new Set([
  "demo@local",
  "admin@dakinis-platform.local",
  "admin@clinica-demo.local",
  "admin@peluqueria-demo.local",
  "admin@inmobiliaria-demo.local",
  "admin@restaurante-demo.local",
  "admin@dumpling-house.local"
]);

export function dakinisIsDemoAccountEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) return false;
  return DAKINIS_DEMO_EMAILS.has(normalized);
}

export function dakinisAssertProductionDemoPolicy() {
  if (process.env.NODE_ENV !== "production") return;
  const seed = String(process.env.CORE_SEED_DEMO ?? "").trim().toLowerCase();
  if (seed === "true" || seed === "1") {
    throw new Error("Producción: CORE_SEED_DEMO no puede estar activo.");
  }
}
