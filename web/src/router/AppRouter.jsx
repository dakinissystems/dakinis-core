import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppTopBar from "../components/AppTopBar.jsx";
import AppFooter from "../components/AppFooter.jsx";
import { useLocale } from "../context/LocaleContext.jsx";
import { useDakinisSession } from "../context/SessionContext.jsx";
import { useDakinisLogout } from "../hooks/useDakinisLogout.js";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import ProductHomePage from "../pages/ProductHomePage.jsx";
import HubPage from "../pages/HubPage.jsx";
import EcosystemLaunchPage from "../pages/EcosystemLaunchPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import PlatformAdminPage from "../pages/PlatformAdminPage.jsx";
import VistaMockupPage from "../pages/VistaMockupPage.jsx";
import SystemPage from "../pages/SystemPage.jsx";
import PublicAllergiesPage from "../pages/PublicAllergiesPage.jsx";
import {
  FaqPage,
  LegalNoticePage,
  PrivacyPage,
  TermsPage
} from "../pages/StaticInfoPages.jsx";
import { DashboardPage } from "../app/dashboard/index.js";
import { CrmPage } from "../app/crm/index.js";
import { MessagesPage } from "../app/messages/index.js";
import { SettingsPage } from "../app/settings/index.js";
import LegacyPathRoutes from "./LegacyPathRoutes.jsx";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

function Shell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useDakinisSession();
  const signOut = useDakinisLogout();

  const navigateCompat = (pathname) => navigate(pathname);

  return (
    <div className="app-shell">
      <AppTopBar
        navigate={navigateCompat}
        session={session}
        onSignOut={signOut}
        currentPath={location.pathname}
      />
      <main className="app-main">{children}</main>
      <AppFooter navigate={navigateCompat} />
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
  const { t, locale } = useLocale();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path === "/login") document.title = t("doc.login");
    else if (path === "/faq") document.title = t("doc.faq");
    else if (path === "/privacy") document.title = t("doc.privacy");
    else if (path === "/terms") document.title = t("doc.terms");
    else if (path === "/legal") document.title = t("doc.legal");
    else if (path === "/admin") document.title = t("doc.admin");
    else if (path.startsWith("/app/")) document.title = t("doc.app");
    else document.title = t("doc.default");
  }, [location.pathname, locale, t]);

  useEffect(() => {
    if (!session?.token) return;
    if (dakinisIsPlatformAdminSession(session) && location.pathname.startsWith("/sistema/")) {
      navigate("/admin", { replace: true });
    }
  }, [session, location.pathname, navigate]);

  const nav = (pathname) => navigate(pathname);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <PlatformAdminPage navigate={nav} />
          </AdminGuard>
        }
      />
      <Route path="/app/dashboard" element={<DashboardPage navigate={nav} />} />
      <Route path="/app/crm" element={<CrmPage navigate={nav} />} />
      <Route path="/app/messages" element={<MessagesPage navigate={nav} />} />
      <Route path="/app/settings" element={<SettingsPage navigate={nav} />} />
      <Route path="/hub" element={<HubPage />} />
      <Route path="/ecosystem/launch/:productId" element={<EcosystemLaunchPage />} />
      <Route path="/faq" element={<FaqPage navigate={nav} />} />
      <Route path="/privacy" element={<PrivacyPage navigate={nav} />} />
      <Route path="/terms" element={<TermsPage navigate={nav} />} />
      <Route path="/legal" element={<LegalNoticePage navigate={nav} />} />
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
