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
    </div>
  );
}
