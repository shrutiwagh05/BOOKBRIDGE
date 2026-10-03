const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide book title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    author: {
      type: String,
      required: [true, 'Please provide author name'],
      trim: true,
      maxlength: [80, 'Author name cannot exceed 80 characters'],
    },
    isbn: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Please provide a short description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Computer Science & IT',
        'Engineering',
        'Business & Economics',
        'Medical & Science',
        'Literature & Fiction',
        'Humanities & Arts',
        'Competitive Exams',
        'Other',
      ],
      default: 'Other',
    },
    listingType: {
      type: String,
      required: [true, 'Please specify listing type'],
      enum: ['Sell', 'Borrow', 'Exchange'],
      default: 'Sell',
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    rentalPeriodDays: {
      type: Number,
      default: 14,
    },
    exchangePreferences: {
      type: String,
      default: '',
      trim: true,
    },
    condition: {
      type: String,
      required: [true, 'Please select condition'],
      enum: ['New', 'Like New', 'Good', 'Fair'],
      default: 'Good',
    },
    editionOrYear: {
      type: String,
      default: '',
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'exchanged', 'sold', 'borrowed'],
      default: 'available',
    },
    locationCollege: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality in Home/Discovery & Listing modules
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
