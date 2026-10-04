const Book = require('../models/Book');

// @desc    Get all available books with optional search & filters
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const { category, type, search } = req.query;

    const filter = {
      status: 'available',
    };

    if (category) {
      filter.category = category;
    }

    if (type) {
      filter.listingType = type;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(filter)
      .populate('owner', 'name college rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book details by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('owner', 'name email college rating');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book listing not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book listing
// @route   POST /api/books
// @access  Private
const createBook = async (req, res, next) => {
  try {
    const bookData = {
      ...req.body,
      owner: req.user._id,
    };

    const book = await Book.create(bookData);

    res.status(201).json({
      success: true,
      message: 'Book listing created successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get books listed by the logged-in user
// @route   GET /api/books/my-listings
// @access  Private
const getMyListings = async (req, res, next) => {
  try {
    const books = await Book.find({
      owner: req.user._id,
    })
      .populate('owner', 'name college rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a book listing
// @route   PUT /api/books/:id
// @access  Private - Owner only
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book listing not found',
      });
    }

    // Ownership protection
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this listing',
      });
    }

    const allowedFields = [
      'title',
      'author',
      'isbn',
      'description',
      'category',
      'listingType',
      'price',
      'rentalPeriodDays',
      'exchangePreferences',
      'condition',
      'editionOrYear',
      'images',
      'locationCollege',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        book[field] = req.body[field];
      }
    });

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book listing updated successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book listing
// @route   DELETE /api/books/:id
// @access  Private - Owner only
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book listing not found',
      });
    }

    // Ownership protection
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing',
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book listing status
// @route   PATCH /api/books/:id/status
// @access  Private - Owner only
const updateBookStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      'available',
      'reserved',
      'exchanged',
      'sold',
      'borrowed',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book listing status',
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book listing not found',
      });
    }

    // Ownership protection
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to change this listing status',
      });
    }

    book.status = status;
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book listing status updated successfully',
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  getMyListings,
  updateBook,
  deleteBook,
  updateBookStatus,
};