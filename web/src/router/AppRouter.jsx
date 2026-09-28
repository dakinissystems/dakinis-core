import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Suspense, useEffect } from "react";
import AppTopBar from "../components/AppTopBar.jsx";
import AppFooter from "../components/AppFooter.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { useDakinisLogout } from "../hooks/useDakinisLogout.js";
import { useDakinisFeatureTelemetry } from "../hooks/useDakinisFeatureTelemetry.js";
import { DAKINIS_AUTH_EXPIRED_EVENT } from "../services/auth-events.js";
import ProductHomePage from "../pages/ProductHomePage.jsx";
import PricingPage from "../pages/PricingPage.jsx";
import HubPage from "../pages/HubPage.jsx";
import EcosystemLaunchPage from "../pages/EcosystemLaunchPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import PlatformAdminPage from "../pages/PlatformAdminPage.jsx";
import CheckoutSuccessPage from "../pages/CheckoutSuccessPage.jsx";
import DesMotionPage from "../pages/DesMotionPage.jsx";
import DesPatternsPage from "../pages/DesPatternsPage.jsx";
import DesThemePage from "../pages/DesThemePage.jsx";
import DesIndexPage from "../pages/DesIndexPage.jsx";
import {
  FaqPage,
  LegalNoticePage,
  PrivacyPage,
  SecurityPage,
  SlaPage,
  TermsPage,
  CookiesPage,
  RefundsPage
} from "../pages/StaticInfoPages.jsx";
import {
  DashboardPage,
  CrmPage,
  VentasPage,
  InventarioPage,
  ReportesPage,
  WhatsappHubPage,
  SettingsPage,
} from "../modules/lazy-pages.js";
import LegacyPathRoutes from "./LegacyPathRoutes.jsx";
import ClientPortalPage from "../pages/ClientPortalPage.jsx";
import AppGuard from "../components/AppGuard.jsx";
import BillingAccessBanner from "../components/BillingAccessBanner.jsx";
import { useBillingSessionRefresh } from "../hooks/useBillingSessionRefresh.js";
import DakinisCommandPaletteProvider from "../components/experience/DakinisCommandPaletteProvider.jsx";
import DraggableWhatsappButton from "../components/DraggableWhatsappButton.jsx";
import { dakinisShouldShowPublicWhatsappFab } from "../utils/publicWhatsappFabVisibility.js";
import { dakinisIsPlatformAdminSession } from "../utils/businessDemoMode.js";

function AppRouteFallback() {
  return (
    <div className="app-route-fallback" role="status" aria-live="polite" style={{ padding: "2rem", opacity: 0.7 }}>
      Cargando…
    </div>
  );
}

function withAppGuard(Page) {
  return function GuardedAppPage({ navigate }) {
    return (
      <AppGuard>
        <Suspense fallback={<AppRouteFallback />}>
          <Page navigate={navigate} />
        </Suspense>
      </AppGuard>
    );
  };
}

const GuardedDashboard = withAppGuard(DashboardPage);
const GuardedCrm = withAppGuard(CrmPage);
const GuardedVentas = withAppGuard(VentasPage);
const GuardedInventario = withAppGuard(InventarioPage);
const GuardedReportes = withAppGuard(ReportesPage);
const GuardedWhatsapp = withAppGuard(WhatsappHubPage);
const GuardedSettings = withAppGuard(SettingsPage);

function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useDakinisSession();
  const signOut = useDakinisLogout();
  useBillingSessionRefresh();

  const navigateCompat = (pathname) => navigate(pathname);

  const showWhatsappFab = dakinisShouldShowPublicWhatsappFab(location.pathname);

  return (
    <DesAppShell
      product="core"
      theme="auto"
      layout="stack"
      className="app-shell"
      header={
        <>
          <AppTopBar
            navigate={navigateCompat}
            session={session}
            onSignOut={signOut}
            currentPath={location.pathname}
          />
          <BillingAccessBanner />
        </>
      }
      footer={<AppFooter navigate={navigateCompat} />}
    >
      {children}
      <DakinisCommandPaletteProvider />
      {showWhatsappFab ? <DraggableWhatsappButton /> : null}
    </DesAppShell>
  );
}

function AdminGuard({ children }) {
  const { session } = useDakinisSession();
  if (!session?.token || !dakinisIsPlatformAdminSession(session)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { session } = useDakinisSession();
  const signOut = useDakinisLogout();
  const { t, locale } = useLocale();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/login") document.title = t("doc.login");
    else if (path === "/faq") document.title = t("doc.faq");
    else if (path === "/privacy") document.title = t("doc.privacy");
    else if (path === "/terms") document.title = t("doc.terms");
    else if (path === "/legal") document.title = t("doc.legal");
    else if (path === "/security") document.title = t("doc.security");
    else if (path === "/cookies") document.title = t("doc.cookies");
    else if (path === "/refunds") document.title = t("doc.refunds");
    else if (path === "/sla") document.title = t("doc.sla");
    else if (path === "/admin") document.title = t("doc.admin");
    else if (path.startsWith("/app/")) document.title = t("doc.app");
    else if (path === "/precios") document.title = t("doc.pricing");
    else if (path === "/success") document.title = t("doc.checkoutSuccess");
    else document.title = t("doc.default");
  }, [location.pathname, locale, t]);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (location.pathname === "/" && (hash === "precios" || hash === "contact")) {
      navigate(hash === "contact" ? "/precios#contact" : "/precios", { replace: true });
    }
  }, [location.pathname, location.hash, navigate]);

  useEffect(() => {
    if (!session?.token) return;
    if (dakinisIsPlatformAdminSession(session) && location.pathname.startsWith("/sistema/")) {
      navigate("/admin", { replace: true });
    }
  }, [session?.token, session?.user?.role, location.pathname, navigate]);

  useDakinisFeatureTelemetry(session, location.pathname);

  useEffect(() => {
    const onExpired = () => {
      try {
        sessionStorage.setItem("dakinis_session_expired", "1");
      } catch {
        /* ignore */
      }
      signOut();
    };
    window.addEventListener(DAKINIS_AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(DAKINIS_AUTH_EXPIRED_EVENT, onExpired);
  }, [signOut]);

  const nav = (pathname) => navigate(pathname);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {import.meta.env.DEV ? (
        <>
          <Route path="/__des" element={<DesIndexPage />} />
          <Route path="/__des/motion" element={<DesMotionPage />} />
          <Route path="/__des/patterns" element={<DesPatternsPage />} />
          <Route path="/__des/theme" element={<DesThemePage />} />
        </>
      ) : null}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/portal/:slug" element={<ClientPortalPage />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <PlatformAdminPage navigate={nav} />
          </AdminGuard>
        }
      />
      <Route path="/app/dashboard" element={<GuardedDashboard navigate={nav} />} />
      <Route path="/app/crm" element={<GuardedCrm navigate={nav} />} />
      <Route path="/app/ventas" element={<GuardedVentas navigate={nav} />} />
      <Route path="/app/inventario" element={<GuardedInventario navigate={nav} />} />
      <Route path="/app/reportes" element={<GuardedReportes navigate={nav} />} />
      <Route path="/app/messages" element={<Navigate to="/app/whatsapp/conversations" replace />} />
      <Route path="/app/whatsapp" element={<Navigate to="/app/whatsapp/conversations" replace />} />
      <Route path="/app/whatsapp/conversations" element={<GuardedWhatsapp navigate={nav} />} />
      <Route path="/app/whatsapp/contacts" element={<GuardedWhatsapp navigate={nav} />} />
      <Route path="/app/whatsapp/templates" element={<GuardedWhatsapp navigate={nav} />} />
      <Route path="/app/whatsapp/automations" element={<GuardedWhatsapp navigate={nav} />} />
      <Route path="/app/whatsapp/ai" element={<GuardedWhatsapp navigate={nav} />} />
      <Route path="/app/settings" element={<GuardedSettings navigate={nav} />} />
      <Route path="/hub" element={<HubPage />} />
      <Route path="/ecosystem/launch/:productId" element={<EcosystemLaunchPage />} />
      <Route path="/faq" element={<FaqPage navigate={nav} />} />
      <Route path="/privacy" element={<PrivacyPage navigate={nav} />} />
      <Route path="/terms" element={<TermsPage navigate={nav} />} />
      <Route path="/legal" element={<LegalNoticePage navigate={nav} />} />
      <Route path="/security" element={<SecurityPage navigate={nav} />} />
      <Route path="/cookies" element={<CookiesPage navigate={nav} />} />
      <Route path="/refunds" element={<RefundsPage navigate={nav} />} />
      <Route path="/sla" element={<SlaPage navigate={nav} />} />
      <Route path="/precios" element={<PricingPage />} />
      <Route path="/success" element={<CheckoutSuccessPage />} />
      <Route path="/" element={<ProductHomePage />} />
      <Route path="*" element={<LegacyPathRoutes navigate={nav} />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Shell>
        <AppRoutes />
      </Shell>
    </BrowserRouter>
  );
}
