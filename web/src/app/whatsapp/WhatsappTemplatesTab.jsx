import { useState } from "react";
import {
  dakinisMessageConfirmation,
  dakinisMessageReminder,
  dakinisMessageReactivation,
  dakinisWhatsappPreview
} from "../../services/messages.js";

const PREVIEW_KEYS = [
  { id: "confirmation", fn: "confirmation", labelKey: "confirmation" },
  { id: "reminder", fn: "reminder", labelKey: "reminder" },
  { id: "reactivation", fn: "reactivation", labelKey: "reactivation" },
  { id: "orderReady", eventType: "order.ready", labelKey: "orderReady" },
  { id: "lowStock", eventType: "inventory.low", labelKey: "lowStock" }
];

export default function WhatsappTemplatesTab({ t, businessName }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const clientPayload = { clientName: "Ana", businessName };

  async function runPreview(item) {
    setError("");
    try {
      let json;
      if (item.fn === "confirmation") json = await dakinisMessageConfirmation(clientPayload);
      else if (item.fn === "reminder") json = await dakinisMessageReminder(clientPayload);
      else if (item.fn === "reactivation") json = await dakinisMessageReactivation(clientPayload);
      else {
        json = await dakinisWhatsappPreview({
          eventType: item.eventType,
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
      }
      setResult(json?.data?.message || json?.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.whatsapp.error"));
      setResult(null);
    }
  }

  return (
    <div className="wa-tab">
      <p className="kpi-label">{t("app.whatsapp.templatesLead")}</p>
      <ul className="comm-auto-list">
        {PREVIEW_KEYS.map((item) => (
          <li key={item.id}>
            <span>{t(`app.communications.${item.labelKey}`)}</span>
            <button type="button" className="btn btn-outline comm-auto-preview-btn" onClick={() => runPreview(item)}>
              {t("app.communications.preview")}
            </button>
          </li>
        ))}
      </ul>
      {result ? (
        <pre className="config-box" style={{ marginTop: "1rem" }}>
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
      {error ? (
        <p className="lead" style={{ color: "var(--dakinis-warning)", marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
