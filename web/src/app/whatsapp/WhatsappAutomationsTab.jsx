import { useCallback, useEffect, useState } from "react";
import { dakinisWhatsappRules } from "../../services/whatsapp.js";

export default function WhatsappAutomationsTab({ t }) {
  const [rules, setRules] = useState([]);

  const loadRules = useCallback(async () => {
    try {
      const json = await dakinisWhatsappRules();
      setRules(json?.data?.rules || []);
    } catch {
      setRules([]);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return (
    <div className="wa-tab">
      <p className="kpi-label">{t("app.whatsapp.automationsLead")}</p>
      <p className="kpi-label">{t("app.communications.automationsLead")}</p>
      {rules.length ? (
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
      ) : (
        <p className="kpi-label">{t("app.whatsapp.noRules")}</p>
      )}
      <p className="kpi-label" style={{ marginTop: "1rem" }}>
        {t("app.whatsapp.autoSendHint")}
      </p>
    </div>
  );
}
