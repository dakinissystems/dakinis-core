import http from "node:http";
import { dakinisAssertProductionJwtSecret } from "./src/api/jwt-config.js";
import { dakinisAuthenticateTenant } from "./src/api/auth-tenant.js";
import { dakinisResolveBusinessFromHeader } from "./src/api/business-context.js";
import { DAKINIS_BUSINESS_ID_HEADER } from "./src/api/contracts.js";
import { dakinisInitDb } from "./src/db/index.js";
import {
  dakinisHandleApiRequest,
  dakinisHandleAuthLoginRequest,
  dakinisHandleMeRequest
} from "./src/api/router.js";
import { dakinisEnforceRateLimit } from "./src/api/security.js";
import { dakinisJsonError } from "./src/api/responses.js";
import { dakinisRequirePlatformAdmin } from "./src/api/platform-auth.js";
import {
  dakinisHandlePlatformBusinessCreate,
  dakinisHandlePlatformBusinessUpdate,
  dakinisHandlePlatformBusinesses,
  dakinisHandlePlatformUsers
} from "./src/api/platform-routes.js";
import {
  dakinisHandleTenantUsersGet,
  dakinisHandleTenantUsersPatch,
  dakinisHandleTenantUsersPost
} from "./src/api/tenant-users.js";
import {
  dakinisHandleSupplyAlertsDelete,
  dakinisHandleSupplyAlertsList,
  dakinisHandleSupplyAlertsPatch,
  dakinisHandleSupplyAlertsPost,
  dakinisHandleSupplyDeliveriesDelete,
  dakinisHandleSupplyDeliveriesList,
  dakinisHandleSupplyDeliveriesPatch,
  dakinisHandleSupplyDeliveriesPost
} from "./src/api/tenant-supply.js";

dakinisAssertProductionJwtSecret();
dakinisInitDb();

const PORT = Number(process.env.PORT || 8787);

/** Origen del SPA en produccion (Render static). Vacio o * permite cualquier origen. */
const DAKINIS_CORS_ORIGIN = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "*";

function dakinisSetCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", DAKINIS_CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-api-key, x-business-id, x-business-type"
  );
}

async function dakinisDispatch(req, rawBody, url) {
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

  const platformBusinessPatch = /^\/api\/platform\/businesses\/([^/]+)$/;
  const platformBizPatchMatch = platformBusinessPatch.exec(path);
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

  if (path === "/api/auth/login" && req.method === "POST") {
    return dakinisHandleAuthLoginRequest(rawBody);
  }

  if (!path.startsWith("/api/")) {
    return dakinisJsonError(404, "NOT_FOUND", "Solo rutas /api/* en este servidor");
  }

  const bidHeader = req.headers[DAKINIS_BUSINESS_ID_HEADER];
  const bid = typeof bidHeader === "string" ? bidHeader.trim() : "";
  if (!bid) {
    return dakinisJsonError(400, "MISSING_BUSINESS_ID", "Header x-business-id requerido para esta ruta", {
      header: DAKINIS_BUSINESS_ID_HEADER
    });
  }

  const business = dakinisResolveBusinessFromHeader(bid);
  if (!business) {
    return dakinisJsonError(404, "UNKNOWN_BUSINESS", "Negocio no encontrado", {
      [DAKINIS_BUSINESS_ID_HEADER]: bid
    });
  }

  req.dakinisBusiness = business;

  const authError = dakinisAuthenticateTenant(req, business);
  if (authError) {
    return authError;
  }

  if (path === "/api/me" && req.method === "GET") {
    return dakinisHandleMeRequest(req);
  }

  if (path === "/api/tenant/users" && req.method === "GET") {
    return dakinisHandleTenantUsersGet(req);
  }

  if (path === "/api/tenant/users" && req.method === "POST") {
    return dakinisHandleTenantUsersPost(req, rawBody);
  }

  const tenantUserPatch = /^\/api\/tenant\/users\/([^/]+)$/.exec(path);
  if (tenantUserPatch && req.method === "PATCH") {
    return dakinisHandleTenantUsersPatch(req, tenantUserPatch[1], rawBody);
  }

  if (path === "/api/tenant/supply/deliveries" && req.method === "GET") {
    return dakinisHandleSupplyDeliveriesList(req);
  }
  if (path === "/api/tenant/supply/deliveries" && req.method === "POST") {
    return dakinisHandleSupplyDeliveriesPost(req, rawBody);
  }

  const supplyDelId = /^\/api\/tenant\/supply\/deliveries\/([^/]+)$/.exec(path);
  if (supplyDelId && req.method === "PATCH") {
    return dakinisHandleSupplyDeliveriesPatch(req, supplyDelId[1], rawBody);
  }
  if (supplyDelId && req.method === "DELETE") {
    return dakinisHandleSupplyDeliveriesDelete(req, supplyDelId[1]);
  }

  if (path === "/api/tenant/supply/alerts" && req.method === "GET") {
    return dakinisHandleSupplyAlertsList(req);
  }
  if (path === "/api/tenant/supply/alerts" && req.method === "POST") {
    return dakinisHandleSupplyAlertsPost(req, rawBody);
  }

  const supplyAlertId = /^\/api\/tenant\/supply\/alerts\/([^/]+)$/.exec(path);
  if (supplyAlertId && req.method === "PATCH") {
    return dakinisHandleSupplyAlertsPatch(req, supplyAlertId[1], rawBody);
  }
  if (supplyAlertId && req.method === "DELETE") {
    return dakinisHandleSupplyAlertsDelete(req, supplyAlertId[1]);
  }

  return dakinisHandleApiRequest(req, rawBody, url);
}

const server = http.createServer((req, res) => {
  dakinisSetCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", async () => {
    try {
      const rawBody = Buffer.concat(chunks).toString("utf8");
      const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

      const rateLimitError = dakinisEnforceRateLimit(req, res, url);
      if (rateLimitError) {
        res.writeHead(rateLimitError.status, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(rateLimitError.body));
        return;
      }

      const result = await dakinisDispatch(req, rawBody, url);
      const auth = req.dakinisAuth;
      if (auth?.role) {
        res.setHeader("X-Auth-Method", auth.method || "unknown");
        res.setHeader("X-Auth-Role", auth.role);
      }
      res.writeHead(result.status, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(result.body));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          ok: false,
          error: {
            code: "INTERNAL_ERROR",
            message: error instanceof Error ? error.message : "Error interno"
          }
        })
      );
    }
  });
});

server.listen(PORT, () => {
  console.log(`Dakinis API listening on http://localhost:${PORT}`);
  console.log(`SQLite DB: ${process.env.SQLITE_PATH || "./data/dakinis.db"} (multi-tenant)`);
});
