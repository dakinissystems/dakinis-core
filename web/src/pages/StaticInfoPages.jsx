function LegalShell({ navigate, title, children }) {
  return (
    <div className="container legal-page">
      <p className="legal-back">
        <button type="button" className="link-btn" onClick={() => navigate("/")}>
          ← Inicio
        </button>
      </p>
      <h1>{title}</h1>
      <div className="legal-prose">{children}</div>
    </div>
  );
}

export function FaqPage({ navigate }) {
  return (
    <LegalShell navigate={navigate} title="FAQ">
      <p>
        Preguntas frecuentes sobre Dakinis One. Este contenido se ampliará; si necesitas ayuda concreta, usa la sección
        de contacto en la página principal.
      </p>
    </LegalShell>
  );
}

export function PrivacyPage({ navigate }) {
  return (
    <LegalShell navigate={navigate} title="Privacy">
      <p>
        Información sobre el tratamiento de datos personales en el uso de esta aplicación. Texto legal completo en
        preparación; para ejercer derechos ARCO o consultas de privacidad, contacta a través de los canales indicados en
        el sitio corporativo de Dakinis Systems.
      </p>
    </LegalShell>
  );
}

export function TermsPage({ navigate }) {
  return (
    <LegalShell navigate={navigate} title="Terms">
      <p>
        Términos y condiciones de uso del servicio. Borrador; el uso de la demo y entornos de prueba queda sujeto a lo
        acordado por escrito en cada proyecto.
      </p>
    </LegalShell>
  );
}

export function LegalNoticePage({ navigate }) {
  return (
    <LegalShell navigate={navigate} title="Legal notice">
      <p>
        Aviso legal e información del titular del sitio y del servicio. Dakinis Systems (nombre comercial de Christian
        Villar). Detalle de datos registrales y normativa aplicable: en actualización.
      </p>
    </LegalShell>
  );
}
