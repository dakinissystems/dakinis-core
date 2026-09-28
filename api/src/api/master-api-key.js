/**
 * Resolve master API key for Cross-tenant ops.
 * Production: disabled unless DAKINIS_MASTER_API_KEY is set to a non-default value.
 * Development: falls back to dakinis-dev-key when unset.
 */
export function dakinisResolveMasterApiKey() {
  const configured = String(process.env.DAKINIS_MASTER_API_KEY ?? "").trim();
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) {
    if (!configured || configured === "dakinis-dev-key") return null;
    return configured;
  }
  return configured || "dakinis-dev-key";
}

export function dakinisMasterApiKeyEnabled() {
  return Boolean(dakinisResolveMasterApiKey());
}
