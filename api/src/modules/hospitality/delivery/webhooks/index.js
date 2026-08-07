import { dakinisHandleProviderWebhook } from "../DeliveryService.js";

export async function dakinisGlovoWebhook(businessId, body, headers) {
  return dakinisHandleProviderWebhook(businessId, "glovo", body?.event || "order.created", body, headers);
}

export async function dakinisUberWebhook(businessId, body, headers) {
  return dakinisHandleProviderWebhook(businessId, "ubereats", body?.event_type || body?.event || "order.created", body, headers);
}

export async function dakinisJustEatWebhook(businessId, body, headers) {
  return dakinisHandleProviderWebhook(businessId, "justeat", body?.event || body?.type || "order.created", body, headers);
}
