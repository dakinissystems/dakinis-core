export default function SettingsOnboardingCard({ onboarding, onComplete, onSkipStep, navigate }) {
  if (!onboarding || onboarding.completed) return null;

  const steps = Array.isArray(onboarding.steps) ? onboarding.steps : [];

  function openStep(step) {
    if (!step?.href) return;
    if (step.external) {
      window.open(step.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (typeof navigate === "function") navigate(step.href);
    else window.location.assign(step.href);
  }

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3 style={{ marginTop: 0 }}>{onboarding.title || "Pon en marcha tu negocio"}</h3>
      <p className="lead" style={{ marginBottom: "0.75rem" }}>
        {onboarding.completedCount || 0}/{onboarding.total || steps.length} listos
      </p>
      <ol style={{ paddingLeft: "1.2rem", margin: 0 }}>
        {steps.map((step) => (
          <li key={step.id} style={{ marginBottom: "0.65rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <strong>
                {step.done ? "✓ " : ""}
                {step.label}
              </strong>
              {step.detail ? <span className="muted">{step.detail}</span> : null}
            </div>
            {!step.done ? (
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.35rem" }}>
                <button type="button" className="btn" onClick={() => openStep(step)}>
                  Ir
                </button>
                {typeof onSkipStep === "function" ? (
                  <button type="button" className="btn btn-outline" onClick={() => onSkipStep(step.id)}>
                    Más tarde
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-outline" style={{ marginTop: "0.75rem" }} onClick={onComplete}>
        Marcar onboarding completado
      </button>
    </div>
  );
}
