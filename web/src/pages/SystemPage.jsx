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

  return (
    <section className="modules">
      <div className="container">
        <SystemPageHeader {...page} navigate={navigate} />
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
