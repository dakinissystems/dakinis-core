import { useLocale } from "../context/LocaleContext.jsx";

/**
 * Cabecera compacta de operación (sin marketing).
 * @param {{
 *   businessName: string,
 *   openLabel?: string,
 *   stats?: Array<{ label: string, value: string|number }>,
 *   breadcrumb?: string[],
 *   onShowCommercial?: () => void,
 *   showCommercialLink?: boolean
 * }} props
 */
export default function RestaurantOpsHeader({
  businessName,
  openLabel,
  stats = [],
  breadcrumb = [],
  onShowCommercial,
  showCommercialLink = false
}) {
  const { t } = useLocale();

  return (
    <header className="restaurant-ops-header">
      <div className="restaurant-ops-header__row">
        <div className="restaurant-ops-header__identity">
          <h2 className="restaurant-ops-header__title">{businessName}</h2>
          {openLabel ? (
            <span className="restaurant-ops-header__status">{openLabel}</span>
          ) : (
            <span className="restaurant-ops-header__status">{t("restaurant.opsOpen")}</span>
          )}
        </div>
        {showCommercialLink && onShowCommercial ? (
          <button type="button" className="btn btn-outline restaurant-ops-header__demo" onClick={onShowCommercial}>
            {t("restaurant.opsShowCommercial")}
          </button>
        ) : null}
      </div>
      {breadcrumb.length > 0 ? (
        <p className="restaurant-ops-header__crumb" aria-label={t("restaurant.opsBreadcrumb")}>
          {breadcrumb.map((part, i) => (
            <span key={`${part}-${i}`}>
              {i > 0 ? <span className="restaurant-ops-header__crumb-sep"> › </span> : null}
              <span className={i === breadcrumb.length - 1 ? "is-current" : undefined}>{part}</span>
            </span>
          ))}
        </p>
      ) : null}
      {stats.length > 0 ? (
        <ul className="restaurant-ops-header__stats">
          {stats.map((s) => (
            <li key={s.label}>
              <span className="restaurant-ops-header__stat-value">{s.value}</span>
              <span className="restaurant-ops-header__stat-label">{s.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
