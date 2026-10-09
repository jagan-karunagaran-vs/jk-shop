const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  adminLogin,
  getMe,
  logoutUser,
  changePassword,
} = require('../controllers/authentication');
const { protect } = require('../middleware/authMiddleware');
const { customerLoginLimiter, adminLoginLimiter } = require('../middleware/rateLimiter');

router.post('/register', registerUser);
router.post('/login', customerLoginLimiter, loginUser);
router.post('/admin/login', adminLoginLimiter, adminLogin);

router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);
router.put('/change-password', protect, changePassword);

module.exports = router;