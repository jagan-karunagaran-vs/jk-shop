const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getCategories,
} = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/:id/reviews', protect, addProductReview);

router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;