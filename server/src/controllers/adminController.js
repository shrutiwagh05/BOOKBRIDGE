const User = require('../models/User');
const Book = require('../models/Book');
const ExchangeRequest = require('../models/ExchangeRequest');
const { createNotification } = require('../utils/notificationHelper');

// Treat user-provided search terms as literal text, not regular expressions.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
      ExchangeRequest.countDocuments({ status: { $in: ['accepted', 'approved', 'active'] } }),
      ExchangeRequest.countDocuments({ status: { $in: ['completed', 'returned'] } }),
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
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');

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
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');

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

    const linkedActiveRequest = await ExchangeRequest.findOne({
      book: book._id,
      status: { $in: ['pending', 'accepted', 'approved', 'active'] },
    }).select('_id');

    if (linkedActiveRequest) {
      return res.status(409).json({
        success: false,
        message: 'This listing has an active request or transaction and cannot be removed yet.',
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
// @desc    Get exchange requests for admin monitoring
// @route   GET /api/admin/requests
// @access  Private / Admin only
const getAdminRequests = async (req, res, next) => {
  try {
    const { status = '', type = '', search = '' } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const requests = await ExchangeRequest.find(filter)
      .populate('book', 'title author listingType status')
      .populate('requester', 'name email college')
      .populate('owner', 'name email college')
      .populate('offeredBook', 'title author')
      .sort({ createdAt: -1 });

    let filteredRequests = requests;

    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();

      filteredRequests = requests.filter((request) => {
        const bookTitle = request.book?.title?.toLowerCase() || '';
        const requesterName = request.requester?.name?.toLowerCase() || '';
        const ownerName = request.owner?.name?.toLowerCase() || '';

        return (
          bookTitle.includes(searchTerm) ||
          requesterName.includes(searchTerm) ||
          ownerName.includes(searchTerm)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: filteredRequests.length,
      data: filteredRequests,
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Send a notification message to a user
// @route   POST /api/admin/users/:id/notifications
// @access  Private / Admin only
const sendAdminNotification = async (req, res, next) => {
  try {
    const { title, message } = req.body;

    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    const user = await User.findById(req.params.id).select('_id name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const notification = await createNotification({
      recipient: user._id,
      sender: req.user._id,
      title: title.trim(),
      message: message.trim(),
      type: 'system',
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: notification,
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
  getAdminRequests,
  sendAdminNotification,
};