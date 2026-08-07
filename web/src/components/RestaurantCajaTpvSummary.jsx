import { useLocale } from "../context/LocaleContext.jsx";

/**
 * Resumen TPV encima de cierre/facturas.
 */
export default function RestaurantCajaTpvSummary({ dayClose, onJumpCierre }) {
  const { t } = useLocale();
  if (!dayClose) return null;

  const byPayment = Array.isArray(dayClose.byPayment) ? dayClose.byPayment : [];
  const total = dayClose.grandTotal ?? dayClose.cashTotal ?? dayClose.total ?? null;
  const orderCount = dayClose.closed?.length ?? dayClose.orderCount ?? dayClose.orders ?? "—";

  return (
    <article className="card restaurant-caja-tpv" style={{ marginBottom: "0.75rem" }}>
      <h4 style={{ marginTop: 0 }}>{t("restaurant.cajaTpvTitle")}</h4>
      <ul className="restaurant-caja-tpv__stats">
        <li>
          <span className="restaurant-caja-tpv__value">{orderCount}</span>
          <span className="restaurant-caja-tpv__label">{t("restaurant.cajaTpvOrders")}</span>
        </li>
        <li>
          <span className="restaurant-caja-tpv__value">
            {total != null ? `${Number(total).toFixed(2)} €` : "—"}
          </span>
          <span className="restaurant-caja-tpv__label">{t("restaurant.cajaTpvCash")}</span>
        </li>
      </ul>
      {byPayment.length > 0 ? (
        <ul className="kpi-label" style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
          {byPayment.map((row) => (
            <li key={row.label || row.method}>
              {row.label || row.method}: <strong>{Number(row.total ?? row.amount ?? 0).toFixed(2)} €</strong>
              {row.count != null ? ` · ${row.count}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      {onJumpCierre ? (
        <button type="button" className="btn" style={{ marginTop: "0.75rem" }} onClick={onJumpCierre}>
          {t("restaurant.cajaTpvClose")}
        </button>
      ) : null}
    </article>
  );
}
