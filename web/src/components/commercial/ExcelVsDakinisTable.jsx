import { useLocale } from "../../context/LocaleContext.jsx";

export default function ExcelVsDakinisTable() {
  const { t } = useLocale();
  const rows = t("commercial.excelCompare.rows") || [];

  return (
    <section className="commercial-compare">
      <p className="kicker">{t("commercial.excelCompare.kicker")}</p>
      <h3 style={{ margin: "0.25rem 0 0.5rem" }}>{t("commercial.excelCompare.title")}</h3>
      <p className="lead" style={{ fontSize: "0.95rem", marginTop: 0 }}>
        {t("commercial.excelCompare.lead")}
      </p>

      <div className="commercial-compare__table-wrap">
        <table className="mockup-table commercial-compare__table">
          <thead>
            <tr>
              <th>{t("commercial.excelCompare.colExcel")}</th>
              <th>{t("commercial.excelCompare.colDakinis")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.excel}>
                <td className="commercial-compare__excel">{row.excel}</td>
                <td className="commercial-compare__dakinis">{row.dakinis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
