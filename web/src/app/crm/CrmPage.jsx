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
import AiContextualHint from "@dakinis/shared-ux/react/AiContextualHint.jsx";
import { dakinisIsBusinessDemoSession, dakinisIsBusinessFacingSession } from "../../utils/businessDemoMode.js";
import CrmLoginGate from "./CrmLoginGate.jsx";
import CrmDemoView from "./CrmDemoView.jsx";
import CrmContactList from "./CrmContactList.jsx";
import CrmContactDetail from "./CrmContactDetail.jsx";

const DAKINIS_CRM_JOURNEY_KEYS = ["client", "booking", "order", "invoice", "whatsapp", "followUp"];

export default function CrmPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const hasToken = Boolean(session?.token);
  const isDemo = dakinisIsBusinessDemoSession(session);
  const isBusinessFacing = dakinisIsBusinessFacingSession(session);
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

  const loadContacts = useCallback(async () => {
    if (!hasToken) return;
    setLoading(true);
    setError("");
    try {
      const meta = await dakinisCrmMeta();
      setCrmReady(Boolean(meta?.data?.crmReady ?? meta?.crmReady));
      const json = await dakinisCrmListContacts(search, 200);
      const list = json?.data?.contacts || [];
      setContacts(list);
      setSelectedId((prev) => {
        if (prev && list.some((c) => c.id === prev)) return prev;
        return list[0]?.id || "";
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("app.crm.error"));
      setContacts([]);
      setCrmReady(false);
    } finally {
      setLoading(false);
    }
  }, [hasToken, search, t]);

  const loadTimeline = useCallback(
    async (contactId) => {
      if (!hasToken || !contactId) {
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
    [hasToken, t]
  );

  const handleSelectContact = useCallback((contactId) => {
    setSelectedId(contactId);
  }, []);

  useEffect(() => {
    if (!hasToken || isDemo) return undefined;
    loadContacts();
    return undefined;
  }, [hasToken, isDemo, loadContacts]);

  useEffect(() => {
    if (!hasToken || isDemo || !selectedId) {
      setTimeline(null);
      return undefined;
    }
    void loadTimeline(selectedId);
    return undefined;
  }, [hasToken, isDemo, selectedId, loadTimeline]);

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

  if (!hasToken) {
    return <CrmLoginGate t={t} navigate={navigate} />;
  }

  if (isDemo) {
    return <CrmDemoView t={t} navigate={navigate} isBusinessFacing={isBusinessFacing} />;
  }

  const selected = contacts.find((c) => c.id === selectedId);
  const journeySteps = DAKINIS_CRM_JOURNEY_KEYS.map((key) => t(`app.crm.journey.${key}`));

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

        {crmReady === false ? (
          <p className="lead" style={{ color: "#f97316" }}>
            {isBusinessFacing ? t("app.crm.notReadyFriendly") : t("app.crm.notReady")}
          </p>
        ) : null}

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

        <div className="crm-quick-links">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/whatsapp")}>
            {t("app.crm.linkCommunications")}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/hub")}>
            {t("appNav.hub")}
          </button>
        </div>

        {error ? (
          <p className="lead" style={{ color: "#f97316" }}>
            {error}
          </p>
        ) : null}

        <AiContextualHint
          message={t("app.crm.aiHintInactive")}
          actionLabel={t("app.crm.aiHintAction")}
          onAction={() => navigate("/app/dashboard")}
        />

        <div className="wa-conv-layout" style={{ marginTop: "1.25rem" }}>
          <CrmContactList
            t={t}
            contacts={contacts}
            selectedId={selectedId}
            search={search}
            loading={loading}
            saving={saving}
            newFirst={newFirst}
            newLast={newLast}
            newPhone={newPhone}
            newEmail={newEmail}
            onSearchChange={setSearch}
            onLoadContacts={loadContacts}
            onSelectContact={handleSelectContact}
            onNewFirstChange={setNewFirst}
            onNewLastChange={setNewLast}
            onNewPhoneChange={setNewPhone}
            onNewEmailChange={setNewEmail}
            onCreateContact={handleCreateContact}
          />
          <CrmContactDetail
            t={t}
            selected={selected}
            timeline={timeline}
            noteType={noteType}
            noteText={noteText}
            saving={saving}
            onNoteTypeChange={setNoteType}
            onNoteTextChange={setNoteText}
            onAddActivity={handleAddActivity}
          />
        </div>
      </div>
    </section>
  );
}
