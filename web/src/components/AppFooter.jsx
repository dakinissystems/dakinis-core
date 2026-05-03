import { DAKINIS_MARKETING_SITE_URL } from "../config/marketing.js";
import { useLocale } from "../context/LocaleContext.jsx";
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
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <a href={DAKINIS_MARKETING_SITE_URL} className="site-footer-brand">
          <img src={logoSimple} alt="Dakinis Systems" className="brand-icon" width={38} height={38} />
          <span>Dakinis One</span>
        </a>

        <p className="site-footer-copyright">{t("footer.copyright", { year })}</p>

        <nav className="site-footer-links" aria-label={t("footer.navAria")}>
          <FooterRouteLink href="/faq" navigate={navigate}>
            {t("footer.faq")}
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/privacy" navigate={navigate}>
            {t("footer.privacy")}
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/terms" navigate={navigate}>
            {t("footer.terms")}
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/legal" navigate={navigate}>
            {t("footer.legalNotice")}
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
            {t("footer.packages")}
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
            {t("footer.contact")}
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
            {t("footer.access")}
          </a>
        </nav>
      </div>
    </footer>
  );
}
