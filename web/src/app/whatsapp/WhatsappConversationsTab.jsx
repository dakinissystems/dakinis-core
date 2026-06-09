import { useCallback, useEffect, useState } from "react";
import {
  dakinisWhatsappConversations,
  dakinisWhatsappSend,
  dakinisWhatsappThreadMessages
} from "../../services/whatsapp.js";
import WhatsappBusinessDemo from "../../components/business/WhatsappBusinessDemo.jsx";

export default function WhatsappConversationsTab({ t, demoMode = false }) {
  const [threads, setThreads] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [messages, setMessages] = useState([]);
  const [sendPhone, setSendPhone] = useState("");
  const [sendText, setSendText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const json = await dakinisWhatsappConversations(50);
      const list = json?.data?.threads || json?.data?.conversations || [];
      setThreads(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.whatsapp.error"));
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadThread = useCallback(
    async (phone) => {
      if (!phone) return;
      setError("");
      try {
        const json = await dakinisWhatsappThreadMessages(phone, 100);
        setMessages(json?.data?.messages || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("app.whatsapp.error"));
        setMessages([]);
      }
    },
    [t]
  );

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (selectedPhone) {
      setSendPhone(selectedPhone);
      loadThread(selectedPhone);
    }
  }, [selectedPhone, loadThread]);

  async function handleSend(e) {
    e.preventDefault();
    if (!sendPhone.trim() || !sendText.trim()) return;
    setSending(true);
    setError("");
    try {
      await dakinisWhatsappSend({ phone: sendPhone.trim(), message: sendText.trim() });
      setSendText("");
      await loadThreads();
      if (selectedPhone) await loadThread(selectedPhone);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.whatsapp.sendError"));
    } finally {
      setSending(false);
    }
  }

  if (demoMode && !loading && threads.length === 0) {
    return (
      <div className="wa-tab">
        <p className="kpi-label">{t("businessDemo.whatsapp.lead")}</p>
        <WhatsappBusinessDemo />
      </div>
    );
  }

  return (
    <div className="wa-tab">
      <p className="kpi-label">{demoMode ? t("businessDemo.whatsapp.lead") : t("app.whatsapp.conversationsLead")}</p>
      {loading ? <p className="kpi-label">{t("app.whatsapp.loading")}</p> : null}
      <div className="wa-conv-layout">
        <aside className="wa-thread-list card">
          <h4 className="comm-subtitle">{t("app.whatsapp.threadList")}</h4>
          {threads.length === 0 ? (
            <p className="kpi-label">{t("app.whatsapp.noThreads")}</p>
          ) : (
            <ul className="comm-auto-list">
              {threads.map((th) => (
                <li key={th.peerPhone}>
                  <button
                    type="button"
                    className={`link-btn${selectedPhone === th.peerPhone ? " is-active" : ""}`}
                    onClick={() => setSelectedPhone(th.peerPhone)}
                  >
                    +{th.peerPhone}
                  </button>
                  <span className="demo-tenant-label">{th.lastBody || "—"}</span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn btn-outline" style={{ marginTop: "0.75rem" }} onClick={loadThreads}>
            {t("app.whatsapp.refresh")}
          </button>
        </aside>

        <section className="wa-thread-view card">
          <h4 className="comm-subtitle">
            {selectedPhone ? `+${selectedPhone}` : t("app.whatsapp.selectThread")}
          </h4>
          <ul className="wa-message-list">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`wa-message wa-message--${m.direction === "outbound" ? "out" : "in"}`}
              >
                <span className="wa-message__body">{m.body || m.body_text || "—"}</span>
                <span className="kpi-label">{m.createdAt || m.storedAt || ""}</span>
              </li>
            ))}
          </ul>
          <form className="wa-send-form" onSubmit={handleSend}>
            <label className="kpi-label">
              {t("app.whatsapp.sendPhone")}
              <input
                className="input"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                placeholder="34600111222"
              />
            </label>
            <label className="kpi-label">
              {t("app.whatsapp.sendMessage")}
              <textarea
                className="input"
                rows={3}
                value={sendText}
                onChange={(e) => setSendText(e.target.value)}
              />
            </label>
            <button type="submit" className="btn" disabled={sending}>
              {sending ? t("app.whatsapp.sending") : t("app.whatsapp.send")}
            </button>
          </form>
        </section>
      </div>
      {error ? (
        <p className="lead" style={{ color: "#f97316", marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
