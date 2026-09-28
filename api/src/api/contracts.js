export const DAKINIS_API_CONTRACT = {
  successShape: {
    ok: true,
    data: {},
    meta: {
      requestId: "string",
      adapter:
        "clinica|peluqueria|restaurante|burger|pizzeria|bar|cafeteria|heladeria|foodtruck|inmobiliaria|custom"
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

export const DAKINIS_ALLOWED_ADAPTERS = [
  "clinica",
  "peluqueria",
  "restaurante",
  "burger",
  "pizzeria",
  "bar",
  "cafeteria",
  "heladeria",
  "foodtruck",
  "inmobiliaria",
  "platform",
  "custom"
];
export const DAKINIS_BUSINESS_TYPE_HEADER = "x-business-type";
export const DAKINIS_BUSINESS_ID_HEADER = "x-business-id";

export const DAKINIS_ENTITY_BY_BUSINESS_TYPE = {
  clinica: "paciente",
  peluqueria: "reserva",
  restaurante: "comanda",
  burger: "comanda",
  pizzeria: "comanda",
  bar: "comanda",
  cafeteria: "comanda",
  heladeria: "comanda",
  foodtruck: "comanda",
  inmobiliaria: "lead",
  platform: "_platform"
};
