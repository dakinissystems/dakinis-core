import { useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { DAKINIS_WHATSAPP_DEMO_THREADS } from "../../data/businessDemoContent.js";

export default function WhatsappBusinessDemo() {
  const { t } = useLocale();
  const [activeId, setActiveId] = useState(DAKINIS_WHATSAPP_DEMO_THREADS[0]?.id || "");
  const thread = DAKINIS_WHATSAPP_DEMO_THREADS.find((th) => th.id === activeId);

  return (
    <div className="wa-business-demo">
      <aside className="wa-business-demo__list card">
        <h4>{t("businessDemo.whatsapp.conversations")}</h4>
        <ul role="list">
          {DAKINIS_WHATSAPP_DEMO_THREADS.map((th) => (
            <li key={th.id}>
              <button
                type="button"
                className={`wa-business-demo__thread${th.id === activeId ? " is-active" : ""}`}
                onClick={() => setActiveId(th.id)}
              >
                <strong>{th.name}</strong>
                <span>{th.preview}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {thread ? (
        <div className="wa-business-demo__main">
          <section className="wa-business-demo__chat card">
            <h4>{thread.name}</h4>
            <ul className="wa-business-demo__messages" role="list">
              {thread.messages.map((msg, i) => (
                <li key={i} className={`wa-business-demo__msg wa-business-demo__msg--${msg.from}`}>
                  <p>{msg.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <aside className="wa-business-demo__client card">
            <p className="kicker">{t("businessDemo.whatsapp.linkedClient")}</p>
            <h4>{t("businessDemo.whatsapp.clientLabel")}</h4>
            <p className="wa-business-demo__client-name">{thread.linkedClient.name}</p>
            <dl className="wa-business-demo__client-meta">
              <div>
                <dt>{t("businessDemo.whatsapp.lastPurchase")}</dt>
                <dd>{thread.linkedClient.lastPurchase}</dd>
              </div>
              <div>
                <dt>{t("businessDemo.whatsapp.totalSpent")}</dt>
                <dd>{thread.linkedClient.totalSpent}</dd>
              </div>
              <div>
                <dt>{t("businessDemo.whatsapp.phone")}</dt>
                <dd>{thread.linkedClient.phone}</dd>
              </div>
            </dl>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
