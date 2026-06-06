import {
  dakinisHandleTenantUsersGet,
  dakinisHandleTenantUsersPatch,
  dakinisHandleTenantUsersPost,
  dakinisHandleTenantUsersResendReset
} from "../../api/tenant-users.js";

export function dakinisHandleUsersRoute(req, rawBody, path) {
  if ((path === "/api/v1/users" || path === "/api/tenant/users") && req.method === "GET") {
    return dakinisHandleTenantUsersGet(req);
  }
  if ((path === "/api/v1/users" || path === "/api/tenant/users") && req.method === "POST") {
    return dakinisHandleTenantUsersPost(req, rawBody);
  }
  const userResend = /^\/api\/(?:v1\/users|tenant\/users)\/([^/]+)\/resend-password-reset$/.exec(path);
  if (userResend && req.method === "POST") {
    return dakinisHandleTenantUsersResendReset(req, userResend[1]);
  }
  const userPatch = /^\/api\/(?:v1\/users|tenant\/users)\/([^/]+)$/.exec(path);
  if (userPatch && req.method === "PATCH") {
    return dakinisHandleTenantUsersPatch(req, userPatch[1], rawBody);
  }
  return null;
}
