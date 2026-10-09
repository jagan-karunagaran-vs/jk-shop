import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts, archiveAdminProduct } from '../../redux/thunks/adminThunks';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    products,
    loading,
    error,
    productsPage,
    productsPages,
  } = useSelector((state) => state.admin);

  const page = parseInt(searchParams.get('page'), 10) || 1;
  const keyword = searchParams.get('keyword') || '';

  const [searchInput, setSearchInput] = useState(keyword);

  useEffect(() => {
    dispatch(fetchAdminProducts({ page, keyword, limit: 20 }));
  }, [dispatch, page, keyword]);

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (searchInput.trim()) params.keyword = searchInput.trim();
    params.page = '1';
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= productsPages) {
      const params = {};
      if (keyword) params.keyword = keyword;
      params.page = String(newPage);
      setSearchParams(params);
    }
  };

  const handleArchive = async (productId, name) => {
    if (!window.confirm(`Archive "${name}"? It will no longer be visible to customers, but existing orders referencing it are preserved.`)) return;
    await dispatch(archiveAdminProduct(productId));
    dispatch(fetchAdminProducts({ page, keyword, limit: 20 }));
  };

  const returnTo = encodeURIComponent(location.pathname + location.search);

  return (
    <div className="admin-products-page">
      <div className="admin-page-header">
        <h2>Products</h2>
        <Link to={`/admin/products/new?returnTo=${returnTo}`} className="btn-link">+ Add Product</Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="admin-search-form">
        <label htmlFor="admin-product-search" className="sr-only">Search products</label>
        <input
          type="text"
          id="admin-product-search"
          name="productSearch"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="loading-text">Loading products...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.effectivePrice)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={product.isActive ? 'badge-active' : 'badge-inactive'}>
                        {product.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="admin-table-actions">
                      <Link to={`/admin/products/${product._id}/edit?returnTo=${returnTo}`}>Edit</Link>
                      {product.isActive && (
                        <button
                          type="button"
                          className="admin-archive-btn"
                          onClick={() => handleArchive(product._id, product.name)}
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <p className="empty-text">No products found matching your search.</p>
          )}

          {productsPages > 1 && (
            <div className="pagination">
              <button onClick={() => handlePageChange(productsPage - 1)} disabled={productsPage <= 1}>Previous</button>
              <span>Page {productsPage} of {productsPages}</span>
              <button onClick={() => handlePageChange(productsPage + 1)} disabled={productsPage >= productsPages}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;