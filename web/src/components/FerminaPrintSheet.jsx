import FerminaPrintLogo from "./FerminaPrintLogo.jsx";
import { ferminaFormatOrderPlacedAt } from "../utils/ferminaPrintFormat.js";

/**
 * Ticket / PDF de comanda o factura.
 * @param {object} props
 * @param {"comanda"|"factura"} props.kind
 * @param {object} props.doc
 * @param {string} [props.businessName] — Negocio
 * @param {string} [props.dateLocale]
 * @param {function} [props.t] — i18n; si no, etiquetas en español
 * @param {function} [props.channelLabel]
 * @param {function} [props.paymentLabel]
 * @param {string} [props.caption] — solo vista previa en mockup (grid)
 * @param {boolean} [props.showLogo]
 */
export default function FerminaPrintSheet({
  kind,
  doc,
  businessName = "Fermina Food",
  dateLocale = "es-ES",
  t,
  channelLabel,
  paymentLabel,
  caption,
  showLogo = true
}) {
  const isComanda = kind === "comanda";
  const lineTotal = (l) => (l.qty * l.unitPrice).toFixed(2);

  const label = (key, fallback) => (t ? t(key) : fallback);

  const orderTitle = isComanda
    ? label("fermina.printComanda", "Comanda #{n}").replace("{n}", String(doc.orderNumber ?? "—"))
    : label("fermina.printFactura", "Factura {n}").replace("{n}", String(doc.invoiceNumber ?? "—"));

  const placedAt = isComanda
    ? ferminaFormatOrderPlacedAt(doc.createdAt, dateLocale)
    : ferminaFormatOrderPlacedAt(doc.createdAt || doc.issuedAt, dateLocale);

  const ch =
    isComanda && doc.channel && channelLabel ? channelLabel(doc.channel) : doc.channel || null;
  const pay =
    isComanda && doc.paymentMethod && paymentLabel
      ? paymentLabel(doc.paymentMethod)
      : doc.paymentMethod || null;

  const sheet = (
    <article className="fermina-print-sheet" aria-label={caption || orderTitle}>
      {showLogo ? <FerminaPrintLogo width={isComanda ? 160 : 140} /> : null}
      <h2 className="fermina-print-sheet__title">{orderTitle}</h2>
      <dl className="fermina-print-sheet__meta">
        <div className="fermina-print-sheet__meta-row">
          <dt>{label("fermina.printBusiness", "Negocio")}</dt>
          <dd>{doc.venueName || businessName}</dd>
        </div>
        {isComanda ? (
          <>
            <div className="fermina-print-sheet__meta-row">
              <dt>{label("fermina.printOrderRef", "Comanda")}</dt>
              <dd>#{doc.orderNumber ?? "—"}</dd>
            </div>
            <div className="fermina-print-sheet__meta-row">
              <dt>{label("fermina.printOrderTime", "Hora del pedido")}</dt>
              <dd>{placedAt}</dd>
            </div>
          </>
        ) : (
          <div className="fermina-print-sheet__meta-row">
            <dt>{label("fermina.printOrderTime", "Hora")}</dt>
            <dd>{placedAt}</dd>
          </div>
        )}
      </dl>
      {!isComanda ? (
        <p className="fermina-print-sheet__line">
          <strong>
            {doc.type === "gestor"
              ? label("fermina.invoiceManager", "Gestor / contabilidad")
              : label("fermina.invoiceClient", "Cliente (ticket)")}
          </strong>
          {doc.taxId ? ` · ${doc.taxId}` : ""}
        </p>
      ) : null}
      <p className="fermina-print-sheet__line">
        <strong>{doc.customerName}</strong>
        {doc.table ? ` · ${doc.table}` : ""}
      </p>
      {isComanda && (ch || pay) ? (
        <p className="fermina-print-sheet__line fermina-print-sheet__line--muted">
          {ch}
          {ch && pay ? " · " : null}
          {pay}
        </p>
      ) : null}
      <table className="mockup-table">
        <thead>
          <tr>
            <th>{label("fermina.colItem", "Plato")}</th>
            <th>{label("fermina.colQty", "Cant.")}</th>
            <th>{label("fermina.colPrice", "Importe")}</th>
          </tr>
        </thead>
        <tbody>
          {(doc.lines || []).map((l, i) => (
            <tr key={i}>
              <td>{l.name}</td>
              <td>{l.qty}</td>
              <td>{lineTotal(l)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="fermina-print-sheet__total">
        <strong>{(doc.total ?? 0).toFixed(2)} €</strong>
      </p>
      {!isComanda && doc.type === "gestor" && doc.subtotal != null ? (
        <p className="fermina-print-sheet__meta-note">
          Base {doc.subtotal.toFixed(2)} € · IVA 21% {doc.tax?.toFixed(2)} €
        </p>
      ) : null}
      {isComanda && doc.notes ? <p className="fermina-print-sheet__notes">{doc.notes}</p> : null}
    </article>
  );

  if (caption) {
    return (
      <div className="mockup-print-grid__cell">
        <p className="mockup-print-grid__label">{caption}</p>
        {sheet}
      </div>
    );
  }

  return sheet;
}
