import http from "node:http";
import { dakinisAssertProductionJwtSecret } from "./src/api/jwt-config.js";
import { dakinisInitDb } from "./src/db/index.js";
import { dakinisEnforceRateLimit } from "./src/api/security.js";
import { dakinisStructuredLog } from "./src/api/structured-logger.js";
import { dakinisDispatch } from "./src/app.js";

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

      const started = Date.now();
      const result = await dakinisDispatch(req, rawBody, url);
      const ms = Date.now() - started;
      const rid = result.body?.meta?.requestId;
      const bizHeader = typeof req.headers["x-business-id"] === "string" ? req.headers["x-business-id"].trim() : "";
      dakinisStructuredLog({
        level: result.status >= 500 ? "error" : "info",
        msg: "http_request",
        method: req.method,
        path: url.pathname,
        status: result.status,
        ms,
        requestId: rid,
        businessIdHeader: bizHeader ? bizHeader.slice(0, 80) : undefined
      });
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Dakinis API listening on port ${PORT}`);
  console.log(`SQLite DB: ${process.env.SQLITE_PATH || "./data/dakinis.db"} (multi-tenant)`);
});
