import { useRestaurantStockSection } from "../hooks/useRestaurantStockSection.js";
import {
  RestaurantStockAllergenSection,
  RestaurantStockInventoryGrid,
  RestaurantStockProductionHistory,
  RestaurantStockScanPanel
} from "./RestaurantStockBody.jsx";
import RestaurantScanToast from "./RestaurantScanToast.jsx";

export default function RestaurantStockSection(props) {
  const { parts, compact = false, autoFocusScan = false, showScanToast = false } = props;
  const stock = useRestaurantStockSection(props);
  const showAll = !parts || parts.length === 0;
  const show = (id) => showAll || parts.includes(id);

  if (!stock.kitchen) {
    if (stock.error) {
      return (
        <section style={{ marginTop: compact ? "0.75rem" : "2rem" }}>
          {!compact ? <h3>{stock.t("kitchen.title")}</h3> : null}
          <p className="lead" style={{ color: "var(--dakinis-warning)" }}>
            {stock.error}
          </p>
          <p className="kpi-label">{stock.t("kitchen.loadErrorAlertHint")}</p>
          <button
            type="button"
            className="btn"
            disabled={stock.busy}
            onClick={() => stock.reload(undefined)}
          >
            {stock.t("kitchen.retry")}
          </button>
        </section>
      );
    }
    return (
      <p className="lead" style={{ marginTop: "1rem" }}>
        {stock.t("kitchen.loading")}
      </p>
    );
  }

  const { t, leadKey, error, kitchen, dateLocale, scanMessage } = stock;
  const toastTone =
    scanMessage && /error|invalid|no |unknown|desconoc/i.test(scanMessage) ? "warn" : "ok";

  return (
    <section
      style={{ marginTop: compact ? "0.75rem" : "2rem" }}
      className={compact ? "restaurant-stock--compact" : undefined}
    >
      {!compact ? (
        <>
          <h3>{t("kitchen.title")}</h3>
          <p className="lead">{t(leadKey)}</p>
        </>
      ) : null}
      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      {showScanToast ? <RestaurantScanToast message={scanMessage} tone={toastTone} /> : null}

      {show("scan") ? <RestaurantStockScanPanel {...stock} autoFocus={autoFocusScan} /> : null}
      {show("grid") ? <RestaurantStockInventoryGrid {...stock} kitchen={kitchen} /> : null}
      {show("production") ? (
        <RestaurantStockProductionHistory t={t} kitchen={kitchen} dateLocale={dateLocale} />
      ) : null}
      {show("allergens") ? (
        <RestaurantStockAllergenSection
          apiSession={stock.apiSession}
          fetchOpts={stock.fetchOpts}
          kitchen={kitchen}
          reload={stock.reload}
          busy={stock.busy}
          setBusy={stock.setBusy}
          setError={stock.setError}
        />
      ) : null}
    </section>
  );
}
