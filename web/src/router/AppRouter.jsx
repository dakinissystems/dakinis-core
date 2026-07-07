import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppTopBar from "../components/AppTopBar.jsx";
import AppFooter from "../components/AppFooter.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { useDakinisLogout } from "../hooks/useDakinisLogout.js";
import { useDakinisFeatureTelemetry } from "../hooks/useDakinisFeatureTelemetry.js";
import { DAKINIS_AUTH_EXPIRED_EVENT } from "../services/auth-events.js";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import ProductHomePage from "../pages/ProductHomePage.jsx";
import PricingPage from "../pages/PricingPage.jsx";
import HubPage from "../pages/HubPage.jsx";
import EcosystemLaunchPage from "../pages/EcosystemLaunchPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import PlatformAdminPage from "../pages/PlatformAdminPage.jsx";
import VistaMockupPage from "../pages/VistaMockupPage.jsx";
import SystemPage from "../pages/SystemPage.jsx";
import PublicAllergiesPage from "../pages/PublicAllergiesPage.jsx";
import CheckoutSuccessPage from "../pages/CheckoutSuccessPage.jsx";
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
import DashboardPage from "../app/dashboard/DashboardPage.jsx";
import CrmPage from "../app/crm/CrmPage.jsx";
import WhatsappHubPage from "../app/whatsapp/WhatsappHubPage.jsx";
import SettingsPage from "../app/settings/SettingsPage.jsx";
import VentasPage from "../app/ventas/VentasPage.jsx";
import InventarioPage from "../app/inventario/InventarioPage.jsx";
import ReportesPage from "../app/reportes/ReportesPage.jsx";
import LegacyPathRoutes from "./LegacyPathRoutes.jsx";
import ClientPortalPage from "../pages/ClientPortalPage.jsx";
import AppGuard from "../components/AppGuard.jsx";
import BillingAccessBanner from "../components/BillingAccessBanner.jsx";
import { useBillingSessionRefresh } from "../hooks/useBillingSessionRefresh.js";
import DakinisCommandPaletteProvider from "../components/experience/DakinisCommandPaletteProvider.jsx";
import DraggableWhatsappButton from "../components/DraggableWhatsappButton.jsx";
import { dakinisShouldShowPublicWhatsappFab } from "../utils/publicWhatsappFabVisibility.js";
import { dakinisIsPlatformAdminSession } from "../utils/businessDemoMode.js";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useDakinisSession();
  const signOut = useDakinisLogout();
  useBillingSessionRefresh();

  const navigateCompat = (pathname) => navigate(pathname);

  const showWhatsappFab = dakinisShouldShowPublicWhatsappFab(location.pathname);

  return (
    <div className="app-shell">
      <AppTopBar
        navigate={navigateCompat}
        session={session}
        onSignOut={signOut}
        currentPath={location.pathname}
      />
      <BillingAccessBanner />
      <main className="app-main">{children}</main>
      <AppFooter navigate={navigateCompat} />
      <DakinisCommandPaletteProvider />
      {showWhatsappFab ? <DraggableWhatsappButton /> : null}
    </div>
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
  }, [session, location.pathname, navigate]);

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
      <Route
        path="/app/dashboard"
        element={
          <AppGuard>
            <DashboardPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/crm"
        element={
          <AppGuard>
            <CrmPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/ventas"
        element={
          <AppGuard>
            <VentasPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/inventario"
        element={
          <AppGuard>
            <InventarioPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/reportes"
        element={
          <AppGuard>
            <ReportesPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route path="/app/messages" element={<Navigate to="/app/whatsapp/conversations" replace />} />
      <Route path="/app/whatsapp" element={<Navigate to="/app/whatsapp/conversations" replace />} />
      <Route
        path="/app/whatsapp/conversations"
        element={
          <AppGuard>
            <WhatsappHubPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/whatsapp/contacts"
        element={
          <AppGuard>
            <WhatsappHubPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/whatsapp/templates"
        element={
          <AppGuard>
            <WhatsappHubPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/whatsapp/automations"
        element={
          <AppGuard>
            <WhatsappHubPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/whatsapp/ai"
        element={
          <AppGuard>
            <WhatsappHubPage navigate={nav} />
          </AppGuard>
        }
      />
      <Route
        path="/app/settings"
        element={
          <AppGuard>
            <SettingsPage navigate={nav} />
          </AppGuard>
        }
      />
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
