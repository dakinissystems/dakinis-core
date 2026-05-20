/**
 * Sirve el SPA (web/dist) y reenvía /api al servicio Dakinis API.
 * Evita "Failed to fetch" en core.dakinissystems.com cuando el front no tiene API en el mismo proceso.
 */
import http from "node:http";
import https from "node:https";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");
const PORT = Number(process.env.PORT || 8080);
const UPSTREAM_RAW =
  process.env.API_UPSTREAM ||
  process.env.VITE_API_BASE_URL ||
  process.env.VITE_API_URL ||
  "https://dakinis-core-production.up.railway.app";
const UPSTREAM = UPSTREAM_RAW.replace(/\/+$/, "");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
  ".woff2": "font/woff2"
};

function dakinisProxyToApi(req, res, bodyBuffer) {
  const target = new URL(req.url || "/", `${UPSTREAM}/`);
  const isHttps = target.protocol === "https:";
  const client = isHttps ? https : http;

  const headers = { ...req.headers, host: target.host };
  delete headers.connection;

  const proxyReq = client.request(
    {
      hostname: target.hostname,
      port: target.port || (isHttps ? 443 : 80),
      path: target.pathname + target.search,
      method: req.method,
      headers
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("[proxy]", err.message);
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        ok: false,
        error: {
          code: "API_UPSTREAM_UNAVAILABLE",
          message: `No se pudo conectar con la API (${UPSTREAM}). Comprueba API_UPSTREAM en Railway.`
        }
      })
    );
  });

  if (bodyBuffer?.length) proxyReq.write(bodyBuffer);
  proxyReq.end();
}

async function dakinisServeStatic(pathname, res) {
  let safe = pathname === "/" ? "/index.html" : pathname;
  safe = safe.split("?")[0];
  const filePath = path.join(DIST, safe);

  if (!filePath.startsWith(DIST)) {
    res.writeHead(403).end();
    return;
  }

  let target = filePath;
  if (!existsSync(target) || path.extname(target) === "") {
    target = path.join(DIST, "index.html");
  }

  try {
    const data = await readFile(target);
    const ext = path.extname(target);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    const url = req.url || "/";

    if (url.startsWith("/api")) {
      dakinisProxyToApi(req, res, body);
      return;
    }

    dakinisServeStatic(url, res);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Dakinis web: http://0.0.0.0:${PORT}  static=${DIST}`);
  console.log(`Dakinis web: /api -> ${UPSTREAM}`);
});
