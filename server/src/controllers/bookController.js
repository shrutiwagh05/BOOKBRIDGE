const Book = require('../models/Book');

// @desc    Get all books with optional search & filter (Foundation placeholder)
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const { category, type, search } = req.query;
    const filter = { status: 'available' };

    if (category) filter.category = category;
    if (type) filter.listingType = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(filter).populate('owner', 'name college rating').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
      note: 'Module 2: Book Listing foundation endpoint ready for expansion',
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
    const book = await Book.findById(req.params.id).populate('owner', 'name email college rating');

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

module.exports = {
  getBooks,
  getBookById,
  createBook,
};
