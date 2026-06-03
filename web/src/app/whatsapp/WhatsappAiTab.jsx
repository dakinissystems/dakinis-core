export default function WhatsappAiTab({ t }) {
  const items = t("app.whatsapp.aiItems") || [];
  return (
    <div className="wa-tab comm-panel--muted">
      <p className="kpi-label">{t("app.whatsapp.aiLead")}</p>
      <ul className="comm-soon-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
