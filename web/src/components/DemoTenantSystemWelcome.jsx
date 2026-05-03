import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { useLocale } from "../context/LocaleContext.jsx";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

export default function DemoTenantSystemWelcome({ activeSystemKey, session, navigate }) {
  const { t } = useLocale();
  const label = dakinisSystemRegistry[activeSystemKey]?.label ?? activeSystemKey;
  const vKey = dakinisSystemRegistry[activeSystemKey] ? activeSystemKey : "clinica";
  const headline = t(`systemDemo.verticals.${vKey}.headline`);
  const lead = t(`systemDemo.verticals.${vKey}.lead`);
  const benefits = t(`systemDemo.verticals.${vKey}.benefits`);
  const list = Array.isArray(benefits) ? benefits : [];

  return (
    <article className="demo-tenant-welcome card">
      <div className="demo-tenant-welcome-header">
        <p className="demo-tenant-welcome-badge">{t("systemDemo.badge")}</p>
        <p className="demo-tenant-welcome-account">
          {t("systemDemo.accountLine", { email: session.user.email })}
        </p>
      </div>
      <h3 className="demo-tenant-welcome-title">{headline}</h3>
      <p className="lead demo-tenant-welcome-lead">{lead}</p>
      <p className="lead demo-tenant-welcome-password">
        {t("systemDemo.passwordLabel")} <code className="config-box">demo123</code>
      </p>
      <p className="demo-tenant-benefits-title">{t("systemDemo.benefitsTitle")}</p>
      <ul className="demo-tenant-benefits">
        {list.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div className="demo-tenant-welcome-actions">
        <button type="button" className="btn demo-tenant-welcome-cta" onClick={() => navigate(`/vista/${encodeURIComponent(activeSystemKey)}`)}>
          {t("systemDemo.mockupPrimary", { label })}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate("/")}>
          {t("systemDemo.toHome")}
        </button>
      </div>
      <p className="lead demo-tenant-welcome-foot">{t("systemDemo.functionalHint")}</p>
    </article>
  );
}
