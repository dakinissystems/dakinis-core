import { dakinisContactLabel } from "./contactUtils.js";

const DAKINIS_ACTIVITY_TYPES = ["note", "call", "whatsapp", "email", "meeting", "booking", "order"];

export default function CrmContactDetail({
  t,
  selected,
  timeline,
  noteType,
  noteText,
  saving,
  onNoteTypeChange,
  onNoteTextChange,
  onAddActivity
}) {
  if (!selected) {
    return (
      <div className="wa-conv-thread card">
        <p className="lead">{t("app.crm.selectContact")}</p>
      </div>
    );
  }

  return (
    <div className="wa-conv-thread card">
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
        {!timeline?.timeline?.length ? <li className="kpi-label">{t("app.crm.emptyTimeline")}</li> : null}
      </ul>
      <form className="mockup-form" onSubmit={onAddActivity} style={{ marginTop: "1rem" }}>
        <label className="mockup-field">
          <span>{t("app.crm.activityType")}</span>
          <select value={noteType} onChange={(e) => onNoteTypeChange(e.target.value)}>
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
            onChange={(e) => onNoteTextChange(e.target.value)}
            placeholder={t("app.crm.activityNotesPlaceholder")}
          />
        </label>
        <button type="submit" className="btn" disabled={saving || !noteText.trim()}>
          {t("app.crm.addActivity")}
        </button>
      </form>
    </div>
  );
}
