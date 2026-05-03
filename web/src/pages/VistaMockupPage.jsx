import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { DAKINIS_VISTA_MOCKUPS } from "../mockups/index.js";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

export default function VistaMockupPage({ verticalKey, navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const Mockup = DAKINIS_VISTA_MOCKUPS[verticalKey] ?? DAKINIS_VISTA_MOCKUPS.clinica;
  const label = dakinisSystemRegistry[verticalKey]?.label ?? "Clínica";
  const isPlatformAdmin = dakinisIsPlatformAdminSession(session);
  const isTenantOnOwnVertical =
    Boolean(session?.token) && !isPlatformAdmin && session?.business?.type === verticalKey;

  return (
    <section className="mockup-page-wrap">
      <div className="container mockup-page-bar">
        <div>
          <p className="kicker">{t("vistaMockup.kicker")}</p>
          <h2 style={{ margin: "0.25rem 0 0" }}>{t("vistaMockup.title", { label })}</h2>
          <p className="lead" style={{ margin: "0.35rem 0 0" }}>
            {t("vistaMockup.lead")}
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
            {t("vistaMockup.home")}
          </button>
          {isPlatformAdmin ? (
            <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
              {t("vistaMockup.platformAdmin")}
            </button>
          ) : null}
          <button
            type="button"
            className="btn"
            onClick={() => navigate(`/sistema/${encodeURIComponent(verticalKey)}`)}
          >
            {isTenantOnOwnVertical ? t("vistaMockup.myFunctionalPanel") : t("vistaMockup.goDemoSystem")}
          </button>
        </div>
      </div>
      <div className="mockup-page-frame">
        <Mockup />
      </div>
    </section>
  );
}
