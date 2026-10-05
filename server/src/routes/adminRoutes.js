const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminBooks,
  deleteAdminBook,
  getAdminRequests,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protect and restrict to admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/books', getAdminBooks);
router.delete('/books/:id', deleteAdminBook);
router.get('/requests', getAdminRequests);

module.exports = router;
