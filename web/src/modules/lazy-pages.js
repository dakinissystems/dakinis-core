/**
 * Lazy route helpers for Core AppRouter.
 * Each module is a separate async chunk (O1 — break monolothic /app bundle).
 */
import { lazy } from "react";

export const DashboardPage = lazy(() => import("../modules/dashboard/index.js"));
export const CrmPage = lazy(() => import("../modules/crm/index.js"));
export const VentasPage = lazy(() => import("../modules/sales/index.js"));
export const InventarioPage = lazy(() => import("../modules/inventory/index.js"));
export const ReportesPage = lazy(() => import("../modules/reports/index.js"));
export const WhatsappHubPage = lazy(() => import("../modules/whatsapp/index.js"));
export const SettingsPage = lazy(() => import("../modules/settings/index.js"));
