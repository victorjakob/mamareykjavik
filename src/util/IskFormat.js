/**
 * Format a number as ISK price
 * @param {number} price - The price in ISK
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  let formatted = new Intl.NumberFormat("is-IS", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  // Replace comma with period for thousands separator (fallback for missing ICU)
  formatted = formatted.replace(/,/g, ".");
  return `${formatted} kr.`;
}
