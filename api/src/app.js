import { dakinisJsonError } from "./api/responses.js";
import { dakinisRequirePlatformAdmin } from "./api/platform-auth.js";
import {
  dakinisHandlePlatformBusinessCreate,
  dakinisHandlePlatformBusinessUpdate,
  dakinisHandlePlatformBusinesses,
  dakinisHandlePlatformUsers,
  dakinisHandlePlatformCatalogGet,
  dakinisHandlePlatformCatalogPut,
  dakinisHandlePlatformTelemetrySummary,
  dakinisHandlePlatformBusinessHubProductsGet,
  dakinisHandlePlatformBusinessHubProductsPatch
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
import {
  dakinisHandleWhatsappWebhook,
  dakinisIsWhatsappWebhookPath
} from "./api/whatsapp-webhook.js";
import { dakinisHandleInternalIntelligenceRoute } from "./api/internal-intelligence.js";
import { dakinisHandleTenantIntelligenceRoute } from "./api/tenant-intelligence.js";
import {
  dakinisHandlePublicStripePlans,
  dakinisHandlePublicStripeCheckoutSession,
  dakinisHandlePublicStripeSessionLookup,
} from "./api/stripe-public-routes.js";
import {
  dakinisHandleInternalBillingSync,
  dakinisHandleTenantBillingPortal,
  dakinisHandleTenantBillingSubscription,
} from "./api/billing-routes.js";
import { dakinisHandleSearchQuery } from "./api/search-routes.js";
import { dakinisAuthenticateRequest } from "./middleware/auth.js";
import { dakinisResolveTenant } from "./middleware/tenant.js";

export async function dakinisDispatch(req, rawBody, url) {
  const path = url.pathname;

  if (path === "/api/platform/businesses" && req.method === "GET") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinesses();
  }
  if (path === "/api/platform/businesses" && req.method === "POST") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinessCreate(rawBody);
  }
  const platformBizPatchMatch = /^\/api\/platform\/businesses\/([^/]+)$/.exec(path);
  if (platformBizPatchMatch && req.method === "PATCH") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinessUpdate(platformBizPatchMatch[1], rawBody);
  }
  if (path === "/api/platform/users" && req.method === "GET") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformUsers();
  }
  if (path === "/api/platform/catalog" && req.method === "GET") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformCatalogGet();
  }
  if (path === "/api/platform/catalog" && req.method === "PUT") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformCatalogPut(rawBody);
  }
  if (path === "/api/platform/telemetry/summary" && req.method === "GET") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformTelemetrySummary(url.searchParams);
  }
  const platformHubProductsMatch = /^\/api\/platform\/businesses\/([^/]+)\/hub-products$/.exec(path);
  if (platformHubProductsMatch && req.method === "GET") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinessHubProductsGet(platformHubProductsMatch[1]);
  }
  if (platformHubProductsMatch && req.method === "PATCH") {
    const authErr = await dakinisRequirePlatformAdmin(req);
    if (authErr) return authErr;
    return dakinisHandlePlatformBusinessHubProductsPatch(platformHubProductsMatch[1], rawBody);
  }

  if (path === "/api/health" && req.method === "GET") {
    return dakinisHandleApiRequest(req, rawBody, url);
  }

  if (dakinisIsWhatsappWebhookPath(path, req.method)) {
    return dakinisHandleWhatsappWebhook(req, rawBody, url);
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

  if (path === "/api/public/stripe/plans" && req.method === "GET") {
    return dakinisHandlePublicStripePlans();
  }
  if (path === "/api/public/stripe/checkout-session" && req.method === "POST") {
    return dakinisHandlePublicStripeCheckoutSession(req, rawBody);
  }
  const stripeSessionMatch = /^\/api\/public\/stripe\/session$/.exec(path);
  if (stripeSessionMatch && req.method === "GET") {
    return dakinisHandlePublicStripeSessionLookup(url.searchParams.get("session_id"));
  }

  if (path === "/api/internal/billing/sync" && req.method === "POST") {
    return dakinisHandleInternalBillingSync(req, rawBody);
  }

  if (!path.startsWith("/api/")) {
    return dakinisJsonError(404, "NOT_FOUND", "Solo rutas /api/* en este servidor");
  }

  if (path.startsWith("/api/internal/intelligence/")) {
    const internal = await dakinisHandleInternalIntelligenceRoute(req, rawBody, path);
    if (internal) return internal;
    return dakinisJsonError(404, "NOT_FOUND", "Endpoint interno no encontrado");
  }

  const tenant = await dakinisResolveTenant(req);
  if (tenant.error) return tenant.error;
  const authError = await dakinisAuthenticateRequest(req, tenant.business);
  if (authError) return authError;

  if (path === "/api/me" && req.method === "GET") return dakinisHandleMeRequest(req);

  if (path === "/api/billing/subscription" && req.method === "GET") {
    return dakinisHandleTenantBillingSubscription(req);
  }
  if (path === "/api/billing/portal" && req.method === "POST") {
    return dakinisHandleTenantBillingPortal(req, rawBody);
  }
  if (path === "/api/search/query" && req.method === "GET") {
    return dakinisHandleSearchQuery(req, url);
  }

  const intelligenceResult = await dakinisHandleTenantIntelligenceRoute(req, rawBody, path);
  if (intelligenceResult) return intelligenceResult;

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
