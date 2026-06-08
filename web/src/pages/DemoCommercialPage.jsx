import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_VISTA_MOCKUPS } from "../mockups/index.js";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { dakinisTrackEvent, DAKINIS_ANALYTICS_EVENTS } from "../utils/analytics.js";
import ExecutiveDashboardPanel from "../components/commercial/ExecutiveDashboardPanel.jsx";
import BusinessAiCopilot from "../components/commercial/BusinessAiCopilot.jsx";
import DemoFlowGuide from "../components/commercial/DemoFlowGuide.jsx";
import DemoRoiBenefits from "../components/commercial/DemoRoiBenefits.jsx";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

/** Demo comercial orientada a cliente: ROI, dashboard ejecutivo, flujo conectado + panel interactivo. */
export default function DemoCommercialPage({ verticalKey, navigate }) {
  const { t } = useLocale();
  const { session } = useDakinisSession();
  const Mockup = DAKINIS_VISTA_MOCKUPS[verticalKey] ?? DAKINIS_VISTA_MOCKUPS.clinica;
  const label = dakinisSystemRegistry[verticalKey]?.label ?? "Clínica";
  const isPlatformAdmin = dakinisIsPlatformAdminSession(session);
  const isTenantOnOwnVertical =
    Boolean(session?.token) && !isPlatformAdmin && session?.business?.type === verticalKey;

  return (
    <div className="demo-commercial-page">
      <section className="demo-commercial-hero">
        <div className="container">
          <div className="demo-commercial-hero__grid">
            <div>
              <p className="kicker">{t("demoCommercial.kicker", { label })}</p>
              <h1 style={{ margin: "0.25rem 0 0" }}>{t("demoCommercial.title", { label })}</h1>
              <p className="lead" style={{ marginTop: "0.5rem" }}>
                {t("demoCommercial.lead")}
              </p>
              <DemoRoiBenefits verticalKey={verticalKey} />
              <div className="demo-commercial-hero__actions">
                <button
                  type="button"
                  className="btn btn-lg demo-commercial-hero__cta"
                  onClick={() => {
                    dakinisTrackEvent(DAKINIS_ANALYTICS_EVENTS.DEMO_OPENED, {
                      vertical: verticalKey,
                      from: "hero_try_panel"
                    });
                    document.getElementById("demo-panel")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t("commercial.tryDemo")}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate(`/sistema/${encodeURIComponent(verticalKey)}`)}
                >
                  {isTenantOnOwnVertical ? t("vistaMockup.myFunctionalPanel") : t("vistaMockup.goDemoSystem")}
                </button>
              </div>
            </div>
            <DemoFlowGuide verticalKey={verticalKey} />
          </div>
        </div>
      </section>

      <section className="demo-commercial-dashboard">
        <div className="container">
          <ExecutiveDashboardPanel verticalKey={verticalKey} />
        </div>
      </section>

      <section className="demo-commercial-ai">
        <div className="container">
          <BusinessAiCopilot verticalKey={verticalKey} />
        </div>
      </section>

      <section className="demo-commercial-panel" id="demo-panel">
        <div className="container">
          <div className="demo-commercial-panel__bar">
            <div>
              <p className="kicker">{t("demoCommercial.panelKicker")}</p>
              <h2 style={{ margin: "0.25rem 0 0" }}>{t("demoCommercial.panelTitle", { label })}</h2>
            </div>
            <div className="system-page-actions">
              <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
                {t("vistaMockup.home")}
              </button>
              {isPlatformAdmin ? (
                <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>
                  {t("vistaMockup.platformAdmin")}
                </button>
              ) : null}
            </div>
          </div>
          <div className="mockup-page-frame">
            <Mockup />
          </div>
        </div>
      </section>
    </div>
  );
}
