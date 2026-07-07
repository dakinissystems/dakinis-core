import { useCallback, useEffect, useState } from "react";
import { dakinisTenantCopilot } from "../../services/tenant-intelligence.js";
import { dakinisWhatsappConversations, dakinisWhatsappThreadMessages } from "../../services/whatsapp.js";

const WA_AI_PROMPTS = [
  "Redacta una respuesta amable al último mensaje del cliente",
  "Resume esta conversación en 3 puntos para el equipo",
  "¿Qué acción de CRM recomiendas según el hilo?",
  "Propón un recordatorio de cita por WhatsApp",
];

function dakinisFormatThreadContext(messages = []) {
  if (!messages.length) return "";
  return messages
    .slice(-8)
    .map((m) => {
      const who = m.direction === "inbound" ? "Cliente" : "Negocio";
      const body = m.body || m.body_text || "";
      return `${who}: ${body}`;
    })
    .join("\n");
}

export default function WhatsappAiTab({ t, session }) {
  const [threads, setThreads] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const loadThreads = useCallback(async () => {
    try {
      const json = await dakinisWhatsappConversations(20);
      setThreads(json?.data?.threads || json?.data?.conversations || []);
    } catch {
      setThreads([]);
    }
  }, []);

  const loadThread = useCallback(async (phone) => {
    if (!phone) {
      setMessages([]);
      return;
    }
    try {
      const json = await dakinisWhatsappThreadMessages(phone, 50);
      setMessages(json?.data?.messages || []);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    loadThread(selectedPhone);
  }, [selectedPhone, loadThread]);

  async function askQuestion(text) {
    const q = String(text || "").trim();
    if (!q || !session?.token) return;
    setQuery(q);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const threadExcerpt = dakinisFormatThreadContext(messages);
      const json = await dakinisTenantCopilot(session, q, {
        whatsapp: {
          peerPhone: selectedPhone || null,
          threadExcerpt: threadExcerpt || null,
          messageCount: messages.length,
        },
      });
      setResult(json?.data?.copilot || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.whatsapp.error"));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    await askQuestion(query);
  }

  const degraded = Boolean(result?.degraded);
  const canAsk = Boolean(session?.token);

  return (
    <div className="wa-tab wa-ai-tab">
      <p className="kpi-label">{t("app.whatsapp.aiLead")}</p>

      <label className="wa-ai-tab__field">
        {t("app.whatsapp.aiThreadLabel")}
        <select
          value={selectedPhone}
          onChange={(e) => setSelectedPhone(e.target.value)}
          disabled={!canAsk || loading}
        >
          <option value="">{t("app.whatsapp.aiNoThread")}</option>
          {threads.map((thread) => (
            <option key={thread.peerPhone} value={thread.peerPhone}>
              +{thread.peerPhone} — {(thread.lastBody || "").slice(0, 40)}
            </option>
          ))}
        </select>
      </label>

      <div className="wa-ai-tab__chips">
        {WA_AI_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="btn btn-outline wa-ai-tab__chip"
            disabled={!canAsk || loading}
            onClick={() => askQuestion(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="wa-ai-tab__form">
        <label className="sr-only" htmlFor="wa-ai-query">
          {t("app.whatsapp.aiPlaceholder")}
        </label>
        <textarea
          id="wa-ai-query"
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("app.whatsapp.aiPlaceholder")}
          disabled={!canAsk || loading}
        />
        <button type="submit" className="btn" disabled={!canAsk || loading || !query.trim()}>
          {loading ? t("app.whatsapp.aiAsking") : t("app.whatsapp.aiAsk")}
        </button>
      </form>

      {selectedPhone && messages.length > 0 ? (
        <p className="kpi-label wa-ai-tab__context-hint">
          {t("app.whatsapp.aiContextHint", { count: messages.length })}
        </p>
      ) : null}

      {error ? <p className="lead wa-ai-tab__error">{error}</p> : null}

      {result ? (
        <article className={`wa-ai-tab__answer${degraded ? " is-degraded" : ""}`}>
          <h3>{t("app.whatsapp.aiAnswerTitle")}</h3>
          <p>{result.answer}</p>
          {degraded ? (
            <p className="kpi-label">{t("app.whatsapp.aiDegradedHint")}</p>
          ) : null}
          {result.actions?.length ? (
            <ul className="copilot-actions">
              {result.actions.map((action) => (
                <li key={action.id}>{action.label || action.id}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
