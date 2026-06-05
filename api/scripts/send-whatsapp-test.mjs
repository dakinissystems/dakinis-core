#!/usr/bin/env node
/**
 * Envío de prueba por WhatsApp Cloud API (usa variables WHATSAPP_* del .env).
 *
 *   cd platform/core/api
 *   node scripts/send-whatsapp-test.mjs 34637169174 "Hola este es un test"
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { dakinisSendWhatsappText } from "../src/services/whatsapp-cloud.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile(resolve(__dirname, "../../.env"));
loadEnvFile(resolve(__dirname, "../.env"));

const phone = process.argv[2] || process.env.WHATSAPP_TEST_PHONE;
const message =
  process.argv.slice(3).join(" ") || "Hola este es un test para ver si funciona";

if (!phone) {
  console.error("Uso: node scripts/send-whatsapp-test.mjs <telefono_e164_sin_+> [mensaje]");
  process.exit(1);
}

try {
  const result = await dakinisSendWhatsappText({ to: phone, text: message });
  console.log("[whatsapp-test] Enviado OK");
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error("[whatsapp-test] Fallo:", err.message || err);
  if (err.details) console.error(JSON.stringify(err.details, null, 2));
  process.exit(1);
}
