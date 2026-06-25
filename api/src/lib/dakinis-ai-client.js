import "../load-env.js";
const AI_BASE = String(process.env.DAKINIS_AI_BASE_URL || "http://localhost:4020").replace(/\/+$/, "");
const AI_KEY = String(process.env.DAKINIS_AI_SERVICE_KEY || "").trim();

export function dakinisAiConfigured() {
  return Boolean(AI_KEY);
}

/**
 * @param {{
 *   businessId: string,
 *   userId: string,
 *   userMessage: string,
 *   context: object,
 *   heuristicTips?: object[],
 *   locale?: string
 * }} params
 */
export async function dakinisCallCoreAdvisorAi(params) {
  if (!AI_KEY) {
    return {
      ok: false,
      error: "ai_not_configured",
      message: "DAKINIS_AI_SERVICE_KEY no configurada en core-api"
    };
  }

  const url = `${AI_BASE}/v1/core/advisor`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_KEY}`,
        "Content-Type": "application/json",
        "X-Dakinis-Product": "core",
        "X-Dakinis-User-Id": String(params.userId || ""),
        "X-Dakinis-Business-Id": String(params.businessId || "")
      },
      body: JSON.stringify({
        userMessage: params.userMessage,
        context: params.context,
        heuristicTips: params.heuristicTips,
        locale: params.locale || "es"
      }),
      signal: AbortSignal.timeout(60_000)
    });
  } catch (err) {
    return {
      ok: false,
      error: "ai_unreachable",
      message: err?.message || "No se pudo conectar con Dakinis AI"
    };
  }

  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, error: "ai_invalid_response", message: raw.slice(0, 200) };
  }

  if (!res.ok) {
    return {
      ok: false,
      error: json.error || "ai_error",
      message: json.message || `HTTP ${res.status}`
    };
  }

  return { ok: true, ...json };
}
