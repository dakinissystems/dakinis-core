import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import {
  dakinisCrmContactTimeline,
  dakinisCrmCreateActivity,
  dakinisCrmCreateContact,
  dakinisCrmListContacts,
  dakinisCrmMeta
} from "../../services/crm.js";
import BusinessNavHero from "../../components/business/BusinessNavHero.jsx";
import CrmPipelineBoard from "../../components/business/CrmPipelineBoard.jsx";
import { dakinisIsBusinessDemoSession, dakinisIsBusinessFacingSession } from "../../utils/businessDemoMode.js";

const DAKINIS_CRM_JOURNEY_KEYS = ["client", "booking", "order", "invoice", "whatsapp", "followUp"];
const DAKINIS_ACTIVITY_TYPES = ["note", "call", "whatsapp", "email", "meeting", "booking", "order"];

function dakinisContactLabel(c) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return name || c.displayName || c.phone || c.email || c.id;
}

export default function CrmPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const [contacts, setContacts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [timeline, setTimeline] = useState(null);
  const [search, setSearch] = useState("");
  const [crmReady, setCrmReady] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [noteType, setNoteType] = useState("note");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!session?.token) {
    return (
      <section className="modules">
        <div className="container">
          <h2>{t("app.crm.title")}</h2>
          <p className="lead">{t("app.crm.loginLead")}</p>
          <button className="btn" type="button" onClick={() => navigate("/login")}>
            {t("app.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const meta = await dakinisCrmMeta();
      setCrmReady(Boolean(meta?.data?.crmReady ?? meta?.crmReady));
      const json = await dakinisCrmListContacts(search, 200);
      const list = json?.data?.contacts || [];
      setContacts(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.crm.error"));
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  const loadTimeline = useCallback(
    async (contactId) => {
      if (!contactId) {
        setTimeline(null);
        return;
      }
      setError("");
      try {
        const json = await dakinisCrmContactTimeline(contactId);
        setTimeline(json?.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("app.crm.error"));
        setTimeline(null);
      }
    },
    [t]
  );

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    if (selectedId) loadTimeline(selectedId);
  }, [selectedId, loadTimeline]);

  async function handleCreateContact(e) {
    e.preventDefault();
    if (!newPhone.trim() && !newEmail.trim()) return;
    setSaving(true);
    setError("");
    try {
      const json = await dakinisCrmCreateContact({
        firstName: newFirst.trim(),
        lastName: newLast.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim(),
        source: "manual"
      });
      const created = json?.data?.contact;
      setNewFirst("");
      setNewLast("");
      setNewPhone("");
      setNewEmail("");
      await loadContacts();
      if (created?.id) setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.crm.error"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddActivity(e) {
    e.preventDefault();
    if (!selectedId || !noteText.trim()) return;
    setSaving(true);
    setError("");
    try {
      await dakinisCrmCreateActivity(selectedId, { type: noteType, notes: noteText.trim() });
      setNoteText("");
      await loadTimeline(selectedId);
      await loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.crm.error"));
    } finally {
      setSaving(false);
    }
  }

  const selected = contacts.find((c) => c.id === selectedId);
  const journeySteps = DAKINIS_CRM_JOURNEY_KEYS.map((key) => t(`app.crm.journey.${key}`));
  const isDemo = dakinisIsBusinessDemoSession(session);
  const isBusinessFacing = dakinisIsBusinessFacingSession(session);

  return (
    <section className="modules business-app-page">
      <div className="container">
        {isBusinessFacing ? <BusinessNavHero navigate={navigate} compact /> : null}
        <p className="kicker">
          {isBusinessFacing ? t("businessDemo.clients.kicker") : t("app.crm.title")}
        </p>
        <h2>{isBusinessFacing ? t("businessDemo.clients.title") : t("app.crm.heading")}</h2>
        <p className="lead">
          {isBusinessFacing ? t("businessDemo.clients.lead") : t("app.crm.leadPersisted")}
        </p>

        {isDemo ? (
          <div style={{ marginBottom: "1.25rem" }}>
            <h3 style={{ marginTop: 0 }}>{t("businessDemo.pipeline.sectionTitle")}</h3>
            <CrmPipelineBoard />
          </div>
        ) : null}

        {crmReady === false ? (
          <p className="lead" style={{ color: "#f97316" }}>
            {isBusinessFacing ? t("app.crm.notReadyFriendly") : t("app.crm.notReady")}
          </p>
        ) : null}

        {!isDemo ? (
          <div className="crm-journey card" aria-label={t("app.crm.journeyAria")}>
            {journeySteps.map((label, index) => (
              <span key={DAKINIS_CRM_JOURNEY_KEYS[index]} className="crm-journey__step">
                {label}
                {index < journeySteps.length - 1 ? (
                  <span className="crm-journey__arrow" aria-hidden>
                    →
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        {!isDemo ? (
          <div className="crm-quick-links">
            <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
              {t("app.crm.linkCommunications")}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate("/hub")}>
              {t("appNav.hub")}
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="lead" style={{ color: "#f97316" }}>
            {error}
          </p>
        ) : null}

        <div className="wa-conv-layout" style={{ marginTop: "1.25rem" }}>
          <aside className="wa-conv-list card">
            <label className="mockup-field">
              <span>{t("app.crm.search")}</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadContacts()}
                placeholder={t("app.crm.searchPlaceholder")}
              />
            </label>
            <button type="button" className="btn btn-outline" onClick={loadContacts} disabled={loading}>
              {loading ? t("app.crm.loading") : t("app.crm.refresh")}
            </button>
            <ul className="wa-thread-list" role="list">
              {contacts.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`wa-thread-btn${c.id === selectedId ? " wa-thread-btn--active" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <strong>{dakinisContactLabel(c)}</strong>
                    {c.phone ? <span className="kpi-label">{c.phone}</span> : null}
                    {c.source ? <span className="kpi-label">{c.source}</span> : null}
                  </button>
                </li>
              ))}
              {!loading && contacts.length === 0 ? (
                <li className="kpi-label">{t("app.crm.noContacts")}</li>
              ) : null}
            </ul>

            <form className="mockup-form" onSubmit={handleCreateContact} style={{ marginTop: "1rem" }}>
              <p className="kpi-label">{t("app.crm.newContact")}</p>
              <label className="mockup-field">
                <span>{t("app.crm.firstName")}</span>
                <input value={newFirst} onChange={(e) => setNewFirst(e.target.value)} />
              </label>
              <label className="mockup-field">
                <span>{t("app.crm.lastName")}</span>
                <input value={newLast} onChange={(e) => setNewLast(e.target.value)} />
              </label>
              <label className="mockup-field">
                <span>{t("app.crm.phone")}</span>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </label>
              <label className="mockup-field">
                <span>{t("app.crm.email")}</span>
                <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </label>
              <button type="submit" className="btn" disabled={saving}>
                {t("app.crm.saveContact")}
              </button>
            </form>
          </aside>

          <div className="wa-conv-thread card">
            {selected ? (
              <>
                <h3>{dakinisContactLabel(selected)}</h3>
                <p className="kpi-label">
                  {[selected.phone, selected.email, selected.source].filter(Boolean).join(" · ")}
                </p>
                <ul className="wa-messages" role="list">
                  {(timeline?.timeline || []).map((item) => (
                    <li
                      key={`${item.kind}-${item.id}`}
                      className={`wa-msg wa-msg--${item.direction || item.type || "note"}`}
                    >
                      <span className="kpi-label">
                        {item.kind === "whatsapp"
                          ? t("app.crm.timelineWhatsapp")
                          : t(`app.crm.activity.${item.type || "note"}`)}
                        {item.direction ? ` (${item.direction})` : ""}
                      </span>
                      <p>{item.notes || item.body || "—"}</p>
                      <time className="kpi-label">{item.createdAt}</time>
                    </li>
                  ))}
                  {!timeline?.timeline?.length ? (
                    <li className="kpi-label">{t("app.crm.emptyTimeline")}</li>
                  ) : null}
                </ul>
                <form className="mockup-form" onSubmit={handleAddActivity} style={{ marginTop: "1rem" }}>
                  <label className="mockup-field">
                    <span>{t("app.crm.activityType")}</span>
                    <select value={noteType} onChange={(e) => setNoteType(e.target.value)}>
                      {DAKINIS_ACTIVITY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t(`app.crm.activity.${type}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="mockup-field">
                    <span>{t("app.crm.activityNotes")}</span>
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={t("app.crm.activityNotesPlaceholder")}
                    />
                  </label>
                  <button type="submit" className="btn" disabled={saving || !noteText.trim()}>
                    {t("app.crm.addActivity")}
                  </button>
                </form>
              </>
            ) : (
              <p className="lead">{t("app.crm.selectContact")}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
