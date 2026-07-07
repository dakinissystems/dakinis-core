import {
  DAKINIS_RESTAURANT_CHANNEL_IDS,
  DAKINIS_RESTAURANT_PAYMENT_IDS,
  dakinisNormalizeRestaurantChannel,
  dakinisNormalizeRestaurantPayment
} from "@dakinis/shared/catalog/restaurant-kitchen.js";

const CHANNEL_I18N = {
  salon: "fermina.channelSalon",
  takeaway: "fermina.channelTakeaway",
  delivery: "fermina.channelDelivery",
  glovo: "fermina.channelGlovo",
  uber: "fermina.channelUber"
};

const PAYMENT_I18N = {
  efectivo: "fermina.paymentCash",
  tarjeta: "fermina.paymentCard"
};

export function dakinisRestaurantChannelLabel(channel, t) {
  const id = dakinisNormalizeRestaurantChannel(channel);
  const key = CHANNEL_I18N[id];
  return key ? t(key) : id;
}

export function dakinisRestaurantPaymentLabel(payment, t) {
  const id = dakinisNormalizeRestaurantPayment(payment);
  const key = PAYMENT_I18N[id];
  return key ? t(key) : id;
}

function dakinisRestaurantIsAppChannel(channelId) {
  const id = dakinisNormalizeRestaurantChannel(channelId);
  return id === "glovo" || id === "uber";
}

const RESTAURANT_CHANNEL_IDS = DAKINIS_RESTAURANT_CHANNEL_IDS ?? [
  "salon",
  "takeaway",
  "delivery",
  "glovo",
  "uber"
];

export const DAKINIS_RESTAURANT_LOCAL_CHANNEL_IDS = RESTAURANT_CHANNEL_IDS.filter(
  (id) => !dakinisRestaurantIsAppChannel(id)
);

export const DAKINIS_RESTAURANT_APP_CHANNEL_IDS = RESTAURANT_CHANNEL_IDS.filter((id) =>
  dakinisRestaurantIsAppChannel(id)
);

/** Totales de cierre del día (solo pedidos entregados). */
export function dakinisRestaurantDayCloseSummary(orders, t) {
  const closed = orders.filter((o) => o.status === "entregada");
  const byPayment = Object.fromEntries(
    DAKINIS_RESTAURANT_PAYMENT_IDS.map((id) => [
      id,
      { id, label: dakinisRestaurantPaymentLabel(id, t), total: 0, count: 0 }
    ])
  );
  const byChannel = Object.fromEntries(
    RESTAURANT_CHANNEL_IDS.map((id) => [
      id,
      { id, label: dakinisRestaurantChannelLabel(id, t), total: 0, count: 0 }
    ])
  );
  let grandTotal = 0;
  for (const o of closed) {
    const total = Number(o.total) || 0;
    grandTotal += total;
    const pay = dakinisNormalizeRestaurantPayment(o.paymentMethod);
    const ch = dakinisNormalizeRestaurantChannel(o.channel);
    byPayment[pay].total += total;
    byPayment[pay].count += 1;
    byChannel[ch].total += total;
    byChannel[ch].count += 1;
  }
  return {
    closed,
    grandTotal,
    byPayment: Object.values(byPayment),
    byChannel: Object.values(byChannel)
  };
}
