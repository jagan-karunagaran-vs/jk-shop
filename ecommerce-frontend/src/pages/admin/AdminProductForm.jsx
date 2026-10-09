import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { createAdminProduct, updateAdminProduct } from '../../redux/thunks/adminThunks';
import { clearAdminActionSuccess, clearAdminError } from '../../redux/slices/adminSlice';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Other'];
const FALLBACK_IMAGE = 'https://placehold.co/300x300/e0e0e0/888888?text=Image+Unavailable';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get('returnTo')
    ? decodeURIComponent(searchParams.get('returnTo'))
    : '/admin/products';

  const { loading, error, actionSuccess } = useSelector((state) => state.admin);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'Electronics',
    brand: '',
    stock: '',
    imageUrl: '',
    imageAlt: '',
    isFeatured: false,
    isBestSeller: false,
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);

  useEffect(() => {
    dispatch(clearAdminError());
    dispatch(clearAdminActionSuccess());

    if (isEditMode) {
      const loadProduct = async () => {
        try {
          const response = await axiosInstance.get(`/products/${id}`);
          const p = response.data.product;
          setFormData({
            name: p.name,
            description: p.description,
            price: p.price,
            discountPrice: p.discountPrice || '',
            category: p.category,
            brand: p.brand || '',
            stock: p.stock,
            imageUrl: p.images?.[0]?.url || '',
            imageAlt: p.images?.[0]?.alt || '',
            isFeatured: p.isFeatured,
            isBestSeller: p.isBestSeller,
            isActive: p.isActive,
          });
        } catch (err) {
          setFormErrors({ load: 'Failed to load product' });
        } finally {
          setLoadingProduct(false);
        }
      };
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  useEffect(() => {
    if (actionSuccess) {
      navigate(returnTo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionSuccess]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price || Number(formData.price) <= 0) errors.price = 'Enter a valid price';
    if (formData.discountPrice && Number(formData.discountPrice) >= Number(formData.price)) {
      errors.discountPrice = 'Discount price must be lower than original price';
    }
    if (formData.stock === '' || Number(formData.stock) < 0) errors.stock = 'Enter a valid stock quantity';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
      category: formData.category,
      brand: formData.brand.trim() || 'Generic',
      stock: Number(formData.stock),
      isFeatured: formData.isFeatured,
      isBestSeller: formData.isBestSeller,
      isActive: formData.isActive,
    };

    if (formData.imageUrl.trim()) {
      productData.images = [
        { url: formData.imageUrl.trim(), alt: formData.imageAlt.trim() || formData.name.trim() },
      ];
    } else if (!isEditMode) {
      productData.images = [];
    }

    if (isEditMode) {
      dispatch(updateAdminProduct({ productId: id, productData }));
    } else {
      dispatch(createAdminProduct(productData));
    }
  };

  const handleCancel = () => {
    navigate(returnTo);
  };

  if (loadingProduct) return <p className="loading-text">Loading product...</p>;

  return (
    <div className="admin-product-form-page">
      <h2>{isEditMode ? 'Edit Product' : 'Add Product'}</h2>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit} className="admin-product-form" noValidate>
        <div className="admin-form-grid">
          <div className="form-group">
            <label htmlFor="product-name">Name</label>
            <input
              type="text"
              id="product-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <span className="field-error">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="product-brand">Brand</label>
            <input
              type="text"
              id="product-brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-category">Category</label>
            <select id="product-category" name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="product-price">Original Price (₹)</label>
            <input
              type="number"
              id="product-price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={formErrors.price ? 'input-error' : ''}
            />
            {formErrors.price && <span className="field-error">{formErrors.price}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="product-discount-price">Selling Price (₹) — optional</label>
            <input
              type="number"
              id="product-discount-price"
              name="discountPrice"
              min="0"
              step="0.01"
              value={formData.discountPrice}
              onChange={handleChange}
              className={formErrors.discountPrice ? 'input-error' : ''}
            />
            {formErrors.discountPrice && <span className="field-error">{formErrors.discountPrice}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="product-stock">Stock</label>
            <input
              type="number"
              id="product-stock"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className={formErrors.stock ? 'input-error' : ''}
            />
            {formErrors.stock && <span className="field-error">{formErrors.stock}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="product-image-url">Image URL</label>
            <input
              type="text"
              id="product-image-url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
            {isEditMode && (
              <span className="field-hint">Leave unchanged to keep the current image.</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="product-image-alt">Image Alt Text</label>
            <input
              type="text"
              id="product-image-alt"
              name="imageAlt"
              value={formData.imageAlt}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="admin-image-preview">
          <p>Preview:</p>
          <img
            src={formData.imageUrl.trim() || FALLBACK_IMAGE}
            alt={formData.imageAlt || 'Preview'}
            onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-description">Description</label>
          <textarea
            id="product-description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            className={formErrors.description ? 'input-error' : ''}
          />
          {formErrors.description && <span className="field-error">{formErrors.description}</span>}
        </div>

        <div className="admin-checkbox-row">
          <label htmlFor="product-featured">
            <input
              type="checkbox"
              id="product-featured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            Featured
          </label>

          <label htmlFor="product-bestseller">
            <input
              type="checkbox"
              id="product-bestseller"
              name="isBestSeller"
              checked={formData.isBestSeller}
              onChange={handleChange}
            />
            Curated Best Seller
          </label>

          <label htmlFor="product-active">
            <input
              type="checkbox"
              id="product-active"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="button" className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;