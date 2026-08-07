import { useLocale } from "../context/LocaleContext.jsx";

/**
 * Cabecera mínima de operación (TPV).
 * @param {{
 *   businessName: string,
 *   open?: boolean,
 *   stats?: Array<{ label: string, value: string|number }>,
 *   statuses?: Array<{ id: string, label: string, tone: 'ok'|'warn'|'down'|'idle' }>,
 *   crumb?: string,
 *   quickActions?: Array<{ id: string, label: string, onClick: () => void }>,
 *   onShowCommercial?: () => void,
 *   showCommercialLink?: boolean
 * }} props
 */
export default function RestaurantOpsHeader({
  businessName,
  open = true,
  stats = [],
  statuses = [],
  crumb = "",
  quickActions = [],
  onShowCommercial,
  showCommercialLink = false
}) {
  const { t } = useLocale();

  return (
    <header className="restaurant-ops-header restaurant-ops-header--minimal">
      <div className="restaurant-ops-header__row">
        <div className="restaurant-ops-header__identity">
          <span
            className={`restaurant-ops-header__live${open ? " is-open" : " is-closed"}`}
            title={open ? t("restaurant.opsOpen") : t("restaurant.opsClosed")}
            aria-label={open ? t("restaurant.opsOpen") : t("restaurant.opsClosed")}
          />
          <h2 className="restaurant-ops-header__title">{businessName}</h2>
          {crumb ? <span className="restaurant-ops-header__crumb-inline">{crumb}</span> : null}
        </div>
        <div className="restaurant-ops-header__aside">
          {statuses.length > 0 ? (
            <ul className="restaurant-ops-header__statuses" aria-label={t("restaurant.opsStatuses")}>
              {statuses.map((s) => (
                <li key={s.id} title={s.label} className={`is-${s.tone}`}>
                  <span className="restaurant-ops-header__status-dot" aria-hidden="true" />
                  <span className="sr-only">{s.label}</span>
                  <span className="restaurant-ops-header__status-label">{s.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {showCommercialLink && onShowCommercial ? (
            <button type="button" className="btn btn-outline restaurant-ops-header__demo" onClick={onShowCommercial}>
              {t("restaurant.opsShowCommercial")}
            </button>
          ) : null}
        </div>
      </div>

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

      {quickActions.length > 0 ? (
        <div className="restaurant-ops-header__quick" role="group" aria-label={t("restaurant.opsQuickActions")}>
          {quickActions.map((a) => (
            <button key={a.id} type="button" className="btn btn-outline" onClick={a.onClick}>
              {a.label}
            </button>
          ))}
        </div>
      ) : null}
    </header>
  );
}
