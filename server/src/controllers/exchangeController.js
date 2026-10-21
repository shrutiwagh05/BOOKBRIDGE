const mongoose = require('mongoose');
const ExchangeRequest = require('../models/ExchangeRequest');
const Book = require('../models/Book');
const { validateExchangeInput } = require('../utils/exchangeValidation');

// @desc    Get user's incoming and outgoing exchange/borrow requests (combined)
// @route   GET /api/exchanges
// @access  Private
const getMyExchanges = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({
      $or: [{ requester: req.user._id }, { owner: req.user._id }],
    })
      .populate('book', 'title author images listingType price condition status locationCollege')
      .populate('offeredBook', 'title author images listingType condition status')
      .populate('requester', 'name email college department rating')
      .populate('owner', 'name email college department rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming requests where logged-in user is the book owner
// @route   GET /api/exchanges/incoming
// @access  Private
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({ owner: req.user._id })
      .populate('book', 'title author images listingType price condition status locationCollege')
      .populate('offeredBook', 'title author images listingType condition status')
      .populate('requester', 'name email college department rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get outgoing requests where logged-in user is the requester
// @route   GET /api/exchanges/outgoing
// @access  Private
const getOutgoingRequests = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({ requester: req.user._id })
      .populate('book', 'title author images listingType price condition status locationCollege')
      .populate('offeredBook', 'title author images listingType condition status')
      .populate('owner', 'name email college department rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new borrow or exchange request
// @route   POST /api/exchanges
// @access  Private
const createExchangeRequest = async (req, res, next) => {
  try {
    const { bookId, type, offeredBookId, durationDays, message } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required',
      });
    }
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID.' });
    }

    // 1. Verify book existence and availability
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    if (book.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `This book is currently ${book.status} and cannot be requested right now.`,
      });
    }

    // 2. Prevent requesting own book
    if (book.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request your own book.',
      });
    }

    // 3. Prevent duplicate active requests for the same book from the same user
    const existingActiveRequest = await ExchangeRequest.findOne({
      book: bookId,
      requester: req.user._id,
      status: { $in: ['pending', 'accepted', 'approved', 'active'] },
    });

    if (existingActiveRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request pending or accepted for this volume.',
      });
    }

    // Validate the request's type, duration, message, and offered-book fields.
    const requestedType = type || (book.listingType === 'Exchange' ? 'exchange' : 'borrow');
    const validation = validateExchangeInput({
      type: requestedType,
      durationDays,
      message,
      offeredBookId,
      bookId: book._id,
      defaultDuration: book.rentalPeriodDays || 14,
    });
    if (validation.error) {
      return res.status(400).json({ success: false, message: validation.error });
    }

    let validatedOfferedBookId = null;
    if (validation.value.requestType === 'exchange') {
      if (!mongoose.isValidObjectId(offeredBookId)) {
        return res.status(400).json({ success: false, message: 'Invalid offered book ID.' });
      }
      const offeredBook = await Book.findById(offeredBookId);
      if (!offeredBook) {
        return res.status(404).json({ success: false, message: 'Offered trade book not found.' });
      }
      if (offeredBook.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only offer books that you own.' });
      }
      if (offeredBook.status !== 'available') {
        return res.status(400).json({ success: false, message: 'The book you offered is currently not available.' });
      }
      validatedOfferedBookId = offeredBook._id;
    }

    const requestType = validation.value.requestType;
    if (requestType === 'borrow' && book.listingType !== 'Borrow') {
      return res.status(400).json({ success: false, message: 'This listing is not available for borrowing.' });
    }
    if (requestType === 'exchange' && book.listingType !== 'Exchange') {
      return res.status(400).json({ success: false, message: 'This listing is not available for exchange.' });
    }
    const loanDuration = validation.value.durationDays;
    const cleanMessage = validation.value.message;

    // Never trust ownerId supplied by the browser; use the actual listing owner.
    const targetOwnerId = book.owner;

    const exchange = await ExchangeRequest.create({
      book: bookId,
      owner: targetOwnerId,
      requester: req.user._id,
      type: requestType,
      offeredBook: validatedOfferedBookId,
      durationDays: loanDuration,
      message: cleanMessage,
      status: 'pending',
    });

    const populatedExchange = await ExchangeRequest.findById(exchange._id)
      .populate('book', 'title author images listingType price condition')
      .populate('offeredBook', 'title author images listingType condition')
      .populate('owner', 'name email college');

    res.status(201).json({
      success: true,
      message: `${requestType === 'exchange' ? 'Exchange proposal' : 'Borrow request'} submitted successfully!`,
      data: populatedExchange,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept a borrow or exchange request (Book owner only)
// @route   PATCH /api/exchanges/:id/accept
// @access  Private
const acceptExchangeRequest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Authorization: Only the owner can accept
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the book owner has permission to accept this request',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept request with status: ${request.status}`,
      });
    }

    // Verify book is still available
    const book = await Book.findById(request.book);
    if (!book || book.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'The requested book is no longer available.',
      });
    }

    // Re-validate the offered book before changing any request or book state.
    let offeredBookForExchange = null;
    if (request.type === 'exchange') {
      offeredBookForExchange = await Book.findById(request.offeredBook);
      if (!offeredBookForExchange || offeredBookForExchange.status !== 'available' || offeredBookForExchange.owner.toString() !== request.requester.toString()) {
        return res.status(400).json({
          success: false,
          message: 'The offered book is no longer available for this exchange.',
        });
      }
    }

    // Calculate return due date for borrow transactions
    let dueDate = null;
    if (request.type === 'borrow') {
      const days = request.durationDays || 14;
      dueDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    request.status = 'accepted';
    request.returnDueDate = dueDate;
    await request.save();

    // Synchronize the requested book with the accepted transaction.
    if (request.type === 'borrow') {
      book.status = 'borrowed';
      await book.save();
    } else if (request.type === 'exchange') {
      // A direct exchange transfers ownership in both directions.
      const originalOwnerId = book.owner;
      book.owner = request.requester;
      book.status = 'available';
      offeredBookForExchange.owner = originalOwnerId;
      offeredBookForExchange.status = 'available';
      await Promise.all([book.save(), offeredBookForExchange.save()]);
    }

    // Auto-reject any conflicting pending requests for the same book
    await ExchangeRequest.updateMany(
      {
        book: book._id,
        _id: { $ne: request._id },
        status: 'pending',
      },
      {
        status: 'rejected',
        message: 'Book accepted by another student request.',
      }
    );

    const updated = await ExchangeRequest.findById(request._id)
      .populate('book', 'title author images listingType status')
      .populate('requester', 'name email college')
      .populate('owner', 'name email college');

    res.status(200).json({
      success: true,
      message: request.type === 'borrow' ? 'Borrow request accepted. The book is now marked as borrowed.' : 'Exchange accepted. Ownership of both books has been transferred.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a borrow or exchange request (Book owner only)
// @route   PATCH /api/exchanges/:id/reject
// @access  Private
const rejectExchangeRequest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Authorization: Only the owner can reject
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the book owner has permission to reject this request',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}`,
      });
    }

    request.status = 'rejected';
    if (req.body.reason) {
      request.message = request.message
        ? `${request.message} (Rejection Note: ${req.body.reason.trim()})`
        : `Rejection Note: ${req.body.reason.trim()}`;
    }
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request has been rejected.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending request (Requester only)
// @route   PATCH /api/exchanges/:id/cancel
// @access  Private
const cancelExchangeRequest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Authorization: Only the original requester can cancel
    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own submitted requests',
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending requests can be cancelled. Current status is ${request.status}`,
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Your request has been cancelled.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a borrowed or exchanged book as returned/completed
// @route   PATCH /api/exchanges/:id/return
// @access  Private (Owner or Requester)
const returnExchangeRequest = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Transaction request not found',
      });
    }

    // Authorization: Both owner and borrower are involved in the return
    const isOwner = request.owner.toString() === req.user._id.toString();
    const isRequester = request.requester.toString() === req.user._id.toString();

    if (!isOwner && !isRequester) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this transaction',
      });
    }

    // Check eligible status
    const eligibleStatuses = ['accepted', 'approved', 'active'];
    if (!eligibleStatuses.includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Transaction cannot be marked as returned from status: ${request.status}`,
      });
    }

    // Borrowed books return to availability; exchanges are completed transfers.
    const isBorrow = request.type === 'borrow';
    request.status = isBorrow ? 'returned' : 'completed';
    await request.save();

    if (isBorrow) {
      const book = await Book.findById(request.book);
      if (book) {
        book.status = 'available';
        await book.save();
      }
    }
    // Do not reset exchanged books to available: the exchange is a completed transfer.

    const updated = await ExchangeRequest.findById(request._id)
      .populate('book', 'title author images listingType status')
      .populate('requester', 'name email college')
      .populate('owner', 'name email college');

    res.status(200).json({
      success: true,
      message: isBorrow ? 'Book marked as returned and is available again.' : 'Exchange marked as completed.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyExchanges,
  getIncomingRequests,
  getOutgoingRequests,
  createExchangeRequest,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
  returnExchangeRequest,
};
