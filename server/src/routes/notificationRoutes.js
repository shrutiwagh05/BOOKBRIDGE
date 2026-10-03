const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Notifications require authentication

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;
