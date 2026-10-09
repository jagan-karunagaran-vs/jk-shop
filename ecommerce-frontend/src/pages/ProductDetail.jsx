import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import {
  fetchProductById,
  createProductReview,
} from '../redux/thunks/productThunks';
import { clearCurrentProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/formatCurrency';
import {
  getDiscountPercent,
  getEffectivePrice,
} from '../utils/pricing';

const FALLBACK_IMAGE =
  'https://placehold.co/600x600/e0e0e0/888888?text=Image+Unavailable';

const isDemoReviewComment = (comment) =>
  typeof comment === 'string' && comment.startsWith('[Demo review]');

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentProduct: product,
    loading,
    error,
  } = useSelector((state) => state.products);

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [addedToCartMessage, setAddedToCartMessage] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [relatedError, setRelatedError] = useState(null);
  const [relatedRetry, setRelatedRetry] = useState(0);

  const cartTimer = useRef(null);
  const reviewTimer = useRef(null);
  const activeProductId = useRef(null);

  useEffect(() => {
    activeProductId.current = id;

    setQuantity(1);
    setReviewRating(5);
    setReviewComment('');
    setReviewSubmitting(false);
    setReviewSubmitError(null);
    setReviewSubmitSuccess(false);
    setAddedToCartMessage(false);

    dispatch(fetchProductById(id));

    return () => {
      activeProductId.current = null;
      clearTimeout(cartTimer.current);
      clearTimeout(reviewTimer.current);
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const fetchRelated = async () => {
      setRelatedLoading(true);
      setRelatedError(null);
      setRelatedProducts([]);

      try {
        const response = await axiosInstance.get(
          `/analytics/related/${id}`,
          { signal: controller.signal }
        );

        if (!isCancelled) {
          const related = Array.isArray(response.data.related)
            ? response.data.related
            : [];

          setRelatedProducts(
            related.filter(
              (item) => item?.product?._id && item.product._id !== id
            )
          );
        }
      } catch {
        if (!isCancelled) {
          setRelatedError(
            'Unable to load product suggestions. Please try again.'
          );
        }
      } finally {
        if (!isCancelled) {
          setRelatedLoading(false);
        }
      }
    };

    fetchRelated();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [id, relatedRetry]);

  const handleImageError = (event) => {
    const image = event.currentTarget;

    if (image.getAttribute('src') !== FALLBACK_IMAGE) {
      image.src = FALLBACK_IMAGE;
    }
  };

  const handleAddToCart = () => {
    if (!product || product._id !== id || product.stock <= 0) return;

    const safeQuantity = Math.max(
      1,
      Math.min(Math.floor(Number(quantity) || 1), product.stock)
    );

    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: getEffectivePrice(product),
        image: product.images?.[0]?.url || '',
        quantity: safeQuantity,
        stock: product.stock,
      })
    );

    setQuantity(safeQuantity);
    setAddedToCartMessage(true);

    clearTimeout(cartTimer.current);
    cartTimer.current = setTimeout(
      () => setAddedToCartMessage(false),
      2500
    );
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (reviewSubmitting) return;

    const comment = reviewComment.trim();

    setReviewSubmitError(null);
    setReviewSubmitSuccess(false);

    if (!comment) {
      setReviewSubmitError('Please enter a review.');
      return;
    }

    setReviewSubmitting(true);
    const submittedProductId = id;

    try {
      const result = await dispatch(
        createProductReview({
          productId: submittedProductId,
          rating: reviewRating,
          comment,
        })
      );

      if (activeProductId.current !== submittedProductId) return;

      if (createProductReview.fulfilled.match(result)) {
        setReviewComment('');
        setReviewRating(5);
        setReviewSubmitSuccess(true);
        dispatch(fetchProductById(submittedProductId));

        clearTimeout(reviewTimer.current);
        reviewTimer.current = setTimeout(
          () => setReviewSubmitSuccess(false),
          3000
        );
      } else {
        setReviewSubmitError(
          typeof result.payload === 'string'
            ? result.payload
            : result.payload?.message ||
                'Failed to submit review. Please try again.'
        );
      }
    } catch {
      if (activeProductId.current === submittedProductId) {
        setReviewSubmitError(
          'Failed to submit review. Please try again.'
        );
      }
    } finally {
      if (activeProductId.current === submittedProductId) {
        setReviewSubmitting(false);
      }
    }
  };

  if (loading) {
    return <p className="loading-text">Loading product...</p>;
  }

  if (error) {
    return (
      <p className="error-text" role="alert">
        {typeof error === 'string'
          ? error
          : error.message || 'Unable to load product.'}
      </p>
    );
  }

  if (!product || product._id !== id) {
    return <p className="loading-text">Loading product...</p>;
  }

  const displayPrice = getEffectivePrice(product);
  const discountInfo = getDiscountPercent(product);
  const primaryImage = product.images?.[0]?.url || FALLBACK_IMAGE;
  const primaryImageAlt = product.images?.[0]?.alt || product.name;
  const reviewCount = Number(product.ratings?.count) || 0;
  const averageRating = Number(product.ratings?.average) || 0;
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  return (
    <div className="product-detail-page">
      <div className="product-detail-main">
        <div className="product-detail-images">
          <div className="product-detail-image-wrapper">
            <img
              src={primaryImage}
              alt={primaryImageAlt}
              onError={handleImageError}
            />
          </div>
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-detail-brand">{product.brand}</p>

          {reviewCount > 0 ? (
            <div className="rating-badge">
              <span className="rating-badge-star" aria-hidden="true">
                ★
              </span>
              <span className="rating-badge-value">
                {averageRating.toFixed(1)}
              </span>
              <span className="rating-badge-count">
                ({reviewCount} reviews)
              </span>
            </div>
          ) : (
            <span className="no-reviews-text">No reviews yet</span>
          )}

          <div className="product-detail-price">
            {discountInfo.hasDiscount && (
              <span className="original-price">
                {formatCurrency(product.price)}
              </span>
            )}

            <span className="current-price">
              {formatCurrency(displayPrice)}
            </span>

            {discountInfo.hasDiscount && (
              <span className="discount-percent-badge">
                {discountInfo.roundedPercent}% OFF
              </span>
            )}
          </div>

          <p className="product-detail-description">
            {product.description}
          </p>

          <p
            className={`product-detail-stock ${
              product.stock > 0 ? '' : 'out'
            }`}
          >
            {product.stock > 0
              ? `${product.stock} in stock`
              : 'Out of stock'}
          </p>

          {product.stock > 0 && (
            <div className="product-detail-actions">
              <label
                htmlFor="product-quantity-input"
                className="sr-only"
              >
                Quantity
              </label>

              <input
                type="number"
                id="product-quantity-input"
                name="quantity"
                min="1"
                max={product.stock}
                step="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.max(
                      1,
                      Math.min(
                        Math.floor(Number(event.target.value) || 1),
                        product.stock
                      )
                    )
                  )
                }
              />

              <button type="button" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>
            </div>
          )}

          {addedToCartMessage && (
            <p className="success-text" role="status">
              Added to cart successfully.
            </p>
          )}
        </div>
      </div>

      <section className="related-products-section">
        <h3>You Might Also Like</h3>

        {relatedLoading && (
          <p className="loading-text small" role="status">
            Loading suggestions...
          </p>
        )}

        {!relatedLoading && relatedError && (
          <div>
            <p className="error-text small" role="alert">
              {relatedError}
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setRelatedRetry((previous) => previous + 1)}
            >
              Retry
            </button>
          </div>
        )}

        {!relatedLoading &&
          !relatedError &&
          relatedProducts.length === 0 && (
            <p className="empty-text small">
              No related products found right now.
            </p>
          )}

        {!relatedLoading &&
          !relatedError &&
          relatedProducts.length > 0 && (
            <div className="related-products-grid">
              {relatedProducts.map(({ product: relatedProduct }) => {
                const relatedDiscount =
                  getDiscountPercent(relatedProduct);

                return (
                  <Link
                    key={relatedProduct._id}
                    className="related-product-item"
                    to={`/products/${relatedProduct._id}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <div className="related-product-image-wrapper">
                      <img
                        src={
                          relatedProduct.images?.[0]?.url ||
                          FALLBACK_IMAGE
                        }
                        alt={
                          relatedProduct.images?.[0]?.alt ||
                          relatedProduct.name
                        }
                        onError={handleImageError}
                        loading="lazy"
                      />
                    </div>

                    <p>{relatedProduct.name}</p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <span className="current-price">
                        {formatCurrency(
                          getEffectivePrice(relatedProduct)
                        )}
                      </span>

                      {relatedDiscount.hasDiscount && (
                        <>
                          <span className="original-price">
                            {formatCurrency(relatedProduct.price)}
                          </span>
                          <span className="discount-percent-badge">
                            {relatedDiscount.roundedPercent}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
      </section>

      <section className="reviews-section">
        <h3>Reviews</h3>

        {reviews.length === 0 ? (
          <p className="empty-text">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => {
              const isDemo = isDemoReviewComment(review.comment);
              const stars = Math.max(
                0,
                Math.min(5, Math.round(Number(review.rating) || 0))
              );

              return (
                <div key={review._id} className="review-item">
                  <div className="review-item-header">
                    <strong>{review.name}</strong>
                    {isDemo && (
                      <span className="demo-review-tag">
                        Sample review
                      </span>
                    )}
                  </div>

                  <span
                    className="review-item-stars"
                    role="img"
                    aria-label={`${stars} out of 5 stars`}
                  >
                    {'★'.repeat(stars)}
                    {'☆'.repeat(5 - stars)}
                  </span>

                  <p>
                    {isDemo
                      ? review.comment
                          .replace('[Demo review]', '')
                          .trim()
                      : review.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleReviewSubmit} className="review-form">
          <h4>Write a Review</h4>

          {reviewSubmitError && (
            <p className="error-text small" role="alert">
              {reviewSubmitError}
            </p>
          )}

          {reviewSubmitSuccess && (
            <p className="success-text small" role="status">
              Review submitted. Thank you!
            </p>
          )}

          <label htmlFor="review-rating-select" className="sr-only">
            Rating
          </label>

          <select
            id="review-rating-select"
            name="reviewRating"
            value={reviewRating}
            onChange={(event) =>
              setReviewRating(Number(event.target.value))
            }
            disabled={reviewSubmitting}
          >
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Star{rating > 1 ? 's' : ''}
              </option>
            ))}
          </select>

          <label htmlFor="review-comment-textarea" className="sr-only">
            Comment
          </label>

          <textarea
            id="review-comment-textarea"
            name="reviewComment"
            placeholder="Share your thoughts about this product..."
            value={reviewComment}
            onChange={(event) => setReviewComment(event.target.value)}
            disabled={reviewSubmitting}
            required
          />

          <button type="submit" disabled={reviewSubmitting}>
            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ProductDetail;