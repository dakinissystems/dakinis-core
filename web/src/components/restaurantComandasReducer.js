export const RESTAURANT_COMANDAS_INITIAL = {
  menu: [],
  brand: null,
  orders: [],
  invoices: [],
  cart: {},
  table: "",
  customerName: "",
  channel: "salon",
  paymentMethod: "tarjeta",
  notes: "",
  invoiceType: "cliente",
  taxId: "",
  selectedOrderId: "",
  printDoc: null,
  tables: null,
  tableSessions: {},
  selectedTableId: null,
  mesaClosePayment: "tarjeta",
  error: "",
  busy: false
};

export function restaurantComandasReducer(state, action) {
  switch (action.type) {
    case "loaded":
      return {
        ...state,
        menu: action.menu,
        brand: action.brand,
        orders: action.orders,
        invoices: action.invoices,
        tables: action.tables,
        tableSessions: action.tableSessions,
        error: ""
      };
    case "setField":
      return { ...state, [action.field]: action.value };
    case "patch":
      return { ...state, ...action.payload };
    case "setError":
      return { ...state, error: action.error };
    case "setBusy":
      return { ...state, busy: action.busy };
    default:
      return state;
  }
}
