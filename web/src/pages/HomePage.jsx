import { useMemo } from "react";
import { dakinisFormatBusinessTypeLabel } from "@dakinis/shared/catalog/business-type-display.js";
import { useDakinisSession } from "../context/SessionContext.jsx";
import {
  dakinisPackMvp,
  dakinisPackPro,
  dakinisPackAdvanced,
  dakinisMaintenanceTiers,
  dakinisMaintenancePitch,
  dakinisPricingIntro
} from "../data/pricingCatalog.js";

const logoGrande = "/Logo%20Grande.jpeg";

const DAKINIS_PACKS = [dakinisPackMvp, dakinisPackPro, dakinisPackAdvanced];

/** Sustituye por tu email y número WhatsApp (formato internacional sin + en wa.me). */
const DAKINIS_CONTACT_EMAIL = "hola@tudominio.com";
const DAKINIS_CONTACT_WA = "https://wa.me/34600000000";

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

export default function HomePage({ navigate, dakinisSystemRegistry }) {
  const { session } = useDakinisSession();

  const sistemaButtons = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (dakinisIsPlatformAdminSession(session)) return [];
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, dakinisSystemRegistry]);

  const vistaButtons = useMemo(() => {
    const all = Object.entries(dakinisSystemRegistry);
    if (!session?.token) return all;
    if (dakinisIsPlatformAdminSession(session)) return all;
    const tenantType = session.business?.type;
    if (tenantType) return all.filter(([key]) => key === tenantType);
    return all;
  }, [session, dakinisSystemRegistry]);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="kicker">FASE 2 - SaaS multi-tenant (SQLite MVP)</p>
            <h1>
              Menos cancelaciones.
              <br />
              Más clientes.
              <br />
              Más control.
            </h1>
            <p className="lead hero-benefit">
              Te ahorra tiempo, organiza tu negocio y evita errores en citas, pedidos y seguimiento — sin líos de
              spreadsheets.
            </p>
            <p className="lead">
              Demo técnica: cada negocio con su entorno aislado y login; lista para crecer contigo.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn">
                Solicitar presupuesto
              </a>
              <a href="#contact" className="btn btn-outline">
                Hablar sobre tu proyecto
              </a>
            </div>
            <p className="hero-actions-secondary">
              <button type="button" className="link-btn" onClick={() => navigate("/login")}>
                Login admin
              </button>
              <span className="hero-actions-dot">·</span>
              <a href="#modulos" className="link-btn">
                Ver sistemas demo
              </a>
            </p>
            <p className="lead">Stack: React + Node + SQLite (listo para PostgreSQL).</p>
          </div>
          <div className="hero-card">
            <img src={logoGrande} alt="Dakinis Scheduler + CRM + WhatsApp" className="hero-logo" />
            <ul>
              <li>
                Datos por <code>x-business-id</code> en API
              </li>
              <li>Mockups sincronizados con base de datos</li>
              <li>JWT + API key maestra solo desarrollo</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="modulos" className="modules">
        <div className="container">
          <h2>Tenants demo por tipo de negocio</h2>
          <p className="lead">
            Slugs seed: clinica-demo, peluqueria-demo, inmobiliaria-demo, restaurante-demo. API key
            desarrollo:&nbsp;
            <code>dakinis-dev-key</code>
          </p>
          {dakinisIsPlatformAdminSession(session) ? (
            <div className="system-switcher">
              <button type="button" className="system-btn active" onClick={() => navigate("/admin")}>
                Administración plataforma (negocios y usuarios)
              </button>
            </div>
          ) : (
            <div className="system-switcher">
              {sistemaButtons.map(([systemKey, systemInfo]) => (
                <button
                  key={systemKey}
                  type="button"
                  className="system-btn"
                  onClick={() => navigate(`/sistema/${encodeURIComponent(systemKey)}`)}
                >
                  {systemInfo.label}
                </button>
              ))}
            </div>
          )}
          {vistaButtons.length > 0 ? (
            <>
              <h3 style={{ marginTop: "1.75rem" }}>Vista previa del panel (mockup)</h3>
              <p className="lead">Maquetación estática de cómo podría verse el programa por tipo de negocio.</p>
              <div className="system-switcher">
                {vistaButtons.map(([systemKey, systemInfo]) => (
                  <button
                    key={`vista-${systemKey}`}
                    type="button"
                    className="system-btn"
                    onClick={() => navigate(`/vista/${encodeURIComponent(systemKey)}`)}
                  >
                    Vista · {systemInfo.label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {session?.token && session.business?.type && !dakinisIsPlatformAdminSession(session) ? (
            <p className="lead" style={{ marginTop: "0.75rem" }}>
              Sesión: solo ves tu tipo de negocio (
              <strong>
                {dakinisSystemRegistry[session.business.type]?.label ??
                  dakinisFormatBusinessTypeLabel(session.business.type)}
              </strong>
              ).
            </p>
          ) : null}
        </div>
      </section>

      <section id="precios" className="modules pricing-section pricing-contact-unified">
        <div className="container">
          <p className="kicker">Precios y siguiente paso</p>
          <h2>{dakinisPricingIntro.title}</h2>
          <p className="lead">{dakinisPricingIntro.subtitle}</p>
          <p className="lead portfolio-lead">{dakinisPricingIntro.portfolioNote}</p>
          <ul className="pricing-value-points">
            {dakinisPricingIntro.valuePoints.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="pack-grid">
            {DAKINIS_PACKS.map((pack) => (
              <article
                key={pack.key}
                className={`card pack-card${pack.featured ? " featured" : ""}`}
              >
                <p className="pack-badge">{pack.badge} — {pack.name}</p>
                <p className="pack-audience">{pack.audience}</p>
                <p className="price pack-price">{pack.priceRange}</p>
                <p className="pack-delivery">
                  <strong>Entrega:</strong> {pack.delivery}
                </p>
                <p className="pack-pitch">&ldquo;{pack.pitch}&rdquo;</p>
                <ul className="pack-includes">
                  {pack.includes.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <h3 className="maint-heading" id="mantenimiento">
            Mantenimiento mensual
          </h3>
          <p className="lead maint-sub">{dakinisMaintenancePitch}</p>
          <div className="maint-grid">
            {dakinisMaintenanceTiers.map((tier) => (
              <div key={tier.key} className="card price-card">
                <h3>{tier.name}</h3>
                <p className="price">{tier.price}</p>
                <p className="setup">{tier.description}</p>
              </div>
            ))}
          </div>

          <div id="contact" className="contact-unified">
            <h2>Hablemos</h2>
            <p className="lead contact-lead">
              Cuéntanos tu idea y te diremos cómo desarrollarla, cuánto costaría y cuánto tiempo llevaría.
            </p>
            <div className="contact-actions">
              <a href={`mailto:${DAKINIS_CONTACT_EMAIL}`} className="btn">
                Escribir por email
              </a>
              <a href={DAKINIS_CONTACT_WA} className="btn btn-outline" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="cta">
        <div className="container cta-card">
          <div>
            <h2>Dakinis One — demo técnica</h2>
            <p>Explora tenants demo, mockups y login JWT. Listo para Postgres y Stripe en siguiente fase.</p>
          </div>
          <button type="button" className="btn" onClick={() => navigate("/login")}>
            Entrar como admin
          </button>
          <a href="#modulos" className="btn btn-outline">
            Ver sistemas
          </a>
        </div>
      </section>
    </>
  );
}
