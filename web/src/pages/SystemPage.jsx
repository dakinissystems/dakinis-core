import { useSystemPage } from "../hooks/useSystemPage.js";
import {
  SystemPageHeader,
  SystemPageModulesFooter,
  SystemPageRecordsSection,
  SystemPageRestauranteSection,
  SystemPageSuppliersSection,
  SystemPageWorkflowSection
} from "../components/SystemPageSections.jsx";

export default function SystemPage({ activeSystemKey, navigate }) {
  const page = useSystemPage(activeSystemKey);

  if (page.isRestaurantOps) {
    return (
      <section className="modules restaurant-ops-page">
        <div className="container restaurant-ops-page__container">
          <SystemPageRestauranteSection {...page} />
          {page.showDemoWelcome ? (
            <p className="kpi-label" style={{ marginTop: "1.5rem" }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
                {page.t("system.home")}
              </button>
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="modules">
      <div className="container">
        <SystemPageHeader {...page} navigate={navigate} />
        {page.showCommercialChrome && activeSystemKey === "restaurante" ? (
          <p className="lead">
            <button type="button" className="btn" onClick={page.closeCommercialMode}>
              {page.t("restaurant.opsBackToWork")}
            </button>
          </p>
        ) : null}
        <SystemPageWorkflowSection t={page.t} activeSystemKey={activeSystemKey} systemPageContent={page.systemPageContent} />
        <SystemPageSuppliersSection {...page} />
        <SystemPageRestauranteSection {...page} />
        <SystemPageRecordsSection {...page} />
        <SystemPageModulesFooter
          t={page.t}
          selectedSystem={page.selectedSystem}
          systemPageContent={page.systemPageContent}
          activeSystemKey={activeSystemKey}
          navigate={navigate}
        />
      </div>
    </section>
  );
}
