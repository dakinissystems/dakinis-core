import { dakinisJsonError } from "./api/responses.js";
import { dakinisRequirePlatformAdmin } from "./api/platform-auth.js";
import {
  dakinisHandlePlatformBusinessCreate,
  dakinisHandlePlatformBusinessUpdate,
  dakinisHandlePlatformBusinesses,
  dakinisHandlePlatformUserPatch,
  dakinisHandlePlatformUserResendReset,
  dakinisHandlePlatformUsers
} from "./api/platform-routes.js";
import {
  dakinisHandleAuthLoginRequest,
  dakinisHandleAuthExchangeRequest,
  dakinisHandleMeRequest,
  dakinisHandleApiRequest
} from "./api/router.js";
import {
  dakinisHandlePublicRestaurantAllergiesGet,
  dakinisHandleRestaurantKitchenGet,
  dakinisHandleRestaurantProductionPost,
  dakinisHandleRestaurantProductionSimulatePost,
  dakinisHandleRestaurantProfilePatch,
  dakinisHandleRestaurantStockPurchasePost,
  dakinisHandleRestaurantStockItemPost,
  dakinisHandleRestaurantStockScanPost
} from "./api/tenant-restaurant.js";
import {
  dakinisHandleRestaurantInvoicesList,
  dakinisHandleRestaurantInvoicesPost,
  dakinisHandleRestaurantMenuGet,
  dakinisHandleRestaurantOrdersList,
  dakinisHandleRestaurantOrdersPatch,
  dakinisHandleRestaurantOrdersPost,
  dakinisHandleRestaurantMenuPatch
} from "./api/tenant-restaurant-orders.js";
import {
  dakinisHandleRestaurantFloorGet,
  dakinisHandleRestaurantFloorPatch,
  dakinisHandleRestaurantTableSessionPatch
} from "./api/tenant-restaurant-floor.js";
import {
  dakinisHandleSupplyAlertsDelete,
  dakinisHandleSupplyAlertsList,
  dakinisHandleSupplyAlertsPatch,
  dakinisHandleSupplyAlertsPost,
  dakinisHandleSupplyDeliveriesDelete,
  dakinisHandleSupplyDeliveriesList,
  dakinisHandleSupplyDeliveriesPatch,
  dakinisHandleSupplyDeliveriesPost
} from "./api/tenant-supply.js";
import {
  dakinisHandleInventoryConsumePost,
  dakinisHandleInventoryLocationsGet,
  dakinisHandleInventoryLotResolveGet,
  dakinisHandleInventoryLotsList,
  dakinisHandleInventoryReceivePost,
  dakinisHandleInventorySummaryGet
} from "./api/tenant-inventory-lots.js";
import { dakinisHandleUsersRoute } from "./modules/users/routes.js";
import { dakinisHandleTenantsRoute } from "./modules/tenants/routes.js";
import { dakinisHandleCrmRoute } from "./modules/crm/routes.js";
import { dakinisHandleMessagesRoute } from "./modules/messages/routes.js";
import { dakinisHandleAppointmentsRoute } from "./modules/appointments/routes.js";
import { dakinisHandleWhatsappRoute } from "./modules/whatsapp/routes.js";
import {
  dakinisHandleWhatsappWebhookVerify,
  dakinisHandleWhatsappWebhookPost
} from "./api/whatsapp-routes.js";
import { dakinisHandlePublicCatalog } from "./api/catalog-routes.js";
import {
  dakinisHandlePublicIndustryTemplatesGet,
  dakinisHandleTenantIntelligenceRoute
} from "./api/tenant-intelligence-routes.js";
import { dakinisHandlePublicPortalGet } from "./api/bos-routes.js";
import {
  dakinisHandlePlatformCatalogGet,
  dakinisHandlePlatformCatalogPut
} from "./api/catalog-admin-routes.js";
import { dakinisResolveTenant } from "./middleware/tenant.js";
import { dakinisAuthenticateRequest } from "./middleware/auth.js";

export async function dakinisDispatch(req, rawBody, url) {
  const path = url.pathname;

  if (path === "/api/platform/businesses" && req.method === "GET") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinesses();
  }
  if (path === "/api/platform/businesses" && req.method === "POST") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinessCreate(rawBody);
  }
  const platformBizPatchMatch = /^\/api\/platform\/businesses\/([^/]+)$/.exec(path);
  if (platformBizPatchMatch && req.method === "PATCH") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinessUpdate(platformBizPatchMatch[1], rawBody);
  }
  if (path === "/api/platform/users" && req.method === "GET") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformUsers();
  }
  const platformUserPatchMatch = /^\/api\/platform\/users\/([^/]+)$/.exec(path);
  if (platformUserPatchMatch && req.method === "PATCH") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformUserPatch(platformUserPatchMatch[1], rawBody);
  }
  const platformUserResendMatch = /^\/api\/platform\/users\/([^/]+)\/resend-password-reset$/.exec(path);
  if (platformUserResendMatch && req.method === "POST") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformUserResendReset(platformUserResendMatch[1]);
  }
  if (path === "/api/platform/telemetry/summary" && req.method === "GET") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    const { dakinisHandlePlatformTelemetrySummaryGet } = await import("./api/telemetry-routes.js");
    const days = Number(url.searchParams.get("days") || 30);
    return dakinisHandlePlatformTelemetrySummaryGet(days);
  }
  if (path === "/api/platform/catalog" && req.method === "GET") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformCatalogGet();
  }
  if (path === "/api/platform/catalog" && req.method === "PUT") {
    const authErr = dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformCatalogPut(rawBody);
  }

  if (path === "/api/health" && req.method === "GET") {
    return dakinisHandleApiRequest(req, rawBody, url);
  }

  const dakinisWhatsappWebhook =
    path === "/webhooks/whatsapp" ||
    path === "/api/webhooks/whatsapp" ||
    path === "/api/whatsapp/webhook";

  if (dakinisWhatsappWebhook && req.method === "GET") {
    return dakinisHandleWhatsappWebhookVerify(url);
  }
  if (dakinisWhatsappWebhook && req.method === "POST") {
    return dakinisHandleWhatsappWebhookPost(rawBody, req);
  }

  if (path === "/api/public/catalog" && req.method === "GET") {
    return await dakinisHandlePublicCatalog();
  }
  if (path === "/api/public/industry-templates" && req.method === "GET") {
    return dakinisHandlePublicIndustryTemplatesGet();
  }
  const publicPortalMatch = /^\/api\/public\/portal\/([^/]+)$/.exec(path);
  if (publicPortalMatch && req.method === "GET") {
    return dakinisHandlePublicPortalGet(decodeURIComponent(publicPortalMatch[1]));
  }

  const publicAllergiesMatch = /^\/api\/public\/restaurant\/([^/]+)\/allergies$/.exec(path);
  if (publicAllergiesMatch && req.method === "GET") {
    return dakinisHandlePublicRestaurantAllergiesGet(publicAllergiesMatch[1]);
  }
  if (path === "/api/auth/login" && req.method === "POST") {
    return dakinisHandleAuthLoginRequest(rawBody);
  }
  if (path === "/api/auth/forgot-password" && req.method === "POST") {
    const { dakinisHandleAuthForgotPassword } = await import("./api/auth-routes.js");
    return dakinisHandleAuthForgotPassword(rawBody);
  }
  if (path === "/api/auth/reset-password" && req.method === "POST") {
    const { dakinisHandleAuthResetPassword } = await import("./api/auth-routes.js");
    return dakinisHandleAuthResetPassword(rawBody);
  }
  if (path === "/api/auth/exchange" && req.method === "POST") {
    return dakinisHandleAuthExchangeRequest(req, rawBody);
  }
  if (!path.startsWith("/api/")) {
    return dakinisJsonError(404, "NOT_FOUND", "Solo rutas /api/* en este servidor");
  }

  const tenant = await dakinisResolveTenant(req);
  if (tenant.error) return tenant.error;
  const authError = await dakinisAuthenticateRequest(req, tenant.business);
  if (authError) return authError;

  if (path === "/api/me" && req.method === "GET") return dakinisHandleMeRequest(req);
  if (path === "/api/tenant/supply/deliveries" && req.method === "GET") return dakinisHandleSupplyDeliveriesList(req);
  if (path === "/api/tenant/supply/deliveries" && req.method === "POST")
    return dakinisHandleSupplyDeliveriesPost(req, rawBody);
  const supplyDelId = /^\/api\/tenant\/supply\/deliveries\/([^/]+)$/.exec(path);
  if (supplyDelId && req.method === "PATCH") return dakinisHandleSupplyDeliveriesPatch(req, supplyDelId[1], rawBody);
  if (supplyDelId && req.method === "DELETE") return dakinisHandleSupplyDeliveriesDelete(req, supplyDelId[1]);
  if (path === "/api/tenant/supply/alerts" && req.method === "GET") return dakinisHandleSupplyAlertsList(req);
  if (path === "/api/tenant/supply/alerts" && req.method === "POST") return dakinisHandleSupplyAlertsPost(req, rawBody);
  const supplyAlertId = /^\/api\/tenant\/supply\/alerts\/([^/]+)$/.exec(path);
  if (supplyAlertId && req.method === "PATCH") return dakinisHandleSupplyAlertsPatch(req, supplyAlertId[1], rawBody);
  if (supplyAlertId && req.method === "DELETE") return dakinisHandleSupplyAlertsDelete(req, supplyAlertId[1]);

  if (path === "/api/tenant/restaurant/kitchen" && req.method === "GET") return dakinisHandleRestaurantKitchenGet(req);
  if (path === "/api/tenant/restaurant/stock/purchase" && req.method === "POST")
    return dakinisHandleRestaurantStockPurchasePost(req, rawBody);
  if (path === "/api/tenant/restaurant/stock/items" && req.method === "POST")
    return dakinisHandleRestaurantStockItemPost(req, rawBody);
  if (path === "/api/tenant/restaurant/stock/scan" && req.method === "POST")
    return dakinisHandleRestaurantStockScanPost(req, rawBody);
  if (path === "/api/tenant/restaurant/production/simulate" && req.method === "POST")
    return dakinisHandleRestaurantProductionSimulatePost(req, rawBody);
  if (path === "/api/tenant/restaurant/production" && req.method === "POST")
    return dakinisHandleRestaurantProductionPost(req, rawBody);
  if (path === "/api/tenant/restaurant/profile" && req.method === "PATCH")
    return dakinisHandleRestaurantProfilePatch(req, rawBody);
  if (path === "/api/tenant/restaurant/menu" && req.method === "GET") return dakinisHandleRestaurantMenuGet(req);
  if (path === "/api/tenant/restaurant/menu" && req.method === "PATCH")
    return dakinisHandleRestaurantMenuPatch(req, rawBody);
  if (path === "/api/tenant/restaurant/floor" && req.method === "GET") return dakinisHandleRestaurantFloorGet(req);
  if (path === "/api/tenant/restaurant/floor" && req.method === "PATCH")
    return dakinisHandleRestaurantFloorPatch(req, rawBody);
  const restaurantTableSession = /^\/api\/tenant\/restaurant\/table-sessions\/([^/]+)$/.exec(path);
  if (restaurantTableSession && req.method === "PATCH")
    return dakinisHandleRestaurantTableSessionPatch(req, restaurantTableSession[1], rawBody);
  if (path === "/api/tenant/restaurant/orders" && req.method === "GET") return dakinisHandleRestaurantOrdersList(req);
  if (path === "/api/tenant/restaurant/orders" && req.method === "POST")
    return dakinisHandleRestaurantOrdersPost(req, rawBody);
  const restaurantOrderId = /^\/api\/tenant\/restaurant\/orders\/([^/]+)$/.exec(path);
  if (restaurantOrderId && req.method === "PATCH")
    return dakinisHandleRestaurantOrdersPatch(req, restaurantOrderId[1], rawBody);
  if (path === "/api/tenant/restaurant/invoices" && req.method === "GET") return dakinisHandleRestaurantInvoicesList(req);
  if (path === "/api/tenant/restaurant/invoices" && req.method === "POST")
    return dakinisHandleRestaurantInvoicesPost(req, rawBody);

  if (path === "/api/tenant/inventory/locations" && req.method === "GET")
    return dakinisHandleInventoryLocationsGet(req);
  if (path === "/api/tenant/inventory/summary" && req.method === "GET")
    return dakinisHandleInventorySummaryGet(req);
  if (path === "/api/tenant/inventory/lots" && req.method === "GET") return dakinisHandleInventoryLotsList(req);
  if (path === "/api/tenant/inventory/receive" && req.method === "POST")
    return dakinisHandleInventoryReceivePost(req, rawBody);
  if (path === "/api/tenant/inventory/consume" && req.method === "POST")
    return dakinisHandleInventoryConsumePost(req, rawBody);
  const inventoryLotResolve = /^\/api\/tenant\/inventory\/lots\/resolve\/([^/]+)$/.exec(path);
  if (inventoryLotResolve && req.method === "GET")
    return dakinisHandleInventoryLotResolveGet(req, decodeURIComponent(inventoryLotResolve[1]));

  const moduleResult =
    dakinisHandleTenantIntelligenceRoute(req, rawBody, url) ||
    dakinisHandleUsersRoute(req, rawBody, path) ||
    dakinisHandleTenantsRoute(req, path) ||
    dakinisHandleCrmRoute(req, rawBody, url) ||
    dakinisHandleMessagesRoute(req, rawBody, url) ||
    dakinisHandleAppointmentsRoute(req, rawBody, url) ||
    dakinisHandleWhatsappRoute(req, rawBody, url);
  if (moduleResult) return moduleResult;

  return dakinisHandleApiRequest(req, rawBody, url);
}
