import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "node:crypto";

const store = new AsyncLocalStorage();

export function dakinisRequestIdFrom(req) {
  const header = req.headers["x-request-id"];
  const value = typeof header === "string" ? header.trim() : "";
  if (/^[\w.:-]{8,128}$/.test(value)) return value;
  return crypto.randomUUID();
}

function dakinisActorTokenFrom(req) {
  const raw = req?.headers?.["x-dakinis-actor"];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value || value.length > 8192 || value.split(".").length !== 3) return "";
  return value;
}

export function dakinisRunWithRequest(req, fn) {
  return store.run(
    { requestId: dakinisRequestIdFrom(req), actorToken: dakinisActorTokenFrom(req) },
    fn
  );
}

export function dakinisCurrentRequestId() {
  return store.getStore()?.requestId || `dk_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function dakinisCurrentActorToken() {
  return store.getStore()?.actorToken || "";
}
