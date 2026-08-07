import { useLocation } from "react-router-dom";
import {
  dakinisGetSystemRegistry,
  dakinisResolveHospitalitySystemKey
} from "@dakinis/shared/catalog/system-registry.js";
import {
  DAKINIS_DEMO_ROUTE_PREFIX,
  DAKINIS_SYSTEM_ROUTE_PREFIX,
  DAKINIS_VISTA_ROUTE_PREFIX
} from "@dakinis/shared/catalog/routes.js";
import VistaMockupPage from "../pages/VistaMockupPage.jsx";
import DemoCommercialPage from "../pages/DemoCommercialPage.jsx";
import { DAKINIS_DEMO_VERTICALS } from "../data/demoCommercialContent.js";
import SystemPage from "../pages/SystemPage.jsx";
import PublicAllergiesPage from "../pages/PublicAllergiesPage.jsx";
import ProductHomePage from "../pages/ProductHomePage.jsx";

const dakinisSystemRegistry = dakinisGetSystemRegistry();

function dakinisGetVerticalFromPath(pathname) {
  if (!pathname.startsWith(DAKINIS_SYSTEM_ROUTE_PREFIX)) return null;
  const rawKey = decodeURIComponent(pathname.slice(DAKINIS_SYSTEM_ROUTE_PREFIX.length));
  const verticalKey = dakinisResolveHospitalitySystemKey(rawKey);
  return dakinisSystemRegistry[verticalKey] ? verticalKey : null;
}

function dakinisGetAllergiesTokenFromPath(pathname) {
  const prefix = "/alergenos/";
  if (!pathname.startsWith(prefix)) return null;
  const token = decodeURIComponent(pathname.slice(prefix.length)).replace(/\/$/, "");
  return token || null;
}

function dakinisGetVerticalFromVistaPath(pathname) {
  if (!pathname.startsWith(DAKINIS_VISTA_ROUTE_PREFIX)) return null;
  const verticalKey = decodeURIComponent(pathname.slice(DAKINIS_VISTA_ROUTE_PREFIX.length));
  return dakinisSystemRegistry[verticalKey] ? verticalKey : null;
}

function dakinisGetVerticalFromDemoPath(pathname) {
  if (!pathname.startsWith(DAKINIS_DEMO_ROUTE_PREFIX)) return null;
  const verticalKey = decodeURIComponent(pathname.slice(DAKINIS_DEMO_ROUTE_PREFIX.length).replace(/\/$/, ""));
  return verticalKey && DAKINIS_DEMO_VERTICALS.includes(verticalKey) ? verticalKey : null;
}

/** Rutas verticales y alérgenos — migración fase 2 a rutas declarativas. */
export default function LegacyPathRoutes({ navigate }) {
  const { pathname } = useLocation();
  const systemKey = dakinisGetVerticalFromPath(pathname);
  const vistaKey = dakinisGetVerticalFromVistaPath(pathname);
  const demoKey = dakinisGetVerticalFromDemoPath(pathname);
  const allergiesToken = dakinisGetAllergiesTokenFromPath(pathname);

  if (allergiesToken) {
    return <PublicAllergiesPage token={allergiesToken} navigate={navigate} />;
  }
  if (demoKey) {
    return <DemoCommercialPage verticalKey={demoKey} navigate={navigate} />;
  }
  if (vistaKey) {
    return <VistaMockupPage verticalKey={vistaKey} navigate={navigate} />;
  }
  if (systemKey) {
    return <SystemPage activeSystemKey={systemKey} navigate={navigate} />;
  }
  return <ProductHomePage />;
}
