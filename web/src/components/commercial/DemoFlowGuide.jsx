import { useLocale } from "../../context/LocaleContext.jsx";

export default function DemoFlowGuide({ verticalKey }) {
  const { t } = useLocale();
  const flows = t("commercial.flows") || {};
  const flow = flows[verticalKey];
  if (!flow) return null;

  return (
    <section className="commercial-flow">
      <p className="kicker">{t("commercial.flow.kicker")}</p>
      <h3 style={{ margin: "0.25rem 0 0.5rem" }}>{flow.title}</h3>
      <p className="lead" style={{ fontSize: "0.95rem", marginTop: 0 }}>
        {flow.lead}
      </p>
      <ol className="commercial-flow__steps">
        {(flow.steps || []).map((step, index) => (
          <li key={step} className="commercial-flow__step">
            <span className="commercial-flow__num">{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
