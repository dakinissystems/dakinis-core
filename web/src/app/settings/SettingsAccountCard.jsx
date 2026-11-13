import { useState } from "react";
import { ColorModeControl } from "@dakinis/shared-ux";
import { dakinisApplyVisualDensity, dakinisReadVisualDensity } from "../../utils/visualDensity.js";

export default function SettingsAccountCard({ t, session }) {
  const [density, setDensity] = useState(() => dakinisReadVisualDensity());
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
        <p className="kpi-label" style={{ margin: "0.75rem 0 0.35rem" }}>Densidad</p>
        <div role="group" aria-label="Densidad visual">
          {[
            ["compact", "Compacta"],
            ["normal", "Normal"],
            ["comfortable", "Cómoda"]
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={density === id ? "btn" : "btn btn-outline"}
              aria-pressed={density === id}
              onClick={() => setDensity(dakinisApplyVisualDensity(id))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
