const hasActiveDiscount = (product) => {
  const price = Number(product?.price) || 0;
  const discountPrice = Number(product?.discountPrice) || 0;
  return discountPrice > 0 && discountPrice < price;
};

const getEffectivePrice = (product) => {
  return hasActiveDiscount(product) ? Number(product.discountPrice) : Number(product.price) || 0;
};

const getDiscountPercent = (product) => {
  if (!hasActiveDiscount(product)) {
    return { hasDiscount: false, exactPercent: null, roundedPercent: null };
  }

  const price = Number(product.price);
  const discountPrice = Number(product.discountPrice);

  const exactPercent = ((price - discountPrice) / price) * 100;
  const roundedPercent = Math.round(exactPercent);

  return {
    hasDiscount: true,
    exactPercent: Math.round(exactPercent * 10) / 10,
    roundedPercent,
  };
};

export { hasActiveDiscount, getEffectivePrice, getDiscountPercent };