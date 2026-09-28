import { ColorModeControl } from "@dakinis/shared-ux";

export default function SettingsAccountCard({ t, session }) {
  return (
    <div className="card">
      <p>
        <strong>{t("app.settings.businessName")}</strong> {session?.business?.name || "—"}
      </p>
      <p>
        <strong>{t("app.settings.user")}</strong> {session?.user?.email || "-"}
      </p>
      <p>
        <strong>{t("app.settings.plan")}</strong> {session?.business?.plan || "-"}
      </p>
      <div style={{ marginTop: "1rem" }}>
        <p className="kpi-label" style={{ marginBottom: "0.5rem" }}>
          {t("app.settings.appearance") || "Apariencia"}
        </p>
        <ColorModeControl product="core" namespace="core" defaultMode="system" />
      </div>
    </div>
  );
}
