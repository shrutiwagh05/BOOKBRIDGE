const User = require('../models/User');
const Book = require('../models/Book');
const ExchangeRequest = require('../models/ExchangeRequest');

// @desc    Get user profile and activity overview
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Books listed by the logged-in user
    const myListings = await Book.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    // Borrow requests made by the logged-in user
    const borrowedRequests = await ExchangeRequest.find({
      requester: req.user._id,
      type: 'borrow',
    });

    // Borrow requests received for books owned by the logged-in user
    const lentRequests = await ExchangeRequest.find({
      owner: req.user._id,
      type: 'borrow',
    });

    // Currently borrowed books
    const borrowedCount = borrowedRequests.filter((request) =>
      ['accepted', 'approved', 'active'].includes(request.status)
    ).length;

    // Currently lent books
    const lentCount = lentRequests.filter((request) =>
      ['accepted', 'approved', 'active'].includes(request.status)
    ).length;

    // Pending requests involving the logged-in user
    const pendingOutgoingRequests = await ExchangeRequest.countDocuments({
      requester: req.user._id,
      status: 'pending',
    });

    const pendingIncomingRequests = await ExchangeRequest.countDocuments({
      owner: req.user._id,
      status: 'pending',
    });

    const pendingRequestsCount =
      pendingOutgoingRequests + pendingIncomingRequests;

    res.status(200).json({
      success: true,
      data: {
        user,
        listingsCount: myListings.length,
        borrowedCount,
        lentCount,
        pendingRequestsCount,
        myListings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { name, college, department, phone, bio } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name !== undefined) user.name = name;
    if (college !== undefined) user.college = college;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};