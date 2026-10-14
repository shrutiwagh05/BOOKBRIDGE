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
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, upload.single('image'), createBook);

// My listed books
router.route('/my-listings')
  .get(protect, getMyListings);

// Update listing status
router.route('/:id/status')
  .patch(protect, updateBookStatus);

// Edit or delete own listing
router.route('/:id')
  .get(getBookById)
  .put(protect, upload.single('image'), updateBook)
  .delete(protect, deleteBook);

module.exports = router;