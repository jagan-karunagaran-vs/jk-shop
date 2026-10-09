const express = require('express');
const router = express.Router();
const {
  submitContactMessage,
  getAllContactMessages,
  markMessageAsRead,
} = require('../controllers/contactController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { contactFormLimiter } = require('../middleware/rateLimiter');

router.post('/', contactFormLimiter, submitContactMessage);

router.get('/', protect, requireAdmin, getAllContactMessages);
router.put('/:id/read', protect, requireAdmin, markMessageAsRead);

module.exports = router;