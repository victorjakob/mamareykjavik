/**
 * Format a number as ISK price
 * @param {number} price - The price in ISK
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
