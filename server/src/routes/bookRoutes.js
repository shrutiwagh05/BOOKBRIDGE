const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook } = require('../controllers/bookController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getBooks)
  .post(protect, createBook);

router.route('/:id')
  .get(getBookById);

module.exports = router;
