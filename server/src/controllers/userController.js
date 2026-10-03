const User = require('../models/User');
const Book = require('../models/Book');

// @desc    Get user profile and their active listings overview
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const myListings = await Book.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        user,
        listingsCount: myListings.length,
        myListings,
      },
      note: 'Module 4: User Dashboard foundation endpoint ready',
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
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
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
