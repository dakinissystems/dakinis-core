/** Mesas por defecto (salón + terraza) con posición % en el plano. */
export const DAKINIS_RESTAURANT_DEFAULT_FLOOR_TABLES = [
  ...[1, 2, 3, 4, 5].map((n, i) => ({
    id: `salon-${n}`,
    zone: "salon",
    label: `Salón ${n}`,
    x: 8 + i * 17,
    y: 22,
    seats: 4
  })),
  ...[1, 2, 3, 4, 5].map((n, i) => ({
    id: `terraza-${n}`,
    zone: "terraza",
    label: `Terraza ${n}`,
    x: 8 + i * 17,
    y: 62,
    seats: 4
  }))
];

export const DAKINIS_RESTAURANT_FLOOR_ZONES = Object.freeze({
  salon: { id: "salon", labelEs: "Salón", labelEn: "Dining room" },
  terraza: { id: "terraza", labelEs: "Terraza", labelEn: "Terrace" },
  barra: { id: "barra", labelEs: "Barra", labelEn: "Bar" }
});
