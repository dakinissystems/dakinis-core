import { dakinisHandleTenantUsersGet, dakinisHandleTenantUsersPatch, dakinisHandleTenantUsersPost } from "../../api/tenant-users.js";

export function dakinisHandleUsersRoute(req, rawBody, path) {
  if ((path === "/api/v1/users" || path === "/api/tenant/users") && req.method === "GET") {
    return dakinisHandleTenantUsersGet(req);
  }
  if ((path === "/api/v1/users" || path === "/api/tenant/users") && req.method === "POST") {
    return dakinisHandleTenantUsersPost(req, rawBody);
  }
  const userPatch = /^\/api\/(?:v1\/users|tenant\/users)\/([^/]+)$/.exec(path);
  if (userPatch && req.method === "PATCH") {
    return dakinisHandleTenantUsersPatch(req, userPatch[1], rawBody);
  }
  return null;
}
