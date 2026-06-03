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

export default function MessagesPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [result, setResult] = useState(null);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState("");

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
      <section className="modules">
        <div className="container">
          <h2>{t("app.messages.title")}</h2>
          <p className="lead">{t("app.messages.loginLead")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  async function run(kind) {
    setError("");
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
      setError(err instanceof Error ? err.message : t("app.messages.error"));
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <h2>{t("app.messages.heading")}</h2>
        <p className="lead">{t("app.messages.rulesLead")}</p>

        <h3 className="hub-section-title">{t("app.messages.rulesTitle")}</h3>
        {rules.length ? (
          <ul className="demo-tenant-list">
            {rules.map((r) => (
              <li key={r.key}>
                <code className="config-box">{r.key}</code>
                <span className="demo-tenant-label">
                  {r.event} · {r.enabled ? "on" : "off"}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <button type="button" className="btn" onClick={() => run("confirmation")}>
            {t("app.messages.confirmation")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("reminder")}>
            {t("app.messages.reminder")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("reactivation")}>
            {t("app.messages.reactivation")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("orderReady")}>
            {t("app.messages.orderReady")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("lowStock")}>
            {t("app.messages.lowStock")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            {t("appNav.app")}
          </button>
        </div>
        {error ? <p className="lead" style={{ color: "#f97316" }}>{error}</p> : null}
        {result ? <pre className="config-box">{JSON.stringify(result, null, 2)}</pre> : null}
      </div>
    </section>
  );
}
