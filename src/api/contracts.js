export const DAKINIS_API_CONTRACT = {
  successShape: {
    ok: true,
    data: {},
    meta: {
      requestId: "string",
      adapter: "clinica|peluqueria|inmobiliaria|custom"
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

export const DAKINIS_ALLOWED_ADAPTERS = ["clinica", "peluqueria", "inmobiliaria", "custom"];
export const DAKINIS_BUSINESS_TYPE_HEADER = "x-business-type";
export const DAKINIS_BUSINESS_ID_HEADER = "x-business-id";

export const DAKINIS_ENTITY_BY_BUSINESS_TYPE = {
  clinica: "paciente",
  peluqueria: "reserva",
  inmobiliaria: "lead"
};
