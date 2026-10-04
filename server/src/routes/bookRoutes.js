const express = require('express');
const router = express.Router();

const {
  getBooks,
  getBookById,
  createBook,
  getMyListings,
  updateBook,
  deleteBook,
  updateBookStatus,
} = require('../controllers/bookController');

const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, createBook);

// My listed books
router.route('/my-listings')
  .get(protect, getMyListings);

// Update listing status
router.route('/:id/status')
  .patch(protect, updateBookStatus);

// Edit or delete own listing
router.route('/:id')
  .get(getBookById)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

module.exports = router;