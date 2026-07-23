/**
 * Servidor Fastify (fase 1) — delega en dakinisDispatch existente.
 * Activar: USE_FASTIFY=true npm run start
 */
import Fastify from "fastify";
import { dakinisDispatch } from "../app.js";
import { dakinisEnforceRateLimit } from "../api/security.js";
import { dakinisStructuredLog } from "../api/structured-logger.js";
import { dakinisGetDbDriver } from "../db/index.js";
import { dakinisIsSentryEnabled, dakinisCaptureException } from "../lib/sentry.js";

function dakinisCorsAllowlist() {
  const multi = (process.env.CORS_ORIGINS || process.env.FRONTEND_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (multi.length) return multi;
  const single = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "").trim();
  if (single) return [single];
  return null;
}

const allowlist = dakinisCorsAllowlist();

export async function dakinisCreateFastifyServer() {
  const app = Fastify({
    logger: false,
    bodyLimit: 10 * 1024 * 1024
  });

  app.addHook("onRequest", async (req, reply) => {
    const origin = req.headers.origin;
    if (allowlist?.length) {
      if (origin && allowlist.includes(origin)) {
        reply.header("Access-Control-Allow-Origin", origin);
        reply.header("Access-Control-Allow-Credentials", "true");
        reply.header("Vary", "Origin");
      }
    } else {
      reply.header(
        "Access-Control-Allow-Origin",
        process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "*"
      );
    }
    reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    reply.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-api-key, x-business-id, x-business-type"
    );
    if (req.method === "OPTIONS") {
      reply.code(204).send();
    }
  });

  app.all("/api/*", async (req, reply) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const rateLimitError = dakinisEnforceRateLimit(req.raw, reply.raw, url);
    if (rateLimitError) {
      return reply.code(rateLimitError.status).send(rateLimitError.body);
    }

    const started = Date.now();
    try {
      const result = await dakinisDispatch(req.raw, req.body ? JSON.stringify(req.body) : "", url);
      const ms = Date.now() - started;
      dakinisStructuredLog({
        level: result.status >= 500 ? "error" : "info",
        msg: "http_request",
        server: "fastify",
        method: req.method,
        path: url.pathname,
        status: result.status,
        ms
      });
      if (req.dakinisAuth?.role) {
        reply.header("X-Auth-Method", req.dakinisAuth.method || "unknown");
        reply.header("X-Auth-Role", req.dakinisAuth.role);
      }
      return reply.code(result.status).send(result.body);
    } catch (error) {
      const ms = Date.now() - started;
      dakinisStructuredLog({
        level: "error",
        msg: "http_request",
        server: "fastify",
        method: req.method,
        path: url.pathname,
        status: 500,
        ms,
        error: error instanceof Error ? error.message : String(error)
      });
      dakinisCaptureException(error, { path: url.pathname, method: req.method });
      return reply.code(500).send({
        ok: false,
        error: { code: "INTERNAL_ERROR", message: error instanceof Error ? error.message : "Error interno" }
      });
    }
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "dakinis-core-api",
    server: "fastify",
    db: dakinisGetDbDriver(),
    sentry: dakinisIsSentryEnabled()
  }));

  return app;
}
