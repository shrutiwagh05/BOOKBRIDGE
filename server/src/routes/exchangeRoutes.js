const express = require('express');
const router = express.Router();
const {
  getMyExchanges,
  getIncomingRequests,
  getOutgoingRequests,
  createExchangeRequest,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
  returnExchangeRequest,
} = require('../controllers/exchangeController');
const { protect } = require('../middlewares/authMiddleware');

// All routes require authenticated student
router.use(protect);

// Collection routes
router.route('/')
  .get(getMyExchanges)
  .post(createExchangeRequest);

router.get('/incoming', getIncomingRequests);
router.get('/outgoing', getOutgoingRequests);

// Request lifecycle state transitions
router.patch('/:id/accept', acceptExchangeRequest);
router.patch('/:id/reject', rejectExchangeRequest);
router.patch('/:id/cancel', cancelExchangeRequest);
router.patch('/:id/return', returnExchangeRequest);

module.exports = router;
