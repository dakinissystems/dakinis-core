import { useEffect, useState } from "react";
import { useLocale } from "../../context/LocaleContext.jsx";
import { useDakinisSession } from "../../context/SessionContext.jsx";
import { useDakinisLogout } from "../../hooks/useDakinisLogout.js";
import { dakinisTenantJsonFetch } from "../../services/api.js";

export default function SettingsPage({ navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const signOut = useDakinisLogout();
  const [allergiesUrl, setAllergiesUrl] = useState("");

  useEffect(() => {
    if (session?.business?.type !== "restaurante" || !session?.token) return;
    dakinisTenantJsonFetch("/api/tenant/restaurant/kitchen", session)
      .then((json) => {
        const token = json?.data?.profile?.publicToken;
        if (token) setAllergiesUrl(`${window.location.origin}/alergenos/${token}`);
      })
      .catch(() => {});
  }, [session]);

  return (
    <section className="modules">
      <div className="container">
        <h2>{t("app.settings.title")}</h2>
        <p className="lead">{t("app.settings.lead")}</p>
        <div className="card">
          <p>
            <strong>{t("app.settings.user")}</strong> {session?.user?.email || "-"}
          </p>
          <p>
            <strong>{t("app.settings.role")}</strong> {session?.user?.role || "-"}
          </p>
          <p>
            <strong>{t("app.settings.tenant")}</strong>{" "}
            {session?.business?.slug || session?.business?.id || "-"}
          </p>
          <p>
            <strong>{t("app.settings.type")}</strong> {session?.business?.type || "-"}
          </p>
        </div>
        {session?.business?.type === "restaurante" ? (
          <div className="card" style={{ marginTop: "1rem" }}>
            <h3>{t("app.settings.restaurantBlock")}</h3>
            <p className="lead">
              {t("app.settings.restaurantLead")}{" "}
              <button type="button" className="btn btn-outline" onClick={() => navigate("/sistema/restaurante")}>
                {t("app.settings.restaurantLink")}
              </button>
              .
            </p>
            {allergiesUrl ? (
              <p>
                <strong>{t("app.settings.publicAllergies")}</strong>{" "}
                <a href={allergiesUrl} target="_blank" rel="noreferrer">
                  {allergiesUrl}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/app/dashboard")}>
            {t("appNav.app")}
          </button>
          <button type="button" className="btn" onClick={() => signOut()}>
            {t("app.settings.logout")}
          </button>
        </div>
      </div>
    </section>
  );
}
