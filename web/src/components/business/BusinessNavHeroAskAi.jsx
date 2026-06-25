import { useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { dakinisTenantCopilot, dakinisTenantExecuteAction } from "../../services/tenant-intelligence.js";

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

/** Barra de preguntas IA embebida en el hero — siempre visible. */
export default function BusinessNavHeroAskAi() {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const vertical = session?.business?.type || "restaurante";
  const quickPrompts = DAKINIS_QUICK_PROMPTS[vertical] || DAKINIS_QUICK_PROMPTS.restaurante;
  const canAsk = Boolean(session?.token) && session?.user?.role !== "platform_admin";

  async function askQuestion(text) {
    if (!canAsk) return;
    const q = String(text || "").trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const json = await dakinisTenantCopilot(session, q);
      setResult(json?.data?.copilot || null);
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
    if (!canAsk) return;
    setLoading(true);
    try {
      await dakinisTenantExecuteAction(session, actionId);
      setResult((prev) =>
        prev
          ? { ...prev, actions: (prev.actions || []).filter((a) => a.id !== actionId) }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error acción");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="business-nav-hero__copilot" data-testid="hero-ask-ai">
      <form onSubmit={onAsk} className="copilot-form copilot-form--hero">
        <span className="copilot-form__ai-badge" aria-hidden="true">
          IA
        </span>
        <input
          type="search"
          className="business-nav-hero__copilot-input"
          placeholder={t("businessDemo.hero.askPlaceholder")}
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          aria-label={t("businessDemo.hero.askAria")}
          disabled={!canAsk || loading}
        />
        <button type="submit" className="btn business-nav-hero__copilot-submit" disabled={!canAsk || loading}>
          {loading ? "…" : t("businessDemo.hero.askButton")}
        </button>
      </form>

      <div className="business-nav-hero__copilot-chips">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="btn btn-outline"
            disabled={!canAsk || loading}
            onClick={() => askQuestion(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      {!canAsk ? (
        <p className="business-nav-hero__copilot-hint">{t("businessDemo.hero.loginForAi")}</p>
      ) : null}

      {error ? <p className="business-nav-hero__copilot-error">{error}</p> : null}

      {result?.answer ? (
        <article className="business-nav-hero__copilot-answer">
          <p className="kpi-label">{t("businessDemo.hero.answerLabel")}</p>
          <p className="business-nav-hero__copilot-answer-text">{result.answer}</p>
          {result.actions?.length ? (
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
        </article>
      ) : null}
    </div>
  );
}
