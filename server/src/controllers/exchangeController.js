const ExchangeRequest = require('../models/ExchangeRequest');

// @desc    Get user's incoming and outgoing exchange/borrow requests
// @route   GET /api/exchanges
// @access  Private
const getMyExchanges = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({
      $or: [{ requester: req.user._id }, { owner: req.user._id }],
    })
      .populate('book', 'title author images listingType')
      .populate('requester', 'name college')
      .populate('owner', 'name college')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
      note: 'Module 3: Borrow / Lend / Exchange foundation endpoint ready',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new borrow or exchange request
// @route   POST /api/exchanges
// @access  Private
const createExchangeRequest = async (req, res, next) => {
  try {
    const { bookId, ownerId, type, offeredBookId, durationDays, message } = req.body;

    const exchange = await ExchangeRequest.create({
      book: bookId,
      owner: ownerId,
      requester: req.user._id,
      type: type || 'borrow',
      offeredBook: offeredBookId || null,
      durationDays: durationDays || 14,
      message: message || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Exchange/Borrow request sent successfully',
      data: exchange,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyExchanges,
  createExchangeRequest,
};
