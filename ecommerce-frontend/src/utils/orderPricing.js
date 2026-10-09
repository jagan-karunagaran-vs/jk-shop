/**
 * Frontend mirror of the backend's order pricing rule, used ONLY to show
 * the customer a live estimate while they're on the Cart/Checkout page
 * (so they see totals update instantly as they change quantities).
 *
 * IMPORTANT: this is a display-only estimate. The backend
 * (ecommerce-backend/utils/orderPricing.js) is the sole source of truth
 * and recalculates everything from scratch when the order is actually
 * created — this file's output is never sent to the server as
 * authoritative pricing (see orderThunks.js / Cart.jsx: the request body
 * only sends orderItems/shippingAddress/paymentMethod).
 *
 * RULE (unchanged from the original project — documented, not invented):
 *   - taxPrice      = 8% of itemsPrice
 *   - shippingPrice = ₹0 if itemsPrice > ₹100, otherwise ₹10 flat
 *   - totalPrice    = itemsPrice + taxPrice + shippingPrice
 *
 * This is a placeholder demo rule, NOT GST.
 */

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_FEE = 10;

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * @param {Array<{ price: number, quantity: number }>} cartItems
 * @returns {{ itemsPrice: number, taxPrice: number, shippingPrice: number, totalPrice: number }}
 */
export const calculateOrderPricing = (cartItems) => {
  const itemsPrice = round2(
    cartItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
  );

  const taxPrice = round2(itemsPrice * TAX_RATE);
  const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return { itemsPrice, taxPrice, shippingPrice, totalPrice };
};

export default calculateOrderPricing;