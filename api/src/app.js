import { dakinisJsonError } from "./api/responses.js";
import { dakinisRequirePlatformAdmin } from "./api/platform-auth.js";
import {
  dakinisHandlePlatformBusinessCreate,
  dakinisHandlePlatformBusinessUpdate,
  dakinisHandlePlatformBusinesses,
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
  dakinisHandleRestaurantStockPurchasePost
} from "./api/tenant-restaurant.js";
import {
  dakinisHandleRestaurantInvoicesList,
  dakinisHandleRestaurantInvoicesPost,
  dakinisHandleRestaurantMenuGet,
  dakinisHandleRestaurantOrdersList,
  dakinisHandleRestaurantOrdersPatch,
  dakinisHandleRestaurantOrdersPost
} from "./api/tenant-restaurant-orders.js";
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
import { dakinisHandleUsersRoute } from "./modules/users/routes.js";
import { dakinisHandleTenantsRoute } from "./modules/tenants/routes.js";
import { dakinisHandleCrmRoute } from "./modules/crm/routes.js";
import { dakinisHandleMessagesRoute } from "./modules/messages/routes.js";
import { dakinisHandleAppointmentsRoute } from "./modules/appointments/routes.js";
import { dakinisHandleWhatsappRoute } from "./modules/whatsapp/routes.js";
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

  if (path === "/api/health" && req.method === "GET") {
    return dakinisHandleApiRequest(req, rawBody, url);
  }

  const publicAllergiesMatch = /^\/api\/public\/restaurant\/([^/]+)\/allergies$/.exec(path);
  if (publicAllergiesMatch && req.method === "GET") {
    return dakinisHandlePublicRestaurantAllergiesGet(publicAllergiesMatch[1]);
  }
  if (path === "/api/auth/login" && req.method === "POST") {
    return dakinisHandleAuthLoginRequest(rawBody);
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
  if (path === "/api/tenant/restaurant/production/simulate" && req.method === "POST")
    return dakinisHandleRestaurantProductionSimulatePost(req, rawBody);
  if (path === "/api/tenant/restaurant/production" && req.method === "POST")
    return dakinisHandleRestaurantProductionPost(req, rawBody);
  if (path === "/api/tenant/restaurant/profile" && req.method === "PATCH")
    return dakinisHandleRestaurantProfilePatch(req, rawBody);
  if (path === "/api/tenant/restaurant/menu" && req.method === "GET") return dakinisHandleRestaurantMenuGet(req);
  if (path === "/api/tenant/restaurant/orders" && req.method === "GET") return dakinisHandleRestaurantOrdersList(req);
  if (path === "/api/tenant/restaurant/orders" && req.method === "POST")
    return dakinisHandleRestaurantOrdersPost(req, rawBody);
  const restaurantOrderId = /^\/api\/tenant\/restaurant\/orders\/([^/]+)$/.exec(path);
  if (restaurantOrderId && req.method === "PATCH")
    return dakinisHandleRestaurantOrdersPatch(req, restaurantOrderId[1], rawBody);
  if (path === "/api/tenant/restaurant/invoices" && req.method === "GET") return dakinisHandleRestaurantInvoicesList(req);
  if (path === "/api/tenant/restaurant/invoices" && req.method === "POST")
    return dakinisHandleRestaurantInvoicesPost(req, rawBody);

  const moduleResult =
    dakinisHandleUsersRoute(req, rawBody, path) ||
    dakinisHandleTenantsRoute(req, path) ||
    dakinisHandleCrmRoute(req, rawBody, url) ||
    dakinisHandleMessagesRoute(req, rawBody, url) ||
    dakinisHandleAppointmentsRoute(req, rawBody, url) ||
    dakinisHandleWhatsappRoute(req, rawBody, url);
  if (moduleResult) return moduleResult;

  return dakinisHandleApiRequest(req, rawBody, url);
}
