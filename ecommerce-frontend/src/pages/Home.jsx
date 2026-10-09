import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';
import BestSellersCarousel from '../components/BestSellersCarousel';
import axiosInstance from '../api/axiosInstance';
import {
  fetchProducts,
  fetchFeaturedProducts,
  fetchCategories,
} from '../redux/thunks/productThunks';

const Home = () => {
  const dispatch = useDispatch();

  const {
    products,
    featuredProducts,
    categories,
    loading,
    error,
    page,
    pages,
  } = useSelector((state) => state.products);

  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const userId = user?._id || user?.id || '';

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    sort: 'newest',
    page: 1,
  });

  const [searchInput, setSearchInput] = useState('');
  const [bestSellers, setBestSellers] = useState([]);
  const [bestSellersMode, setBestSellersMode] = useState('curated');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationMode, setRecommendationMode] = useState('');
  const [recommendationsLoading, setRecommendationsLoading] =
    useState(false);
  const [recommendationsError, setRecommendationsError] =
    useState('');
  const [recommendationsRetry, setRecommendationsRetry] =
    useState(0);
  const [recommendationsOwner, setRecommendationsOwner] =
    useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());

    const fetchBestSellers = async () => {
      try {
        const response = await axiosInstance.get(
          '/analytics/best-sellers',
          { signal: controller.signal }
        );

        if (!cancelled) {
          setBestSellers(response.data.bestSellers || []);
          setBestSellersMode(response.data.mode || 'curated');
        }
      } catch {
        if (!cancelled) {
          setBestSellers([]);
        }
      }
    };

    fetchBestSellers();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setRecommendations([]);
    setRecommendationMode('');
    setRecommendationsError('');
    setRecommendationsOwner(null);

    if (!isAuthenticated) {
      setRecommendationsLoading(false);

      return () => {
        cancelled = true;
        controller.abort();
      };
    }

    const fetchRecommendations = async () => {
      setRecommendationsLoading(true);

      try {
        const response = await axiosInstance.get(
          '/analytics/recommendations',
          {
            params: { limit: 6 },
            signal: controller.signal,
          }
        );

        if (cancelled) return;

        if (response.data.success !== true) {
          throw new Error('Recommendation request failed.');
        }

        const items = Array.isArray(response.data.recommendations)
          ? response.data.recommendations
          : [];

        setRecommendations(
          items.filter((item) => item?.product?._id)
        );
        setRecommendationMode(response.data.mode || '');
      } catch {
        if (!cancelled) {
          setRecommendationsError(
            'Unable to load suggestions right now. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setRecommendationsOwner(userId);
          setRecommendationsLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isAuthenticated, userId, recommendationsRetry]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    setFilters((previous) => ({
      ...previous,
      keyword: searchInput.trim(),
      page: 1,
    }));
  };

  const handleCategoryChange = (event) => {
    setFilters((previous) => ({
      ...previous,
      category: event.target.value,
      page: 1,
    }));
  };

  const handleSortChange = (event) => {
    setFilters((previous) => ({
      ...previous,
      sort: event.target.value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    if (loading || newPage < 1 || newPage > pages) return;

    setFilters((previous) => ({
      ...previous,
      page: newPage,
    }));

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');

    setFilters({
      keyword: '',
      category: '',
      sort: 'newest',
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(
    filters.keyword ||
      filters.category ||
      filters.sort !== 'newest'
  );

  const suggestionsPending =
    recommendationsLoading || recommendationsOwner !== userId;

  const isPersonalized =
    !suggestionsPending &&
    recommendationMode === 'purchase-history';

  return (
    <div className="home-page">
      <section className="hero-banner">
        <h1>Welcome to JK Shop</h1>
        <p>Thoughtfully chosen products, presented with care.</p>
      </section>

      <form
        onSubmit={handleSearchSubmit}
        className="home-search-bar"
      >
        <label htmlFor="home-search-input" className="sr-only">
          Search products
        </label>

        <input
          type="text"
          id="home-search-input"
          name="searchInput"
          placeholder="Search for products..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          style={{ minWidth: 0 }}
        />

        <button type="submit">Search</button>
      </form>

      {isAuthenticated && (
        <section
          className="recommendations-section"
          aria-labelledby="home-recommendations-heading"
          aria-busy={suggestionsPending}
          style={{ marginBottom: '2rem', minWidth: 0 }}
        >
          <h2 id="home-recommendations-heading">
            {suggestionsPending || recommendationsError
              ? 'Product Suggestions'
              : isPersonalized
                ? 'Recommended for You'
                : 'Top Rated Picks'}
          </h2>

          {!suggestionsPending &&
            !recommendationsError &&
            recommendations.length > 0 && (
              <p>
                {isPersonalized
                  ? 'Products similar to your previous purchases.'
                  : 'Explore highly rated products from our store.'}
              </p>
            )}

          {suggestionsPending && (
            <p className="loading-text" role="status">
              Loading suggestions...
            </p>
          )}

          {!suggestionsPending && recommendationsError && (
            <div>
              <p className="error-text" role="alert">
                {recommendationsError}
              </p>

              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setRecommendationsRetry(
                    (previous) => previous + 1
                  )
                }
              >
                Retry
              </button>
            </div>
          )}

          {!suggestionsPending &&
            !recommendationsError &&
            recommendations.length === 0 && (
              <p className="empty-text">
                No suggestions available right now.
              </p>
            )}

          {!suggestionsPending &&
            !recommendationsError &&
            recommendations.length > 0 && (
              <div className="row row-cols-2 row-cols-md-3 g-3">
                {recommendations.map(({ product }) => (
                  <div
                    className="col"
                    key={product._id}
                    style={{ minWidth: 0 }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <h2>Featured Products</h2>

          <div
            className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3"
            style={{ marginBottom: '2rem' }}
          >
            {featuredProducts.map((product) => (
              <div
                className="col"
                key={product._id}
                style={{ minWidth: 0 }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      <BestSellersCarousel
        items={bestSellers}
        mode={bestSellersMode}
      />

      <div className="home-layout">
        <button
          type="button"
          className="mobile-filter-toggle"
          aria-expanded={showMobileFilters}
          aria-controls="home-filter-sidebar"
          onClick={() =>
            setShowMobileFilters((previous) => !previous)
          }
        >
          {showMobileFilters ? 'Hide Filters' : 'Filters & Sort'}
        </button>

        <aside
          id="home-filter-sidebar"
          className={`home-filter-sidebar ${
            showMobileFilters ? 'active' : ''
          }`}
        >
          <div className="form-group">
            <label htmlFor="home-category-select">
              Category
            </label>

            <select
              id="home-category-select"
              name="category"
              value={filters.category}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="home-sort-select">Sort By</label>

            <select
              id="home-sort-select"
              name="sort"
              value={filters.sort}
              onChange={handleSortChange}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">
                Price: Low to High
              </option>
              <option value="price_desc">
                Price: High to Low
              </option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </aside>

        <section
          className="all-products-section"
          style={{ minWidth: 0 }}
          aria-busy={loading}
        >
          <h2>All Products</h2>

          {loading && (
            <p className="loading-text" role="status">
              Loading products...
            </p>
          )}

          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="empty-state">
              <p className="empty-text">
                No products found matching your criteria.
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div
                className="row row-cols-2 row-cols-md-3 g-3"
                style={{ marginBottom: '2rem' }}
              >
                {products.map((product) => (
                  <div
                    className="col"
                    key={product._id}
                    style={{ minWidth: 0 }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {pages > 1 && (
                <nav
                  className="pagination"
                  aria-label="Product pages"
                >
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    aria-label="Previous product page"
                  >
                    Previous
                  </button>

                  <span aria-live="polite" aria-atomic="true">
                    Page {page} of {pages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= pages}
                    aria-label="Next product page"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;