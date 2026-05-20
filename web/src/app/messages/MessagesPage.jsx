import { useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import {
  dakinisMessageConfirmation,
  dakinisMessageReactivation,
  dakinisMessageReminder
} from "../../services/messages.js";

export default function MessagesPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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
      const payload = { clientName: "Ana", businessName: session.business?.name || "Dakinis" };
      const json =
        kind === "confirmation"
          ? await dakinisMessageConfirmation(payload)
          : kind === "reminder"
            ? await dakinisMessageReminder(payload)
            : await dakinisMessageReactivation(payload);
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.messages.error"));
    }
  }

  return (
    <section className="modules">
      <div className="container">
        <h2>{t("app.messages.heading")}</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn" onClick={() => run("confirmation")}>
            {t("app.messages.confirmation")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("reminder")}>
            {t("app.messages.reminder")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => run("reactivation")}>
            {t("app.messages.reactivation")}
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
