import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { getEffectivePrice, getDiscountPercent } from '../utils/pricing';

const FALLBACK_IMAGE = 'https://placehold.co/300x300/e0e0e0/888888?text=Image+Unavailable';

const BestSellersCarousel = ({ items, mode }) => {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const multipleItems = items && items.length > 1;

  useEffect(() => {
    if (isPaused || prefersReducedMotion || !multipleItems) return;

    const track = trackRef.current;
    if (!track) return;

    let animationFrameId;
    const speed = 0.6;

    const step = () => {
      if (track.scrollLeft <= 0) {
        track.scrollLeft = track.scrollWidth - track.clientWidth;
      } else {
        track.scrollLeft -= speed;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, prefersReducedMotion, multipleItems]);

  const scrollByAmount = (amount) => {
    if (trackRef.current) {
      trackRef.current.scrollLeft += amount;
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      className="best-sellers-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="best-sellers-header">
        <h2>🔥 Best Sellers</h2>
        <span className={`best-sellers-mode-tag ${mode}`}>
          {mode === 'sales-based' ? 'Based on real sales' : 'Curated picks'}
        </span>
      </div>

      {multipleItems && (
        <div className="best-sellers-controls">
          <button type="button" aria-label="Scroll left" onClick={() => scrollByAmount(-250)}>
            ‹
          </button>
          <button
            type="button"
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? '▶' : '❚❚'}
          </button>
          <button type="button" aria-label="Scroll right" onClick={() => scrollByAmount(250)}>
            ›
          </button>
        </div>
      )}

      <div className={`best-sellers-track ${!multipleItems ? 'single-item' : ''}`} ref={trackRef}>
        {items.map((item) => {
          const effectivePrice = item.product.effectivePrice !== undefined
            ? item.product.effectivePrice
            : getEffectivePrice(item.product);
          const discountInfo = item.product.hasDiscount !== undefined
            ? { hasDiscount: item.product.hasDiscount, roundedPercent: item.product.discountPercent }
            : getDiscountPercent(item.product);

          return (
            <Link
              to={`/products/${item.product._id}`}
              key={item.product._id}
              className="best-sellers-card"
            >
              <div className="best-sellers-image-wrapper">
                <img
                  src={item.product.images?.[0]?.url || FALLBACK_IMAGE}
                  alt={item.product.images?.[0]?.alt || item.product.name}
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
                {discountInfo.hasDiscount && discountInfo.roundedPercent && (
                  <span className="best-sellers-discount-badge">{discountInfo.roundedPercent}% OFF</span>
                )}
              </div>
              <p className="best-sellers-name">{item.product.name}</p>
              <div className="best-sellers-price-row">
                {discountInfo.hasDiscount && (
                  <span className="best-sellers-original-price">{formatCurrency(item.product.price)}</span>
                )}
                <span className="best-sellers-price">{formatCurrency(effectivePrice)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default BestSellersCarousel;