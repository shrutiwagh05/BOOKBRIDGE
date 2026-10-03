const User = require('../models/User');
const Book = require('../models/Book');
const ExchangeRequest = require('../models/ExchangeRequest');

// @desc    Get system high-level stats for admin overview
// @route   GET /api/admin/stats
// @access  Private / Admin only
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalExchanges = await ExchangeRequest.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalExchanges,
      },
      note: 'Module 5: Admin foundation endpoint ready',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
};
