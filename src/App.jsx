import { useEffect, useState } from "react";
import AppTopBar from "./components/AppTopBar.jsx";
import { useDakinisSession } from "./context/SessionContext.jsx";
import { dakinisGetSystemRegistry } from "./catalog/system-registry.js";
import { DAKINIS_SYSTEM_ROUTE_PREFIX } from "./catalog/routes.js";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SystemPage from "./pages/SystemPage.jsx";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisGetVerticalFromPath(pathname) {
  if (!pathname.startsWith(DAKINIS_SYSTEM_ROUTE_PREFIX)) return null;
  const verticalKey = decodeURIComponent(pathname.slice(DAKINIS_SYSTEM_ROUTE_PREFIX.length));
  return dakinisSystemRegistry[verticalKey] ? verticalKey : null;
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { session, logout } = useDakinisSession();

  useEffect(() => {
    function sync() {
      setCurrentPath(window.location.pathname);
    }
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  function navigate(pathname) {
    window.history.pushState({}, "", pathname);
    setCurrentPath(pathname);
  }

  const systemKeyFromPath = dakinisGetVerticalFromPath(currentPath);
  const route =
    currentPath === "/login" ? (
      <LoginPage navigate={navigate} />
    ) : systemKeyFromPath ? (
      <SystemPage activeSystemKey={systemKeyFromPath} navigate={navigate} />
    ) : (
      <HomePage navigate={navigate} dakinisSystemRegistry={dakinisSystemRegistry} />
    );

  return (
    <>
      <AppTopBar navigate={navigate} session={session} logout={logout} />
      <main>{route}</main>
    </>
  );
}
