import { DAKINIS_TENANT_PRIMARY_COLOR_FALLBACK } from "../../constants/desTenantColor.js";

export default function SettingsBusinessForm({ settings, setSettings, saving, msg, onSubmit }) {
  if (!settings) return null;

  return (
    <form className="card mockup-form" style={{ marginTop: "1rem" }} onSubmit={onSubmit}>
      <h3>Configuración del negocio</h3>
      <label className="mockup-field">
        <span>Logo (URL)</span>
        <input
          value={settings.logoUrl || ""}
          onChange={(ev) => setSettings((p) => ({ ...p, logoUrl: ev.target.value }))}
        />
      </label>
      <label className="mockup-field">
        <span>Color principal</span>
        <input
          type="color"
          value={settings.primaryColor || DAKINIS_TENANT_PRIMARY_COLOR_FALLBACK}
          onChange={(ev) => setSettings((p) => ({ ...p, primaryColor: ev.target.value }))}
        />
      </label>
      <label className="mockup-field">
        <span>Horario</span>
        <input
          value={settings.businessHours || ""}
          onChange={(ev) => setSettings((p) => ({ ...p, businessHours: ev.target.value }))}
        />
      </label>
      <label className="mockup-field">
        <span>Zona horaria</span>
        <input
          value={settings.timezone || "Europe/Madrid"}
          onChange={(ev) => setSettings((p) => ({ ...p, timezone: ev.target.value }))}
        />
      </label>
      <label className="mockup-field">
        <span>Moneda</span>
        <input
          value={settings.currency || "EUR"}
          onChange={(ev) => setSettings((p) => ({ ...p, currency: ev.target.value }))}
        />
      </label>
      <label className="mockup-field">
        <span>Idioma</span>
        <input
          value={settings.locale || "es"}
          onChange={(ev) => setSettings((p) => ({ ...p, locale: ev.target.value }))}
        />
      </label>
      <label className="mockup-field">
        <span>IVA (%)</span>
        <input
          type="number"
          value={settings.vatRate ?? 21}
          onChange={(ev) => setSettings((p) => ({ ...p, vatRate: Number(ev.target.value) }))}
        />
      </label>
      <label className="mockup-field">
        <span>WhatsApp</span>
        <input
          value={settings.whatsappNumber || ""}
          onChange={(ev) => setSettings((p) => ({ ...p, whatsappNumber: ev.target.value }))}
        />
      </label>
      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Guardando…" : "Guardar configuración"}
      </button>
      {msg ? <p className="lead">{msg}</p> : null}
    </form>
  );
}
