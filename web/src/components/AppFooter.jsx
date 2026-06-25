import { DAKINIS_MARKETING_SITE_URL } from "../config/product-urls.js";
import { DAKINIS_LOGO_SIMPLE } from "../config/brand-assets.js";
import { useLocale } from "../context/LocaleContext.jsx";
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
          <img src={DAKINIS_LOGO_SIMPLE} alt="Dakinis Systems" className="brand-icon" width={38} height={38} />
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
          <FooterRouteLink href="/cookies" navigate={navigate}>
            {t("footer.cookies")}
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/security" navigate={navigate}>
            {t("footer.security")}
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/sla" navigate={navigate}>
            {t("footer.sla")}
          </FooterRouteLink>
          <Sep />
          <FooterRouteLink href="/refunds" navigate={navigate}>
            {t("footer.refunds")}
          </FooterRouteLink>
          <Sep />
          <a
            href="/precios"
            className="site-footer-link"
            onClick={(e) => {
              e.preventDefault();
              navigate("/precios");
            }}
          >
            {t("footer.packages")}
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
