const express = require('express');
const router = express.Router();
const {
  getProductRecommendationScore,
  getPersonalizedRecommendations,
  getRelatedProducts,
  getBestSellers,
  getDashboardStats,
} = require('../controllers/analyticsController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/recommendations', protect, getPersonalizedRecommendations);
router.get('/recommendations/:productId', protect, getProductRecommendationScore);

router.get('/related/:productId', getRelatedProducts);
router.get('/best-sellers', getBestSellers);

router.get('/dashboard', protect, requireAdmin, getDashboardStats);

module.exports = router;