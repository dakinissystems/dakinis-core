import Stripe from "stripe";
import { dakinisJsonError, dakinisJsonSuccess } from "./responses.js";
import {
  dakinisIsStripeConfigured,
  dakinisStripeConfig,
  dakinisStripeFrontendUrl,
  dakinisStripePlanFromPriceId,
  dakinisStripePriceIdForPlan,
  dakinisStripePublicPlansPayload
} from "../services/stripe-config.js";
import {
  dakinisPlanFromStripeSubscription,
  dakinisSyncStripeSubscription
} from "../services/stripe-billing-store.js";
import { dakinisNormalizeCommercialPlan } from "@dakinis/shared/catalog/plan-modules.js";
import { dakinisStructuredLog } from "./structured-logger.js";

let dakinisStripeClient = null;

function dakinisGetStripe() {
  if (!dakinisIsStripeConfigured()) return null;
  if (!dakinisStripeClient) {
    dakinisStripeClient = new Stripe(dakinisStripeConfig().secretKey, {
      apiVersion: "2025-02-24.acacia"
    });
  }
  return dakinisStripeClient;
}

function dakinisParseJson(rawBody) {
  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    return null;
  }
}

function dakinisVerifyStripeSignature(rawBody, signatureHeader) {
  const { webhookSecret } = dakinisStripeConfig();
  if (!webhookSecret) return null;
  const stripe = dakinisGetStripe();
  if (!stripe) return null;
  try {
    return stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
  } catch {
    return null;
  }
}

export function dakinisHandleStripePublicPlansGet() {
  return dakinisJsonSuccess(dakinisStripePublicPlansPayload(), "custom");
}

export async function dakinisHandleStripeCheckoutSessionPost(rawBody) {
  const stripe = dakinisGetStripe();
  if (!stripe) {
    return dakinisJsonError(503, "STRIPE_NOT_CONFIGURED", "Stripe no está configurado en el servidor");
  }

  const body = dakinisParseJson(rawBody);
  if (body === null) return dakinisJsonError(400, "INVALID_JSON", "JSON inválido");

  const plan = dakinisNormalizeCommercialPlan(body.plan);
  const priceId = dakinisStripePriceIdForPlan(plan);
  if (!priceId) {
    return dakinisJsonError(400, "PLAN_NOT_AVAILABLE", `No hay precio Stripe configurado para el plan ${plan}`);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const businessId = typeof body.businessId === "string" ? body.businessId.trim() : "";
  const frontendUrl = dakinisStripeFrontendUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/precios`,
      customer_email: email || undefined,
      client_reference_id: businessId || undefined,
      metadata: {
        dakinis_plan: plan,
        ...(businessId ? { dakinis_business_id: businessId } : {})
      },
      subscription_data: {
        metadata: {
          dakinis_plan: plan,
          ...(businessId ? { dakinis_business_id: businessId } : {})
        }
      }
    });
    return dakinisJsonSuccess({ url: session.url, sessionId: session.id, plan }, "custom");
  } catch (err) {
    dakinisStructuredLog({
      level: "error",
      msg: "stripe_checkout_session_failed",
      plan,
      error: err instanceof Error ? err.message : String(err)
    });
    return dakinisJsonError(502, "STRIPE_ERROR", err instanceof Error ? err.message : "Error creando checkout");
  }
}

export async function dakinisHandleStripeSessionGet(url) {
  const stripe = dakinisGetStripe();
  if (!stripe) {
    return dakinisJsonError(503, "STRIPE_NOT_CONFIGURED", "Stripe no está configurado");
  }

  const sessionId = String(url.searchParams.get("session_id") || "").trim();
  if (!sessionId) {
    return dakinisJsonError(400, "VALIDATION_ERROR", "session_id requerido");
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "line_items"]
    });
    const subscription = session.subscription;
    const subObj = subscription && typeof subscription === "object" ? subscription : null;
    const plan =
      session.metadata?.dakinis_plan ||
      (subObj ? dakinisPlanFromStripeSubscription(subObj) : null) ||
      dakinisStripePlanFromPriceId(session.line_items?.data?.[0]?.price?.id);

    return dakinisJsonSuccess(
      {
        sessionId: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        plan: plan ? dakinisNormalizeCommercialPlan(plan) : null,
        customerEmail: session.customer_details?.email || session.customer_email || null
      },
      "custom"
    );
  } catch (err) {
    return dakinisJsonError(404, "SESSION_NOT_FOUND", err instanceof Error ? err.message : "Sesión no encontrada");
  }
}

async function dakinisHandleCheckoutSessionCompleted(session) {
  const stripe = dakinisGetStripe();
  let plan = session.metadata?.dakinis_plan || null;
  let periodStart = null;
  let periodEnd = null;

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  if (stripe && subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      plan = plan || dakinisPlanFromStripeSubscription(subscription);
      periodStart = subscription.current_period_start;
      periodEnd = subscription.current_period_end;
    } catch {
      /* fallback to metadata */
    }
  }

  plan = dakinisNormalizeCommercialPlan(plan || "starter");
  const businessId = session.metadata?.dakinis_business_id || session.client_reference_id || null;
  const email = session.customer_details?.email || session.customer_email || null;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

  return dakinisSyncStripeSubscription({
    businessId,
    email,
    plan,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status: "active",
    periodStart,
    periodEnd
  });
}

async function dakinisHandleSubscriptionUpdated(subscription) {
  const plan = dakinisPlanFromStripeSubscription(subscription);
  const businessId = subscription.metadata?.dakinis_business_id || null;
  const status =
    subscription.status === "active" || subscription.status === "trialing"
      ? "active"
      : subscription.status === "canceled"
        ? "canceled"
        : subscription.status;

  const stripe = dakinisGetStripe();
  let email = null;
  if (stripe && subscription.customer) {
    try {
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer.deleted) email = customer.email || null;
    } catch {
      /* ignore */
    }
  }

  return dakinisSyncStripeSubscription({
    businessId,
    email,
    plan,
    stripeCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    stripeSubscriptionId: subscription.id,
    status,
    periodStart: subscription.current_period_start,
    periodEnd: subscription.current_period_end
  });
}

export async function dakinisHandleStripeWebhookPost(rawBody, req) {
  const signature = req.headers["stripe-signature"];
  const sig = Array.isArray(signature) ? signature[0] : signature;
  if (!sig) {
    return dakinisJsonError(400, "MISSING_SIGNATURE", "Cabecera Stripe-Signature requerida");
  }

  const event = dakinisVerifyStripeSignature(rawBody, sig);
  if (!event) {
    return dakinisJsonError(400, "INVALID_SIGNATURE", "Firma de webhook inválida");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await dakinisHandleCheckoutSessionCompleted(event.data.object);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        await dakinisHandleSubscriptionUpdated(event.data.object);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await dakinisSyncStripeSubscription({
          businessId: sub.metadata?.dakinis_business_id || null,
          plan: dakinisPlanFromStripeSubscription(sub),
          stripeCustomerId:
            typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
          stripeSubscriptionId: sub.id,
          status: "canceled",
          periodStart: sub.current_period_start,
          periodEnd: sub.current_period_end
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const stripe = dakinisGetStripe();
          if (stripe) {
            try {
              const sub = await stripe.subscriptions.retrieve(String(invoice.subscription));
              await dakinisHandleSubscriptionUpdated(sub);
            } catch {
              /* ignore */
            }
          }
        }
        break;
      }
      default:
        break;
    }
    return dakinisJsonSuccess({ received: true, type: event.type }, "custom");
  } catch (err) {
    dakinisStructuredLog({
      level: "error",
      msg: "stripe_webhook_handler_failed",
      type: event.type,
      error: err instanceof Error ? err.message : String(err)
    });
    return dakinisJsonError(500, "WEBHOOK_ERROR", err instanceof Error ? err.message : "Error procesando webhook");
  }
}
