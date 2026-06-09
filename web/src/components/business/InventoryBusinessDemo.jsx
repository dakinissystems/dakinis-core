import { useLocale } from "../../context/LocaleContext.jsx";
import { DAKINIS_INVENTORY_DEMO_PRODUCTS } from "../../data/businessDemoContent.js";

export default function InventoryBusinessDemo() {
  const { t } = useLocale();

  return (
    <div className="inventory-business-demo">
      <div className="inventory-business-demo__summary">
        <article className="card">
          <p className="kpi-label">{t("businessDemo.inventory.totalProducts")}</p>
          <p className="kpi-value">523</p>
        </article>
        <article className="card">
          <p className="kpi-label">{t("businessDemo.inventory.lowStock")}</p>
          <p className="kpi-value">7</p>
        </article>
        <article className="card">
          <p className="kpi-label">{t("businessDemo.inventory.expiring")}</p>
          <p className="kpi-value">3</p>
        </article>
      </div>

      <div className="card inventory-business-demo__table-wrap">
        <table className="inventory-business-demo__table">
          <thead>
            <tr>
              <th>{t("businessDemo.inventory.colProduct")}</th>
              <th>{t("businessDemo.inventory.colSku")}</th>
              <th>{t("businessDemo.inventory.colStock")}</th>
              <th>{t("businessDemo.inventory.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {DAKINIS_INVENTORY_DEMO_PRODUCTS.map((row) => (
              <tr key={row.sku}>
                <td>{row.name}</td>
                <td>{row.sku}</td>
                <td>
                  {row.stock} {row.unit}
                </td>
                <td>
                  <span className={`inventory-status inventory-status--${row.status}`}>
                    {t(`businessDemo.inventory.status.${row.status}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
