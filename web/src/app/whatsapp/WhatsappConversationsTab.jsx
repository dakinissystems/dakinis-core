import { use, useCallback, useState } from "react";
import {
  dakinisWhatsappConversations,
  dakinisWhatsappSend,
  dakinisWhatsappThreadMessages
} from "../../services/whatsapp.js";
import WhatsappBusinessDemo from "../../components/business/WhatsappBusinessDemo.jsx";

function dakinisThreadsResource(refreshKey) {
  return dakinisWhatsappConversations(50)
    .then((json) => ({
      threads: json?.data?.threads || json?.data?.conversations || [],
      error: ""
    }))
    .catch((err) => ({
      threads: [],
      error: err instanceof Error ? err.message : "Error"
    }));
}

const threadsCache = new Map();

function getThreadsPromise(refreshKey) {
  if (!threadsCache.has(refreshKey)) {
    threadsCache.set(refreshKey, dakinisThreadsResource(refreshKey));
  }
  return threadsCache.get(refreshKey);
}

export default function WhatsappConversationsTab({ t, demoMode = false }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { threads, error: threadsError } = use(getThreadsPromise(refreshKey));
  const [selectedPhone, setSelectedPhone] = useState("");
  const [messages, setMessages] = useState([]);
  const [phoneDraft, setPhoneDraft] = useState("");
  const [sendText, setSendText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadThreads = useCallback(() => {
    threadsCache.delete(refreshKey);
    setRefreshKey((key) => key + 1);
  }, [refreshKey]);

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

  const selectThread = useCallback(
    (phone) => {
      setSelectedPhone(phone);
      setPhoneDraft("");
      void loadThread(phone);
    },
    [loadThread]
  );

  const sendPhone = phoneDraft || selectedPhone;

  async function handleSend(e) {
    e.preventDefault();
    if (!sendPhone.trim() || !sendText.trim()) return;
    setSending(true);
    setError("");
    try {
      await dakinisWhatsappSend({ phone: sendPhone.trim(), message: sendText.trim() });
      setSendText("");
      loadThreads();
      if (selectedPhone) await loadThread(selectedPhone);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.whatsapp.sendError"));
    } finally {
      setSending(false);
    }
  }

  if (demoMode) {
    return <WhatsappBusinessDemo />;
  }

  const displayError = error || threadsError;

  return (
    <div className="wa-tab">
      <div className="wa-tab__toolbar">
        <button type="button" className="btn btn-outline" onClick={loadThreads}>
          {t("app.whatsapp.refresh")}
        </button>
      </div>
      <div className="wa-conversations">
        <aside className="wa-conversations__list">
          <ul>
            {threads.map((thread) => {
              const phone = thread.phone || thread.contact_phone;
              return (
                <li key={phone}>
                  <button
                    type="button"
                    className={`wa-thread${selectedPhone === phone ? " is-active" : ""}`}
                    onClick={() => selectThread(phone)}
                  >
                    +{phone}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        <section className="wa-conversations__panel">
          <form onSubmit={handleSend}>
            <label className="mockup-field">
              <span>{t("app.whatsapp.phone")}</span>
              <input
                value={phoneDraft || selectedPhone}
                onChange={(e) => setPhoneDraft(e.target.value)}
                placeholder="+34…"
              />
            </label>
            <label className="mockup-field">
              <span>{t("app.whatsapp.message")}</span>
              <textarea value={sendText} onChange={(e) => setSendText(e.target.value)} rows={3} />
            </label>
            <button type="submit" className="btn" disabled={sending}>
              {t("app.whatsapp.send")}
            </button>
          </form>
          <ul className="wa-messages">
            {messages.map((msg) => (
              <li key={msg.id || `${msg.created_at}-${msg.body}`}>
                <strong>{msg.direction === "out" ? t("app.whatsapp.out") : t("app.whatsapp.in")}</strong>
                <p>{msg.body || msg.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {displayError ? (
        <p className="lead" style={{ color: "var(--dakinis-warning)", marginTop: "1rem" }}>
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
