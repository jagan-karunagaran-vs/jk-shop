const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
} = require('../controllers/userProfile');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserAccount);

router.get('/', protect, requireAdmin, getAllUsers);
router.put('/:id', protect, requireAdmin, updateUserByAdmin);
router.delete('/:id', protect, requireAdmin, deleteUserByAdmin);

module.exports = router;