
const express = require('express');
const router = express.Router();

const {
  getBooks,
  getBookById,
  getBookCover,
  createBook,
  getMyListings,
  updateBook,
  deleteBook,
  updateBookStatus,
} = require('../controllers/bookController');

const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.get('/', getBooks);

// Specific GET routes must come before the general /:id route.
router.get('/my-listings', protect, getMyListings);
router.get('/:id/cover', getBookCover);
router.get('/:id', getBookById);

// Protected routes
router.post('/', protect, upload.single('image'), createBook);
router.patch('/:id/status', protect, updateBookStatus);
router.put('/:id', protect, upload.single('image'), updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;
