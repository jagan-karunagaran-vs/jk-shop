const hasActiveDiscount = (product) => {
  const price = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice) || 0;

  return discountPrice > 0 && discountPrice < price;
};

const getEffectivePrice = (product) => {
  return hasActiveDiscount(product)
    ? Number(product.discountPrice)
    : Number(product?.price) || 0;
};

const getDiscountPercent = (product) => {
  if (!hasActiveDiscount(product)) {
    return {
      hasDiscount: false,
      exactPercent: null,
      roundedPercent: null,
    };
  }

  const price = Number(product.price);
  const discountPrice = Number(product.discountPrice);
  const percentage = ((price - discountPrice) / price) * 100;

  return {
    hasDiscount: true,
    exactPercent: Math.round(percentage * 10) / 10,
    roundedPercent: Math.round(percentage),
  };
};

module.exports = {
  hasActiveDiscount,
  getEffectivePrice,
  getDiscountPercent,
};