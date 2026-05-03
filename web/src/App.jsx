import { useEffect, useState } from "react";
import AppTopBar from "./components/AppTopBar.jsx";
import AppFooter from "./components/AppFooter.jsx";
import { useLocale } from "./context/LocaleContext.jsx";
import { useDakinisSession } from "./context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "@dakinis/shared/catalog/system-registry.js";
import { DAKINIS_SYSTEM_ROUTE_PREFIX, DAKINIS_VISTA_ROUTE_PREFIX } from "@dakinis/shared/catalog/routes.js";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PlatformAdminPage from "./pages/PlatformAdminPage.jsx";
import VistaMockupPage from "./pages/VistaMockupPage.jsx";
import SystemPage from "./pages/SystemPage.jsx";
import {
  FaqPage,
  LegalNoticePage,
  PrivacyPage,
  TermsPage
} from "./pages/StaticInfoPages.jsx";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisGetVerticalFromPath(pathname) {
  if (!pathname.startsWith(DAKINIS_SYSTEM_ROUTE_PREFIX)) return null;
  const verticalKey = decodeURIComponent(pathname.slice(DAKINIS_SYSTEM_ROUTE_PREFIX.length));
  return dakinisSystemRegistry[verticalKey] ? verticalKey : null;
}

function dakinisGetVerticalFromVistaPath(pathname) {
  if (!pathname.startsWith(DAKINIS_VISTA_ROUTE_PREFIX)) return null;
  const verticalKey = decodeURIComponent(pathname.slice(DAKINIS_VISTA_ROUTE_PREFIX.length));
  return dakinisSystemRegistry[verticalKey] ? verticalKey : null;
}

function dakinisIsPlatformAdminSession(session) {
  return session?.user?.role === "platform_admin" || session?.business?.type === "platform";
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { session, logout } = useDakinisSession();
  const { t, locale } = useLocale();

  useEffect(() => {
    function sync() {
      setCurrentPath(window.location.pathname);
    }
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const systemKeyFromPath = dakinisGetVerticalFromPath(currentPath);
  const vistaKeyFromPath = dakinisGetVerticalFromVistaPath(currentPath);

  useEffect(() => {
    if (currentPath === "/login") {
      document.title = t("doc.login");
      return;
    }
    if (currentPath === "/faq") {
      document.title = t("doc.faq");
      return;
    }
    if (currentPath === "/privacy") {
      document.title = t("doc.privacy");
      return;
    }
    if (currentPath === "/terms") {
      document.title = t("doc.terms");
      return;
    }
    if (currentPath === "/legal") {
      document.title = t("doc.legal");
      return;
    }
    if (currentPath === "/admin") {
      document.title = t("doc.admin");
      return;
    }
    if (vistaKeyFromPath && dakinisSystemRegistry[vistaKeyFromPath]) {
      document.title = t("doc.vista", {
        label: dakinisSystemRegistry[vistaKeyFromPath].label
      });
      return;
    }
    if (systemKeyFromPath && dakinisSystemRegistry[systemKeyFromPath]) {
      document.title = t("doc.sistema", {
        label: dakinisSystemRegistry[systemKeyFromPath].label
      });
      return;
    }
    document.title = t("doc.default");
  }, [currentPath, systemKeyFromPath, vistaKeyFromPath, locale, t]);

  /** Bloquea cambiar de vertical con la sesión de un tenant; envía admins de plataforma al panel /admin. */
  useEffect(() => {
    if (!session?.token) return;

    if (dakinisIsPlatformAdminSession(session)) {
      if (currentPath.startsWith(DAKINIS_SYSTEM_ROUTE_PREFIX)) {
        window.history.replaceState({}, "", "/admin");
        setCurrentPath("/admin");
      }
      return;
    }

    const tenantType = session.business?.type;
    if (!tenantType) return;

    if (currentPath.startsWith(DAKINIS_SYSTEM_ROUTE_PREFIX)) {
      const key = decodeURIComponent(currentPath.slice(DAKINIS_SYSTEM_ROUTE_PREFIX.length));
      if (key && key !== tenantType) {
        const target = `${DAKINIS_SYSTEM_ROUTE_PREFIX}${encodeURIComponent(tenantType)}`;
        window.history.replaceState({}, "", target);
        setCurrentPath(target);
      }
      return;
    }

    if (currentPath.startsWith(DAKINIS_VISTA_ROUTE_PREFIX)) {
      const key = decodeURIComponent(currentPath.slice(DAKINIS_VISTA_ROUTE_PREFIX.length));
      if (key && key !== tenantType) {
        const target = `${DAKINIS_VISTA_ROUTE_PREFIX}${encodeURIComponent(tenantType)}`;
        window.history.replaceState({}, "", target);
        setCurrentPath(target);
      }
    }
  }, [session, currentPath]);

  useEffect(() => {
    if (currentPath !== "/admin" || !session?.token) return;
    if (!dakinisIsPlatformAdminSession(session)) {
      window.history.replaceState({}, "", "/");
      setCurrentPath("/");
    }
  }, [currentPath, session]);

  function navigate(pathname) {
    window.history.pushState({}, "", pathname);
    setCurrentPath(pathname);
  }

  const route =
    currentPath === "/login" ? (
      <LoginPage navigate={navigate} />
    ) : currentPath === "/faq" ? (
      <FaqPage navigate={navigate} />
    ) : currentPath === "/privacy" ? (
      <PrivacyPage navigate={navigate} />
    ) : currentPath === "/terms" ? (
      <TermsPage navigate={navigate} />
    ) : currentPath === "/legal" ? (
      <LegalNoticePage navigate={navigate} />
    ) : currentPath === "/admin" ? (
      <PlatformAdminPage navigate={navigate} />
    ) : vistaKeyFromPath ? (
      <VistaMockupPage verticalKey={vistaKeyFromPath} navigate={navigate} />
    ) : systemKeyFromPath ? (
      <SystemPage activeSystemKey={systemKeyFromPath} navigate={navigate} />
    ) : (
      <HomePage navigate={navigate} dakinisSystemRegistry={dakinisSystemRegistry} />
    );

  return (
    <div className="app-shell">
      <AppTopBar navigate={navigate} session={session} logout={logout} />
      <main className="app-main">{route}</main>
      <AppFooter navigate={navigate} />
    </div>
  );
}
