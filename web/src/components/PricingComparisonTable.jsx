import { useLocale } from "../context/LocaleContext.jsx";

const DAKINIS_COMPARE_ROW_KEYS = [
  "crm",
  "agenda",
  "reservations",
  "inventory",
  "whatsapp",
  "analytics",
  "ai",
  "automations"
];

const DAKINIS_PLAN_COLUMNS = ["starter", "growth", "pro"];

function PricingCompareCell({ included, t }) {
  return (
    <td className={`pricing-compare__cell${included ? " pricing-compare__cell--yes" : " pricing-compare__cell--no"}`}>
      <span aria-hidden>{included ? "✓" : "—"}</span>
      <span className="sr-only">{included ? t("pricing.compare.included") : t("pricing.compare.notIncluded")}</span>
    </td>
  );
}

export default function PricingComparisonTable() {
  const { t } = useLocale();
  const rows = t("pricing.compare.rows");
  const rowMeta = typeof rows === "object" && rows !== null && !Array.isArray(rows) ? rows : {};

  return (
    <div className="pricing-section-block">
      <h3 className="maint-heading">{t("pricing.compare.title")}</h3>
      <p className="lead maint-sub">{t("pricing.compare.lead")}</p>
      <div className="pricing-compare__scroll">
        <table className="pricing-compare__table">
          <thead>
            <tr>
              <th scope="col">{t("pricing.compare.featureCol")}</th>
              {DAKINIS_PLAN_COLUMNS.map((plan) => (
                <th key={plan} scope="col">
                  {t(`pricing.bos.plans.${plan}.name`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAKINIS_COMPARE_ROW_KEYS.map((key) => {
              const row = rowMeta[key];
              if (!row) return null;
              return (
                <tr key={key}>
                  <th scope="row">{row.label}</th>
                  <PricingCompareCell included={Boolean(row.starter)} t={t} />
                  <PricingCompareCell included={Boolean(row.growth)} t={t} />
                  <PricingCompareCell included={Boolean(row.pro)} t={t} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
