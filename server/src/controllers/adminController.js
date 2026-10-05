const User = require('../models/User');
const Book = require('../models/Book');
const ExchangeRequest = require('../models/ExchangeRequest');

// @desc    Get system statistics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private / Admin only
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBooks,
      activeListings,
      pendingRequests,
      activeTransactions,
      completedTransactions,
    ] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Book.countDocuments({ status: 'available' }),
      ExchangeRequest.countDocuments({ status: 'pending' }),
      ExchangeRequest.countDocuments({ status: 'active' }),
      ExchangeRequest.countDocuments({ status: 'completed' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        activeListings,
        pendingRequests,
        activeTransactions,
        completedTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users for admin management
// @route   GET /api/admin/users
// @access  Private / Admin only
const getAdminUsers = async (req, res, next) => {
  try {
    const { search = '', status = '' } = req.query;

    const query = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const users = await User.find(query)
      .select('name email college department phone role avatar rating isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate a user
// @route   PATCH /api/admin/users/:id/status
// @access  Private / Admin only
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value',
      });
    }

    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      {
        new: true,
        runValidators: true,
      }
    ).select('name email role isActive');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get books for admin management
// @route   GET /api/admin/books
// @access  Private / Admin only
const getAdminBooks = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      type = '',
      status = '',
      sort = 'newest',
    } = req.query;

    const filter = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.listingType = type;
    }

    if (status) {
      filter.status = status;
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
    };

    const sortOrder = sortMap[sort] || sortMap.newest;

    const books = await Book.find(filter)
      .populate('owner', 'name email college rating')
      .sort(sortOrder);

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a book listing as admin
// @route   DELETE /api/admin/books/:id
// @access  Private / Admin only
const deleteAdminBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book listing not found',
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book listing removed by admin successfully',
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminBooks,
  deleteAdminBook,
};