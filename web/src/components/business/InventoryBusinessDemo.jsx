import { useLocale } from "../../context/LocaleContext.jsx";
import { DAKINIS_INVENTORY_DEMO_PRODUCTS } from "../../data/businessDemoContent.js";
import BusinessDemoOptionsMenu from "./BusinessDemoOptionsMenu.jsx";

const DAKINIS_INVENTORY_SUMMARY = [
  { key: "totalProducts", value: "523", trendKey: "businessDemo.inventory.trends.total" },
  { key: "lowStock", value: "7", trendKey: "businessDemo.inventory.trends.low" },
  { key: "expiring", value: "3", trendKey: "businessDemo.inventory.trends.expiring" }
];

export default function InventoryBusinessDemo() {
  const { t } = useLocale();

  return (
    <div className="inventory-business-demo">
      <div className="inventory-business-demo__summary">
        {DAKINIS_INVENTORY_SUMMARY.map((item) => (
          <article key={item.key} className="card commercial-kpi-card commercial-kpi-card--inventory">
            <p className="kpi-label">{t(`businessDemo.inventory.${item.key}`)}</p>
            <p className="kpi-value">{item.value}</p>
            <p className="commercial-kpi-card__trend">{t(item.trendKey)}</p>
          </article>
        ))}
      </div>

      <div className="card inventory-business-demo__table-wrap">
        <header className="inventory-business-demo__head">
          <div>
            <h3>{t("businessDemo.inventory.tableTitle")}</h3>
            <p className="kpi-label">{t("businessDemo.inventory.tableLead")}</p>
          </div>
          <BusinessDemoOptionsMenu context="inventory" subjectName={t("businessDemo.inventory.tableSubject")} />
        </header>
        <div className="inventory-business-demo__table-scroll">
          <table className="inventory-business-demo__table">
            <thead>
              <tr>
                <th>{t("businessDemo.inventory.colProduct")}</th>
                <th>{t("businessDemo.inventory.colSku")}</th>
                <th>{t("businessDemo.inventory.colStock")}</th>
                <th>{t("businessDemo.inventory.colStatus")}</th>
                <th className="inventory-business-demo__actions-col" aria-label={t("businessDemo.options.moreAria")} />
              </tr>
            </thead>
            <tbody>
              {DAKINIS_INVENTORY_DEMO_PRODUCTS.map((row) => (
                <tr key={row.sku}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>
                    <code className="inventory-business-demo__sku">{row.sku}</code>
                  </td>
                  <td>
                    {row.stock} {row.unit}
                  </td>
                  <td>
                    <span className={`inventory-status inventory-status--${row.status}`}>
                      {t(`businessDemo.inventory.status.${row.status}`)}
                    </span>
                  </td>
                  <td className="inventory-business-demo__actions-col">
                    <BusinessDemoOptionsMenu context="inventory" subjectName={row.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
