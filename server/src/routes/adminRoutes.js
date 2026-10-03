const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protect and restrict to admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);

module.exports = router;
