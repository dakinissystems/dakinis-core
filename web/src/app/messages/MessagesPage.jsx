import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import {
  dakinisMessageConfirmation,
  dakinisMessageReminder,
  dakinisMessageReactivation,
  dakinisWhatsappPreview,
  dakinisWhatsappRules
} from "../../services/messages.js";

const DAKINIS_CHANNEL_IDS = ["whatsapp", "email", "telegram", "discord", "sms", "push"];

const DAKINIS_AUTOMATION_PREVIEW_KEYS = [
  { id: "lowStock", runKind: "lowStock", labelKey: "lowStock" },
  { id: "booking", runKind: "booking", labelKey: "bookingCreated" },
  { id: "orderReady", runKind: "orderReady", labelKey: "orderReady" }
];

export default function MessagesPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [result, setResult] = useState(null);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState("");
  const [previewKind, setPreviewKind] = useState(null);

  const businessName = session?.business?.name || "Dakinis";
  const clientPayload = { clientName: "Ana", businessName };

  const loadRules = useCallback(async () => {
    if (!session?.token) return;
    try {
      const json = await dakinisWhatsappRules();
      setRules(json?.data?.rules || []);
    } catch {
      setRules([]);
    }
  }, [session?.token]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  if (!session?.token) {
    return (
      <section className="modules comm-page">
        <div className="container">
          <h2>{t("app.communications.title")}</h2>
          <p className="lead">{t("app.communications.loginLead")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  async function runPreview(kind) {
    setError("");
    setPreviewKind(kind);
    try {
      const json =
        kind === "confirmation"
          ? await dakinisMessageConfirmation(clientPayload)
          : kind === "reminder"
            ? await dakinisMessageReminder(clientPayload)
            : kind === "reactivation"
              ? await dakinisMessageReactivation(clientPayload)
              : await dakinisWhatsappPreview({
                  eventType:
                    kind === "orderReady"
                      ? "order.ready"
                      : kind === "lowStock"
                        ? "inventory.low"
                        : kind === "booking"
                          ? "booking.created"
                          : "booking.created",
                  payload: {
                    customerName: "Ana",
                    businessName,
                    orderRef: "Comanda #42",
                    table: "12",
                    itemName: "Harina 00",
                    qty: 2,
                    date: "2026-05-20",
                    time: "19:30"
                  }
                });
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.communications.error"));
      setResult(null);
    }
  }

  return (
    <section className="modules comm-page">
      <div className="container">
        <p className="kicker">{t("app.communications.kicker")}</p>
        <h2>{t("app.communications.heading")}</h2>
        <p className="lead">{t("app.communications.lead")}</p>

        <div className="comm-layout">
          <section className="comm-panel card" aria-labelledby="comm-channels-title">
            <h3 id="comm-channels-title" className="hub-section-title">
              {t("app.communications.channelsTitle")}
            </h3>
            <ul className="comm-channel-list">
              {DAKINIS_CHANNEL_IDS.map((channelId) => {
                const active = channelId === "whatsapp";
                return (
                  <li
                    key={channelId}
                    className={`comm-channel${active ? " comm-channel--active" : " comm-channel--soon"}`}
                  >
                    <span className="comm-channel__status" aria-hidden>
                      {active ? "✓" : "○"}
                    </span>
                    <span>{t(`app.communications.channels.${channelId}`)}</span>
                    {!active ? (
                      <span className="hub-tile-badge hub-tile-badge--muted">{t("hub.roadmap")}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="comm-panel card" aria-labelledby="comm-auto-title">
            <h3 id="comm-auto-title" className="hub-section-title">
              {t("app.communications.automationsTitle")}
            </h3>
            <p className="kpi-label">{t("app.communications.automationsLead")}</p>
            <ul className="comm-auto-list">
              {DAKINIS_AUTOMATION_PREVIEW_KEYS.map((item) => (
                <li key={item.id}>
                  <span>{t(`app.communications.automations.${item.labelKey}`)}</span>
                  <button
                    type="button"
                    className="btn btn-outline comm-auto-preview-btn"
                    onClick={() => runPreview(item.runKind)}
                  >
                    {t("app.communications.preview")}
                  </button>
                </li>
              ))}
            </ul>
            {rules.length ? (
              <>
                <h4 className="comm-subtitle">{t("app.communications.rulesConfigured")}</h4>
                <ul className="demo-tenant-list">
                  {rules.map((r) => (
                    <li key={r.key}>
                      <code className="config-box">{r.key}</code>
                      <span className="demo-tenant-label">
                        {r.event} · {r.enabled ? t("app.communications.ruleOn") : t("app.communications.ruleOff")}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section className="comm-panel card" aria-labelledby="comm-wa-title">
            <h3 id="comm-wa-title" className="hub-section-title">
              {t("app.communications.whatsappToolsTitle")}
            </h3>
            <p className="kpi-label">{t("app.communications.whatsappToolsLead")}</p>
            <div className="comm-preview-actions">
              <button type="button" className="btn" onClick={() => runPreview("confirmation")}>
                {t("app.communications.confirmation")}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => runPreview("reminder")}>
                {t("app.communications.reminder")}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => runPreview("reactivation")}>
                {t("app.communications.reactivation")}
              </button>
            </div>
            {previewKind ? (
              <p className="kpi-label">
                {t("app.communications.lastPreview")}:{" "}
                {t(
                  `app.communications.automations.${
                    DAKINIS_AUTOMATION_PREVIEW_KEYS.find((k) => k.runKind === previewKind)?.labelKey || "lowStock"
                  }`
                )}
              </p>
            ) : null}
          </section>

          <section className="comm-panel card comm-panel--muted" aria-labelledby="comm-soon-title">
            <h3 id="comm-soon-title" className="hub-section-title">
              {t("app.communications.comingSoonTitle")}
            </h3>
            <ul className="comm-soon-list">
              {(t("app.communications.comingSoonItems") || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        {error ? (
          <p className="lead" style={{ color: "#f97316", marginTop: "1rem" }}>
            {error}
          </p>
        ) : null}
        {result ? (
          <details className="comm-result-details" style={{ marginTop: "1rem" }}>
            <summary>{t("app.communications.previewResult")}</summary>
            <pre className="config-box">{JSON.stringify(result, null, 2)}</pre>
          </details>
        ) : null}

        <p className="kpi-label" style={{ marginTop: "1rem" }}>
          {t("app.communications.legalHint")}{" "}
          <button type="button" className="link-btn" onClick={() => navigate("/privacy")}>
            {t("app.communications.legalLink")}
          </button>
        </p>

        <div className="system-page-actions" style={{ marginTop: "1.25rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/crm")}>
            {t("app.crm.title")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/hub")}>
            {t("appNav.hub")}
          </button>
        </div>
      </div>
    </section>
  );
}
