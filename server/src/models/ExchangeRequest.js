const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['borrow', 'exchange', 'purchase'],
      required: true,
    },
    // If it's an exchange request, the book offered by the requester:
    offeredBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      default: null,
    },
    durationDays: {
      type: Number,
      default: 14,
    },
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'approved', 'rejected', 'active', 'completed', 'cancelled', 'returned'],
      default: 'pending',
    },
    returnDueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
