const { getEffectivePrice } = require('./pricing');

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_FEE = 10;

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const calculateOrderPricing = (itemsPrice) => {
  const safeItemsPrice = round2(Math.max(0, Number(itemsPrice) || 0));

  const taxPrice = round2(safeItemsPrice * TAX_RATE);
  const shippingPrice = safeItemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const totalPrice = round2(safeItemsPrice + taxPrice + shippingPrice);

  return {
    itemsPrice: safeItemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  };
};

const getEffectiveUnitPrice = (product) => getEffectivePrice(product);

module.exports = {
  calculateOrderPricing,
  getEffectiveUnitPrice,
  TAX_RATE,
  FREE_SHIPPING_THRESHOLD,
  FLAT_SHIPPING_FEE,
};