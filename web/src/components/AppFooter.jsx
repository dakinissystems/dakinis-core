import { DAKINIS_MARKETING_SITE_URL } from "../config/marketing.js";
import { dakinisGoHomeAnchor } from "../utils/homeAnchors.js";

const logoSimple = "/Logo%20Simple.jpeg";

function Sep() {
  return (
    <span className="site-footer-sep" aria-hidden>
      ·
    </span>
  );
}

function FooterRouteLink({ href, navigate, children }) {
  return (
    <a
      href={href}
      className="site-footer-link"
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

export default function AppFooter({ navigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <a href={DAKINIS_MARKETING_SITE_URL} className="site-footer-brand">
          <img src={logoSimple} alt="Dakinis Systems" className="brand-icon" width={38} height={38} />
          <span>Dakinis One</span>
        </a>

        <p className="site-footer-copyright">
          © {year} Dakinis Systems (trading name of Christian Villar). All rights reserved.
        </p>

        <nav className="site-footer-links" aria-label="Pie de página">
          <FooterRouteLink href="/faq" navigate={navigate}>
            FAQ
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/privacy" navigate={navigate}>
            Privacy
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/terms" navigate={navigate}>
            Terms
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/legal" navigate={navigate}>
            Legal notice
          </FooterRouteLink>
          <Sep />
          <a
            href="/#precios"
            className="site-footer-link"
            onClick={(e) => {
              e.preventDefault();
              dakinisGoHomeAnchor(navigate, "precios");
            }}
          >
            Paquetes
          </a>
          <Sep />
          <a
            href="/#contact"
            className="site-footer-link"
            onClick={(e) => {
              e.preventDefault();
              dakinisGoHomeAnchor(navigate, "contact");
            }}
          >
            Contacto
          </a>
          <Sep />
          <a
            href="/login"
            className="site-footer-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Acceso
          </a>
        </nav>
      </div>
    </footer>
  );
}
