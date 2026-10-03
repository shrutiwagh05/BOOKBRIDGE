const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // Profile operations require authentication

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

module.exports = router;
