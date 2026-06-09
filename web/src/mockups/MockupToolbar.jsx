import { useLocale } from "../context/LocaleContext.jsx";

/** Barra superior de mockups — sin emails ni jerga técnica. */
export default function MockupToolbar({ title, badge, roleKey, extra, action }) {
  const { t } = useLocale();
  const roleLabel = roleKey ? t(`mockupPanels.roles.${roleKey}`) : null;

  return (
    <div className="mockup-toolbar">
      <div>
        <strong>{title}</strong>
        {badge ? (
          <span className="mockup-badge" style={{ marginLeft: "0.75rem" }}>
            {badge}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        {roleLabel ? <span className="mockup-user-pill">{roleLabel}</span> : null}
        <span className="mockup-badge mockup-badge--demo">{t("mockupPanels.demoBadge")}</span>
        {extra ? <span className="mockup-badge">{extra}</span> : null}
        {action}
      </div>
    </div>
  );
}
