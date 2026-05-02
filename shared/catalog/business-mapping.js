/** Slug de tenant seeded en SQLite (`business.slug`) por vertical demo. */
export const DAKINIS_BUSINESS_SLUG_BY_VERTICAL = {
  clinica: "clinica-demo",
  peluqueria: "peluqueria-demo",
  restaurante: "restaurante-demo",
  inmobiliaria: "inmobiliaria-demo"
};

/** Debe coincidir con API `DAKINIS_ENTITY_BY_BUSINESS_TYPE`. */
export const DAKINIS_ENTITY_BY_VERTICAL = {
  clinica: "paciente",
  peluqueria: "reserva",
  restaurante: "comanda",
  inmobiliaria: "lead"
};
