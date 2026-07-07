export default function SettingsOnboardingCard({ onboarding, onComplete }) {
  if (!onboarding || onboarding.completed) return null;

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>{onboarding.title || "Onboarding"}</h3>
      <ol>
        {(onboarding.steps || []).map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <button type="button" className="btn" onClick={onComplete}>
        Marcar onboarding completado
      </button>
    </div>
  );
}
