import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const FALLBACK_IMAGE = 'https://placehold.co/600x600/e0e0e0/888888?text=Image+Unavailable';

const ProductCard = ({ product }) => {
  const {
    _id,
    name,
    price,
    discountPrice,
    effectivePrice,
    discountPercent,
    hasDiscount,
    images,
    ratings,
    stock,
    category,
  } = product;

  const displayPrice = effectivePrice !== undefined ? effectivePrice : (discountPrice > 0 ? discountPrice : price);
  const showDiscount = hasDiscount !== undefined ? hasDiscount : (discountPrice > 0 && discountPrice < price);
  const imageUrl = images && images.length > 0 ? images[0].url : FALLBACK_IMAGE;
  const imageAlt = images?.[0]?.alt || name;

  const handleImageError = (e) => {
    if (e.target.src !== FALLBACK_IMAGE) {
      e.target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <Link to={`/products/${_id}`} className="product-card">
      <div className="product-card-image-wrapper">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="product-card-image"
          onError={handleImageError}
          loading="lazy"
        />
        {showDiscount && discountPercent && (
          <span className="product-card-badge">{discountPercent}% OFF</span>
        )}
        {stock === 0 && <span className="product-card-badge out-of-stock">Out of Stock</span>}
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{category}</span>
        <h3 className="product-card-name">{name}</h3>

        {ratings?.count > 0 ? (
          <div className="rating-badge">
            <span className="rating-badge-star">★</span>
            <span className="rating-badge-value">{ratings.average.toFixed(1)}</span>
            <span className="rating-badge-count">({ratings.count})</span>
          </div>
        ) : (
          <span className="no-reviews-text">No reviews yet</span>
        )}

        <div className="product-card-price">
          {showDiscount && (
            <span className="product-card-original-price">{formatCurrency(price)}</span>
          )}
          <span className="product-card-current-price">{formatCurrency(displayPrice)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;