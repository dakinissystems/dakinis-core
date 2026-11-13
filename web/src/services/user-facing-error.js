const TECHNICAL =
  /api_upstream|railway|cors_origin|vite_|process\.env|failed to fetch|econnrefused|enotfound|sqlite|postgres|stack trace|\/api\/tenant|tu-api\.railway/i;

export function dakinisUserFacingMessage(raw, fallback) {
  const text = String(raw || "").trim();
  const safe =
    fallback ||
    "No hemos podido obtener los datos. Tus datos anteriores no se han modificado.";
  if (!text || TECHNICAL.test(text)) return safe;
  return text;
}
