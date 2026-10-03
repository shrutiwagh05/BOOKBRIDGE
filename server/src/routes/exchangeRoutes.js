const express = require('express');
const router = express.Router();
const { getMyExchanges, createExchangeRequest } = require('../controllers/exchangeController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All exchange endpoints require authentication

router.route('/')
  .get(getMyExchanges)
  .post(createExchangeRequest);

module.exports = router;
