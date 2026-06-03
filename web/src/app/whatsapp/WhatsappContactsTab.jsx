import { useCallback, useEffect, useState } from "react";
import { dakinisWhatsappContacts } from "../../services/whatsapp.js";

export default function WhatsappContactsTab({ t }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const json = await dakinisWhatsappContacts();
      setContacts(json?.data?.contacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.whatsapp.error"));
      setContacts([]);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="wa-tab">
      <p className="kpi-label">{t("app.whatsapp.contactsLead")}</p>
      <button type="button" className="btn btn-outline" onClick={load}>
        {t("app.whatsapp.refresh")}
      </button>
      {contacts.length === 0 ? (
        <p className="kpi-label" style={{ marginTop: "1rem" }}>
          {t("app.whatsapp.noContacts")}
        </p>
      ) : (
        <ul className="demo-tenant-list" style={{ marginTop: "1rem" }}>
          {contacts.map((c) => (
            <li key={c.id}>
              <strong>+{c.phone}</strong>
              <span className="demo-tenant-label">
                {c.display_name || c.wa_profile_name || t("app.whatsapp.unnamed")}
              </span>
            </li>
          ))}
        </ul>
      )}
      {error ? (
        <p className="lead" style={{ color: "#f97316", marginTop: "1rem" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
