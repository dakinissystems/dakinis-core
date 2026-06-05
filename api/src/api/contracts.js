export const DAKINIS_API_CONTRACT = {
  successShape: {
    ok: true,
    data: {},
    meta: {
      requestId: "string",
      adapter: "clinica|peluqueria|restaurante|inmobiliaria|custom"
    }
  },
  errorShape: {
    ok: false,
    error: {
      code: "string",
      message: "string",
      details: {}
    },
    meta: {
      requestId: "string"
    }
  }
};

import { DAKINIS_CORE_INDUSTRY_KEYS, DAKINIS_INDUSTRY_TEMPLATES } from "@dakinis/shared/catalog/business-templates.js";

export const DAKINIS_ALLOWED_ADAPTERS = [
  ...DAKINIS_CORE_INDUSTRY_KEYS,
  "platform",
  "custom"
];
export const DAKINIS_BUSINESS_TYPE_HEADER = "x-business-type";
export const DAKINIS_BUSINESS_ID_HEADER = "x-business-id";

export const DAKINIS_ENTITY_BY_BUSINESS_TYPE = {
  ...Object.fromEntries(
    DAKINIS_CORE_INDUSTRY_KEYS.map((k) => [k, DAKINIS_INDUSTRY_TEMPLATES[k]?.entity || "cliente"])
  ),
  platform: "_platform",
  custom: "cliente"
};
