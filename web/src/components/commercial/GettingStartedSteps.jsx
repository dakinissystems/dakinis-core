import { useLocale } from "../../context/LocaleContext.jsx";

export default function GettingStartedSteps() {
  const { t } = useLocale();
  const steps = t("productHome.gettingStarted.steps");
  const stepList = Array.isArray(steps) ? steps : [];

  return (
    <section className="getting-started" aria-labelledby="getting-started-title">
      <p className="kicker">{t("productHome.gettingStarted.kicker")}</p>
      <h2 id="getting-started-title">{t("productHome.gettingStarted.title")}</h2>
      <p className="lead getting-started__lead">{t("productHome.gettingStarted.lead")}</p>

      <ol className="getting-started__flow">
        {stepList.map((step, index) => (
          <li key={step.title} className="getting-started__step">
            <div className="getting-started__step-card card">
              <span className="getting-started__step-num">{index + 1}</span>
              <h3 className="getting-started__step-title">{step.title}</h3>
              {step.text ? <p className="getting-started__step-text">{step.text}</p> : null}
            </div>
            {index < stepList.length - 1 ? (
              <span className="getting-started__arrow" aria-hidden="true">
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <p className="getting-started__timeline">{t("productHome.gettingStarted.timeline")}</p>
      <ul className="getting-started__reassurance">
        {(t("productHome.gettingStarted.reassurance") || []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
