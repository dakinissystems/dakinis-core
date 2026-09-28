import { useState } from "react";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTenantCopilot, dakinisTenantExecuteAction } from "../services/tenant-intelligence.js";

const DEGRADED_HINTS = {
  plan_upgrade_required: "Plan Pro requerido para Copilot IA (2000 consultas/mes).",
  ai_quota_exceeded: "Has agotado la cuota mensual de consultas IA.",
  ai_not_configured: "Core no tiene DAKINIS_AI_SERVICE_KEY — reinicia la API tras configurar .env.",
  ai_unreachable: "Servicio Dakinis AI no accesible — ejecuta: npm run start --prefix ../ai",
  ai_error: "Error al llamar al servicio IA.",
  unknown: "Respuesta por reglas (IA no disponible)."
};

const DAKINIS_QUICK_PROMPTS = {
  restaurante: [
    "¿Qué clientes llevan más de 30 días sin venir?",
    "¿Qué platos debería promocionar?",
    "¿Qué me queda poco de stock?",
    "¿Qué productos caducan?"
  ],
  clinica: ["¿Pacientes inactivos?", "¿Cómo reducir no-shows?", "Resumen del mes"],
  peluqueria: ["Clientes que no repiten", "Horas con más demanda", "Resumen semanal"],
  inmobiliaria: ["Leads sin seguimiento", "Visitas pendientes", "Pipeline del mes"]
};

function dakinisCopilotDegradedHint(result, data) {
  const reason = result?.degradedReason || data?.intelligence?.degradedReason;
  return DEGRADED_HINTS[reason] || DEGRADED_HINTS.unknown;
}

export default function DakinisCopilotPanel({ variant = "inline", className = "" }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");

  if (!session?.token || session.user?.role === "platform_admin") return null;

  const vertical = session?.business?.type || "restaurante";
  const quickPrompts = DAKINIS_QUICK_PROMPTS[vertical] || DAKINIS_QUICK_PROMPTS.restaurante;

  async function askQuestion(text) {
    const q = String(text || "").trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError("");
    try {
      const json = await dakinisTenantCopilot(session, q);
      setResult(json?.data?.copilot || null);
      setMeta(json?.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error Copilot");
    } finally {
      setLoading(false);
    }
  }

  async function onAsk(e) {
    e.preventDefault();
    await askQuestion(query);
  }

  async function onConfirmAction(actionId) {
    setLoading(true);
    try {
      await dakinisTenantExecuteAction(session, actionId);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              actions: (prev.actions || []).filter((a) => a.id !== actionId)
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error acción");
    } finally {
      setLoading(false);
    }
  }

  const panelClass =
    variant === "dropdown"
      ? "copilot-panel card"
      : variant === "hero"
        ? "copilot-panel copilot-panel--hero"
        : "copilot-panel copilot-panel--inline card commercial-ai";

  return (
    <section className={`copilot-panel-wrap ${className}`.trim()}>
      {variant === "inline" ? (
        <>
          <p className="kicker">{t("businessDemo.hero.aiKicker")}</p>
          <h3 style={{ margin: "0.25rem 0 0.5rem" }}>{t("businessDemo.hero.aiTitle")}</h3>
          <p className="lead" style={{ fontSize: "0.95rem", marginTop: 0 }}>
            {t("businessDemo.hero.aiLead")}
          </p>
        </>
      ) : null}

      <div className={panelClass}>
        <form
          onSubmit={onAsk}
          className={`copilot-form${variant === "hero" ? " copilot-form--hero" : ""}`}
        >
          {variant === "hero" ? (
            <span className="copilot-form__ai-badge" aria-hidden="true">
              ✨
            </span>
          ) : null}
          <input
            type="search"
            placeholder={t("businessDemo.hero.askPlaceholder")}
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            aria-label={t("businessDemo.hero.askAria")}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "…" : t("businessDemo.hero.askButton")}
          </button>
        </form>

        <div className="commercial-ai__chips" style={{ marginTop: "0.65rem" }}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="btn btn-outline"
              disabled={loading}
              onClick={() => askQuestion(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {error ? (
          <p className="lead" style={{ color: "var(--dakinis-warning)", marginTop: "0.65rem" }}>
            {error}
          </p>
        ) : null}
        {result?.answer ? (
          <article className="commercial-ai__answer" style={{ marginTop: "0.75rem" }}>
            <p className="kpi-label" style={{ margin: "0 0 0.35rem" }}>
              {t("businessDemo.hero.answerLabel")}
            </p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{result.answer}</p>
            {result.degraded ? (
              <span className="copilot-degraded-hint">{dakinisCopilotDegradedHint(result, meta)}</span>
            ) : null}
            {result.provider === "stub" ? (
              <span className="copilot-degraded-hint">
                Modo demo (stub). Añade OPENAI_API_KEY en platform/ai/.env para respuestas GPT.
              </span>
            ) : null}
          </article>
        ) : null}
        {result?.actions?.length ? (
          <ul className="copilot-actions">
            {result.actions.map((a) => (
              <li key={a.id}>
                {a.label}{" "}
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={loading}
                  onClick={() => onConfirmAction(a.id)}
                >
                  {a.confirmLabel || "Ejecutar"}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
