import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "node:crypto";

const store = new AsyncLocalStorage();

export function dakinisRequestIdFrom(req) {
  const header = req.headers["x-request-id"];
  const value = typeof header === "string" ? header.trim() : "";
  if (/^[\w.:-]{8,128}$/.test(value)) return value;
  return crypto.randomUUID();
}

export function dakinisRunWithRequest(req, fn) {
  return store.run({ requestId: dakinisRequestIdFrom(req) }, fn);
}

export function dakinisCurrentRequestId() {
  return store.getStore()?.requestId || `dk_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
