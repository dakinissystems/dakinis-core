export default function SettingsAdoptionCard({ adoption, adoptionScores, businessValueScores }) {
  const scores = Array.isArray(adoptionScores) ? adoptionScores : [];
  const valueScores = Array.isArray(businessValueScores) ? businessValueScores : [];
  const hasData = adoption?.totals?.sessions > 0 || scores.length > 0 || valueScores.length > 0;
  if (!hasData) return null;

  return (
    <div className="card" style={{ marginTop: "1rem" }}>
      <h3>Adopción y valor (30 días)</h3>
      {adoption?.totals ? (
        <p className="lead">
          {adoption.totals.sessions} sesiones · {adoption.totals.featuresUsed} pantallas ·{" "}
          {adoption.totals.totalMinutes} min totales
        </p>
      ) : null}
      {scores.filter((r) => r.scorePct > 0).length > 0 ? (
        <>
          <h4>Adoption Score</h4>
          <p className="lead">Tiempo en pantalla — qué abren y cuánto permanecen.</p>
          <ul>
            {scores
              .filter((r) => r.scorePct > 0)
              .slice(0, 6)
              .map((row) => (
                <li key={row.module}>
                  <strong>{row.label}</strong>: {row.scorePct}%
                  {row.sessions > 0 ? ` · ${row.sessions} visitas` : ""}
                </li>
              ))}
          </ul>
        </>
      ) : null}
      {valueScores.filter((r) => r.scorePct > 0).length > 0 ? (
        <>
          <h4>Business Value Score</h4>
          <p className="lead">Acciones reales — contactos, mensajes, deals, IA.</p>
          <ul>
            {valueScores
              .filter((r) => r.scorePct > 0)
              .slice(0, 6)
              .map((row) => (
                <li key={row.module}>
                  <strong>{row.label}</strong>: {row.scorePct}%
                </li>
              ))}
          </ul>
        </>
      ) : null}
      {(adoption?.byFeature || []).length > 0 ? (
        <ul>
          {(adoption.byFeature || []).slice(0, 4).map((row) => (
            <li key={row.feature}>
              {row.feature}: {row.sessions} visitas, ~{row.avgSeconds}s
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
