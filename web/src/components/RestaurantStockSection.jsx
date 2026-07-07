import { useRestaurantStockSection } from "../hooks/useRestaurantStockSection.js";
import {
  RestaurantStockAllergenSection,
  RestaurantStockInventoryGrid,
  RestaurantStockProductionHistory,
  RestaurantStockScanPanel
} from "./RestaurantStockBody.jsx";

export default function RestaurantStockSection(props) {
  const stock = useRestaurantStockSection(props);

  if (!stock.kitchen) {
    return (
      <p className="lead" style={{ marginTop: "1rem" }}>
        {stock.t("kitchen.loading")}
      </p>
    );
  }

  const { t, leadKey, error, kitchen, dateLocale } = stock;

  return (
    <section style={{ marginTop: "2rem" }}>
      <h3>{t("kitchen.title")}</h3>
      <p className="lead">{t(leadKey)}</p>
      {error ? (
        <p className="lead" style={{ color: "#fdba74" }}>
          {error}
        </p>
      ) : null}

      <RestaurantStockScanPanel {...stock} />
      <RestaurantStockInventoryGrid {...stock} kitchen={kitchen} />
      <RestaurantStockProductionHistory t={t} kitchen={kitchen} dateLocale={dateLocale} />
      <RestaurantStockAllergenSection
        apiSession={stock.apiSession}
        fetchOpts={stock.fetchOpts}
        kitchen={kitchen}
        reload={stock.reload}
        busy={stock.busy}
        setBusy={stock.setBusy}
        setError={stock.setError}
      />
    </section>
  );
}
