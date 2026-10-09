const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// IMPORTANT: '/myorders' MUST be defined before '/:id',
// otherwise Express will treat "myorders" as an :id value.

// Private routes - specific/static paths first
router.get('/myorders', protect, getMyOrders);

// Private/Admin routes
router.get('/', protect, authorize('admin'), getAllOrders);

// Private routes - create and general item routes
router.post('/', protect, createOrder);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/cancel', protect, cancelOrder);

// Private/Admin routes
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;