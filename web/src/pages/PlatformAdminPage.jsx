import { usePlatformAdminPage } from "../hooks/usePlatformAdminPage.js";
import {
  PlatformAdminAlertsPanel,
  PlatformAdminBusinessesPanel,
  PlatformAdminCreateBusinessForm,
  PlatformAdminTelemetryPanel,
  PlatformAdminUsersPanel
} from "../components/PlatformAdminPagePanels.jsx";

export default function PlatformAdminPage({ navigate }) {
  const admin = usePlatformAdminPage();

  if (admin.isRestricted) {
    return (
      <section className="modules">
        <div className="container">
          <p className="lead">{admin.t("admin.restricted")}</p>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/login")}>
            {admin.t("admin.goLogin")}
          </button>
        </div>
      </section>
    );
  }

  const { t, vistaMockupOptions, loading, error } = admin;

  return (
    <section className="modules">
      <div className="container">
        <p className="kicker">{t("admin.kicker")}</p>
        <h2>{t("admin.title")}</h2>
        <p className="lead">{t("admin.lead")}</p>
        <button type="button" className="btn btn-outline" style={{ marginBottom: "1rem" }} onClick={() => navigate("/")}>
          {t("admin.backHome")}
        </button>

        <h3 style={{ marginTop: "0.25rem" }}>{t("admin.mockupsTitle")}</h3>
        <p className="lead">{t("admin.mockupsLead")}</p>
        <div className="system-switcher" style={{ marginBottom: "1.25rem" }}>
          {vistaMockupOptions.map((o) => (
            <button
              key={`vista-${o.value}`}
              type="button"
              className="system-btn"
              onClick={() => navigate(`/vista/${encodeURIComponent(o.value)}`)}
            >
              {t("admin.vistaButton", { label: o.label })}
            </button>
          ))}
        </div>

        {loading ? <p className="lead">Cargando…</p> : null}
        {error ? (
          <p className="lead" style={{ color: "#f97316" }}>
            {error}
          </p>
        ) : null}

        <PlatformAdminCreateBusinessForm {...admin} />
        <PlatformAdminBusinessesPanel {...admin} />
        <PlatformAdminAlertsPanel opsAlerts={admin.opsAlerts} opsEmail={admin.opsEmail} />
        <PlatformAdminTelemetryPanel pilotTelemetry={admin.pilotTelemetry} />
        <PlatformAdminUsersPanel {...admin} />
      </div>
    </section>
  );
}
