/**
 * PriceResolver — strategy de precios por canal.
 *
 * Pipeline (extensible sin tocar Delivery):
 *   Base → Channel rules → Overrides → Campaign → Coupon → Taxes → Final
 *
 * Hoy implementa Base + Channel rules + Overrides (PriceListService).
 * Campaign / Coupon / Taxes: hooks documentados para Fase escandallo / promo.
 */

import { dakinisApplyPriceListToLines } from "./PriceListService.js";

/**
 * @param {string} businessId
 * @param {Array<object>} lines
 * @param {string} channel
 * @param {{ force?: boolean, campaign?: object, coupon?: object }} [opts]
 */
export async function dakinisPriceResolve(businessId, lines, channel, opts = {}) {
  // 1–3: base + channel rules + overrides (PriceList)
  let priced = await dakinisApplyPriceListToLines(businessId, lines, channel, {
    force: opts.force !== false
  });

  // 4: Campaign (futuro — happy hour, 2x1, menú del día)
  if (opts.campaign && typeof opts.campaign.apply === "function") {
    priced = await opts.campaign.apply(priced, { businessId, channel });
  }

  // 5: Coupon (futuro)
  if (opts.coupon && typeof opts.coupon.apply === "function") {
    priced = await opts.coupon.apply(priced, { businessId, channel });
  }

  // 6: Taxes (futuro — IVA por línea / jurisdicción)
  // Final = líneas con unitPrice resuelto
  return priced;
}
