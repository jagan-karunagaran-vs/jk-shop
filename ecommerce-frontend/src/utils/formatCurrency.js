/**
 * Shared INR currency formatter used across the entire frontend.
 *
 * Per requirements: all existing demo amounts are treated as already
 * being in INR — no exchange-rate conversion is applied here. This
 * function only formats a number into a display string; it never
 * mutates or converts the underlying numeric value, which continues to
 * be stored/sent as a plain number everywhere (cart state, order
 * payloads, etc.).
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a number as an Indian Rupee string, e.g. 1999 -> "₹1,999.00".
 * Falls back to "₹0.00" for null/undefined/NaN input so the UI never
 * renders "NaN" or crashes if data is momentarily missing while loading.
 *
 * @param {number|null|undefined} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const numericAmount = Number(amount);

  if (amount === null || amount === undefined || Number.isNaN(numericAmount)) {
    return inrFormatter.format(0);
  }

  return inrFormatter.format(numericAmount);
};

export default formatCurrency;