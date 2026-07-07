import { use, useCallback, useState } from "react";
import { dakinisWhatsappContacts } from "../../services/whatsapp.js";

function dakinisContactsResource(refreshKey) {
  return dakinisWhatsappContacts()
    .then((json) => ({
      contacts: json?.data?.contacts || [],
      error: ""
    }))
    .catch((err) => ({
      contacts: [],
      error: err instanceof Error ? err.message : "Error"
    }));
}

const contactsCache = new Map();

function getContactsPromise(refreshKey) {
  if (!contactsCache.has(refreshKey)) {
    contactsCache.set(refreshKey, dakinisContactsResource(refreshKey));
  }
  return contactsCache.get(refreshKey);
}

export default function WhatsappContactsTab({ t }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { contacts, error } = use(getContactsPromise(refreshKey));

  const load = useCallback(() => {
    contactsCache.delete(refreshKey);
    setRefreshKey((key) => key + 1);
  }, [refreshKey]);

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
