import { dakinisJsonSuccess } from "../../api/responses.js";

export function dakinisHandleTenantsRoute(req, path) {
  if (path !== "/api/v1/tenants/me" || req.method !== "GET") return null;
  const business = req.dakinisBusiness;
  return dakinisJsonSuccess(
    {
      tenant: {
        id: business.id,
        slug: business.slug,
        name: business.name,
        type: business.type,
        plan: business.plan
      }
    },
    business.type,
    { businessId: business.id, businessSlug: business.slug }
  );
}
