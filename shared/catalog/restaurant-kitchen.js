/** Insumos y recetas demo (caso Manu: pizzas + empanadas). */

export const DAKINIS_RESTAURANT_DEFAULT_ITEMS = [
  { slug: "harina", name: "Harina", unit: "g", minQuantity: 500 },
  { slug: "agua", name: "Agua", unit: "ml", minQuantity: 200 },
  { slug: "sal", name: "Sal", unit: "g", minQuantity: 50 },
  { slug: "levadura", name: "Levadura", unit: "g", minQuantity: 20 },
  { slug: "cebolla", name: "Cebolla", unit: "g", minQuantity: 300 },
  { slug: "morron", name: "Morrón", unit: "g", minQuantity: 200 },
  { slug: "carne", name: "Carne picada", unit: "g", minQuantity: 500 },
  { slug: "tapas", name: "Tapas empanada", unit: "u", minQuantity: 12 },
  { slug: "huevo", name: "Huevo", unit: "u", minQuantity: 6 },
  { slug: "aceitunas", name: "Aceitunas (frasco)", unit: "frasco", minQuantity: 1 }
];

/** Cada batch de empanadas rinde 3 docenas (36 u) con los insumos indicados por Manu. */
export const DAKINIS_RESTAURANT_DEFAULT_RECIPES = [
  {
    slug: "pizza-prepizza",
    name: "Pizza (prepizza)",
    outputLabel: "Prepizzas",
    outputQuantity: 1,
    outputUnit: "u",
    lines: [
      { itemSlug: "harina", quantity: 1000, unit: "g" },
      { itemSlug: "agua", quantity: 600, unit: "ml" },
      { itemSlug: "sal", quantity: 25, unit: "g" },
      { itemSlug: "levadura", quantity: 10, unit: "g" }
    ]
  },
  {
    slug: "empanadas-docena",
    name: "Empanadas (3 docenas)",
    outputLabel: "Empanadas",
    outputQuantity: 36,
    outputUnit: "u",
    lines: [
      { itemSlug: "cebolla", quantity: 1000, unit: "g" },
      { itemSlug: "morron", quantity: 500, unit: "g" },
      { itemSlug: "carne", quantity: 1000, unit: "g" },
      { itemSlug: "tapas", quantity: 36, unit: "u" },
      { itemSlug: "huevo", quantity: 4, unit: "u" },
      { itemSlug: "aceitunas", quantity: 0.25, unit: "frasco" }
    ]
  }
];

/** Pedido de compra de ejemplo → stock inicial aproximado. */
export const DAKINIS_RESTAURANT_DEMO_PURCHASE = [
  { itemSlug: "harina", quantity: 5000 },
  { itemSlug: "cebolla", quantity: 4000 },
  { itemSlug: "morron", quantity: 3000 },
  { itemSlug: "tapas", quantity: 120 },
  { itemSlug: "aceitunas", quantity: 5 },
  { itemSlug: "huevo", quantity: 48 },
  { itemSlug: "sal", quantity: 1000 },
  { itemSlug: "levadura", quantity: 500 },
  { itemSlug: "carne", quantity: 4000 },
  { itemSlug: "agua", quantity: 3000 }
];

/** Producción objetivo aproximada del ejemplo Manu. */
export const DAKINIS_RESTAURANT_DEMO_PRODUCTION = [
  { recipeSlug: "pizza-prepizza", batches: 4 },
  { recipeSlug: "empanadas-docena", batches: 1 }
];

/**
 * Consumo total de insumos para N batches de varias recetas.
 * @param {Array<{ recipeSlug: string, batches: number }>} plan
 * @param {Array} recipes
 */
export function dakinisRestaurantPlanConsumption(plan, recipes) {
  const needed = {};
  for (const row of plan) {
    const recipe = recipes.find((r) => r.slug === row.recipeSlug);
    if (!recipe || row.batches <= 0) continue;
    for (const line of recipe.lines) {
      needed[line.itemSlug] = (needed[line.itemSlug] || 0) + line.quantity * row.batches;
    }
  }
  return needed;
}

/**
 * Salida esperada por plan de producción.
 */
export function dakinisRestaurantPlanOutputs(plan, recipes) {
  const outputs = [];
  for (const row of plan) {
    const recipe = recipes.find((r) => r.slug === row.recipeSlug);
    if (!recipe || row.batches <= 0) continue;
    outputs.push({
      recipeSlug: recipe.slug,
      recipeName: recipe.name,
      batches: row.batches,
      totalOutput: recipe.outputQuantity * row.batches,
      outputLabel: recipe.outputLabel,
      outputUnit: recipe.outputUnit
    });
  }
  return outputs;
}

/**
 * Máximo de batches por receta si se dedicara todo el stock a esa receta.
 */
export function dakinisRestaurantMaxBatchesPerRecipe(stockBySlug, recipes) {
  return recipes.map((recipe) => {
    let maxBatches = Infinity;
    for (const line of recipe.lines) {
      const available = Number(stockBySlug[line.itemSlug] ?? 0);
      const perBatch = Number(line.quantity);
      if (perBatch <= 0) continue;
      maxBatches = Math.min(maxBatches, Math.floor(available / perBatch));
    }
    if (!Number.isFinite(maxBatches) || maxBatches < 0) maxBatches = 0;
    return {
      recipeSlug: recipe.slug,
      recipeName: recipe.name,
      maxBatches,
      outputPerBatch: recipe.outputQuantity,
      outputUnit: recipe.outputUnit,
      outputLabel: recipe.outputLabel
    };
  });
}

export function dakinisRestaurantValidatePlan(plan, recipes, stockBySlug) {
  const needed = dakinisRestaurantPlanConsumption(plan, recipes);
  const shortages = [];
  for (const [slug, qty] of Object.entries(needed)) {
    const have = Number(stockBySlug[slug] ?? 0);
    if (have + 1e-6 < qty) {
      shortages.push({ itemSlug: slug, needed: qty, available: have, missing: qty - have });
    }
  }
  return { ok: shortages.length === 0, needed, shortages };
}
