/**
 * The one place an order's human-facing identifier is decided.
 *
 * Orders created before sequential numbering shipped have no orderNumber —
 * 18 of 43 in production — so a fallback is unavoidable. What matters is that
 * every surface picks the SAME one: the kitchen calling out "GMQKDA" while the
 * floor staff sees "000012" for the same order is how tickets get mixed up.
 *
 * The id suffix is uppercased because it is read off a kitchen screen at
 * distance; a numbered order is unaffected by casing.
 */
export const orderLabel = (order) => {
  if (!order) return '';
  if (order.orderNumber) return `#${order.orderNumber}`;
  if (order.id) return `#${String(order.id).slice(-6).toUpperCase()}`;
  return '';
};
