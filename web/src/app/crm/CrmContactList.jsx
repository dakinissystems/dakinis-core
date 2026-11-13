import { dakinisContactLabel } from "./contactUtils.js";

export default function CrmContactList({
  t,
  contacts,
  selectedId,
  search,
  loading,
  saving,
  newFirst,
  newLast,
  newPhone,
  newEmail,
  onSearchChange,
  onLoadContacts,
  onSelectContact,
  onNewFirstChange,
  onNewLastChange,
  onNewPhoneChange,
  onNewEmailChange,
  onCreateContact,
  composerOpen = false,
  onOpenComposer,
  onCloseComposer
}) {
  return (
    <aside className="wa-conv-list card">
      <label className="mockup-field">
        <span>{t("app.crm.search")}</span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLoadContacts()}
          placeholder={t("app.crm.searchPlaceholder")}
        />
      </label>
      {search ? (
        <button type="button" className="btn btn-outline" onClick={() => onSearchChange("")}>
          Limpiar búsqueda
        </button>
      ) : null}
      <button type="button" className="btn btn-outline" onClick={onLoadContacts} disabled={loading} aria-busy={loading}>
        {loading ? t("app.crm.loading") : t("app.crm.refresh")}
      </button>
      <ul className="wa-thread-list" role="list">
        {contacts.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={`wa-thread-btn${c.id === selectedId ? " wa-thread-btn--active" : ""}`}
              onClick={() => onSelectContact(c.id)}
            >
              <strong>{dakinisContactLabel(c)}</strong>
              {c.phone ? <span className="kpi-label">{c.phone}</span> : null}
              {c.source ? <span className="kpi-label">{c.source}</span> : null}
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="btn" style={{ marginTop: "0.75rem" }} onClick={onOpenComposer}>
        + {t("app.crm.newContact")}
      </button>

      {!loading && contacts.length === 0 ? (
        <p className="kpi-label" style={{ marginTop: "0.75rem" }}>
          Empieza a crear tu cartera. Registra el primer cliente para guardar sus datos, compras y seguimiento.
        </p>
      ) : null}

      {composerOpen ? (
      <form className="mockup-form crm-new-contact-form card" onSubmit={onCreateContact} style={{ marginTop: "1rem" }}>
        <p className="kpi-label">{t("app.crm.newContact")}</p>
        <label className="mockup-field">
          <span>{t("app.crm.firstName")}</span>
          <input value={newFirst} onChange={(e) => onNewFirstChange(e.target.value)} />
        </label>
        <label className="mockup-field">
          <span>{t("app.crm.lastName")}</span>
          <input value={newLast} onChange={(e) => onNewLastChange(e.target.value)} />
        </label>
        <label className="mockup-field">
          <span>{t("app.crm.phone")}</span>
          <input value={newPhone} onChange={(e) => onNewPhoneChange(e.target.value)} />
        </label>
        <label className="mockup-field">
          <span>{t("app.crm.email")}</span>
          <input value={newEmail} onChange={(e) => onNewEmailChange(e.target.value)} />
        </label>
        <button type="submit" className="btn" disabled={saving}>
          {t("app.crm.saveContact")}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCloseComposer}>
          {t("app.crm.cancel", "Cancelar")}
        </button>
      </form>
      ) : null}
    </aside>
  );
}
