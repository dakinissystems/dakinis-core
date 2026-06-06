import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { dakinisCallApi, dakinisParseApiBody } from "./helpers/dispatch-test.js";

const tmpDb = path.join(os.tmpdir(), `dakinis-security-${process.pid}.db`);

let dispatch;
let dakinisExec;

async function dakinisLogin(email, password = "demo123") {
  const res = await dakinisCallApi(dispatch, {
    method: "POST",
    path: "/api/auth/login",
    headers: { "Content-Type": "application/json" },
    body: { email, password }
  });
  const json = dakinisParseApiBody(res);
  assert.equal(res.status, 200, JSON.stringify(json));
  return json.data.token;
}

before(async () => {
  if (fs.existsSync(tmpDb)) fs.unlinkSync(tmpDb);

  process.env.NODE_ENV = "test";
  process.env.DB_DRIVER = "sqlite";
  process.env.SQLITE_PATH = tmpDb;
  process.env.JWT_SECRET = "test-jwt-secret-minimum-32-characters-long";
  process.env.DAKINIS_MASTER_API_KEY = "test-master-key-not-the-dev-default";
  process.env.WHATSAPP_APP_SECRET = "test-webhook-secret";
  process.env.OPENAI_API_KEY = "";

  const dbMod = await import("../src/db/index.js");
  await dbMod.dakinisInitDb();
  dakinisExec = dbMod.dakinisExec;

  await dakinisExec("UPDATE business SET plan = 'growth' WHERE slug = 'peluqueria-demo'");
  await dakinisExec("UPDATE business SET plan = 'pro' WHERE slug = 'restaurante-demo'");

  const appMod = await import("../src/app.js");
  dispatch = appMod.dakinisDispatch;
});

describe("security integration", { concurrency: 1 }, () => {
  it("login devuelve JWT válido", async () => {
    const token = await dakinisLogin("admin@clinica-demo.local");
    assert.ok(token && token.length > 20);
  });

  it("JWT inválido devuelve 401", async () => {
    const res = await dakinisCallApi(dispatch, {
      path: "/api/me",
      headers: {
        Authorization: "Bearer not-a-real-jwt",
        "x-business-id": "clinica-demo"
      }
    });
    assert.equal(res.status, 401);
  });

  it("JWT con tenant slug distinto del business.id devuelve TENANT_MISMATCH", async () => {
    const token = jwt.sign(
      {
        sub: "usr_0001",
        tenant: "clinica-demo",
        tenantId: "clinica-demo",
        bid: "clinica-demo",
        role: "admin",
        email: "admin@clinica-demo.local"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256",
        issuer: "dakinis-core",
        audience: "dakinis-core-api"
      }
    );
    const res = await dakinisCallApi(dispatch, {
      path: "/api/me",
      headers: {
        authorization: `Bearer ${token}`,
        "x-business-id": "clinica-demo"
      }
    });
    assert.equal(res.status, 403);
    const json = dakinisParseApiBody(res);
    assert.equal(json?.error?.code, "TENANT_MISMATCH");
  });

  it("cada tenant aísla su perfil (A ≠ B)", async () => {
    const tokenA = await dakinisLogin("admin@clinica-demo.local");
    const tokenB = await dakinisLogin("admin@peluqueria-demo.local");
    const resA = await dakinisCallApi(dispatch, {
      path: "/api/v1/tenant/profile",
      headers: { authorization: `Bearer ${tokenA}`, "x-business-id": "clinica-demo" }
    });
    const resB = await dakinisCallApi(dispatch, {
      path: "/api/v1/tenant/profile",
      headers: { authorization: `Bearer ${tokenB}`, "x-business-id": "peluqueria-demo" }
    });
    assert.equal(resA.status, 200);
    assert.equal(resB.status, 200);
    const jsonA = dakinisParseApiBody(resA);
    const jsonB = dakinisParseApiBody(resB);
    assert.equal(jsonA.data.business.slug, "clinica-demo");
    assert.equal(jsonB.data.business.slug, "peluqueria-demo");
    assert.notEqual(jsonA.data.business.id, jsonB.data.business.id);
  });

  it("Starter no puede usar Copilot (403 PLAN)", async () => {
    const token = await dakinisLogin("admin@clinica-demo.local");
    const res = await dakinisCallApi(dispatch, {
      method: "POST",
      path: "/api/v1/tenant/copilot",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-business-id": "clinica-demo",
        "Content-Type": "application/json"
      },
      body: { question: "Hola" }
    });
    assert.equal(res.status, 403);
    const json = dakinisParseApiBody(res);
    assert.equal(json?.error?.code, "PLAN_MODULE_DENIED");
  });

  it("Growth puede acceder a CRM meta", async () => {
    const token = await dakinisLogin("admin@peluqueria-demo.local");
    const res = await dakinisCallApi(dispatch, {
      path: "/api/v1/crm/meta",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-business-id": "peluqueria-demo"
      }
    });
    assert.equal(res.status, 200);
  });

  it("Starter no puede acceder a CRM meta", async () => {
    const token = await dakinisLogin("admin@clinica-demo.local");
    const res = await dakinisCallApi(dispatch, {
      path: "/api/v1/crm/meta",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-business-id": "clinica-demo"
      }
    });
    assert.equal(res.status, 403);
  });

  it("webhook WhatsApp rechaza firma incorrecta", async () => {
    const body = JSON.stringify({ entry: [] });
    const res = await dakinisCallApi(dispatch, {
      method: "POST",
      path: "/api/webhooks/whatsapp",
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": "sha256=deadbeef"
      },
      body
    });
    assert.equal(res.status, 403);
    const json = dakinisParseApiBody(res);
    assert.equal(json?.error?.code, "INVALID_SIGNATURE");
  });

  it("webhook WhatsApp acepta firma válida", async () => {
    const body = JSON.stringify({ entry: [] });
    const sig = crypto.createHmac("sha256", "test-webhook-secret").update(body, "utf8").digest("hex");
    const res = await dakinisCallApi(dispatch, {
      method: "POST",
      path: "/api/webhooks/whatsapp",
      headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": `sha256=${sig}`
      },
      body
    });
    assert.equal(res.status, 200);
  });

  it("master key dev rechazada en producción al arrancar", async () => {
    const prev = process.env.NODE_ENV;
    const prevKey = process.env.DAKINIS_MASTER_API_KEY;
    process.env.NODE_ENV = "production";
    process.env.DAKINIS_MASTER_API_KEY = "dakinis-dev-key";
    const { dakinisAssertProductionMasterApiKey } = await import("../src/api/master-key-config.js");
    assert.throws(() => dakinisAssertProductionMasterApiKey(), /MASTER API KEY|dakinis-dev-key/i);
    process.env.NODE_ENV = prev;
    process.env.DAKINIS_MASTER_API_KEY = prevKey;
  });
});
