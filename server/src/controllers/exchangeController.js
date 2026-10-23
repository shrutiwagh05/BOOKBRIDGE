const mongoose = require('mongoose');
const ExchangeRequest = require('../models/ExchangeRequest');
const Book = require('../models/Book');
const { createNotification } = require('../utils/notificationHelper');
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

    res.status(200).json({ success: true, count: requests.length, data: requests });
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

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get outgoing requests submitted by the logged-in user
// @route   GET /api/exchanges/outgoing
// @access  Private
const getOutgoingRequests = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({ requester: req.user._id })
      .populate('book', 'title author images listingType price condition status locationCollege')
      .populate('offeredBook', 'title author images listingType condition status')
      .populate('owner', 'name email college department rating')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
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

    if (!bookId) return res.status(400).json({ success: false, message: 'Book ID is required' });
    if (!mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID.' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
    if (book.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `This book is currently ${book.status} and cannot be requested right now.`,
      });
    }

    if (book.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own book.' });
    }

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

    const requestedType = type || (book.listingType === 'Exchange' ? 'exchange' : 'borrow');
    const validation = validateExchangeInput({
      type: requestedType,
      durationDays,
      message,
      offeredBookId,
      bookId: book._id,
      defaultDuration: book.rentalPeriodDays || 14,
    });
    if (validation.error) return res.status(400).json({ success: false, message: validation.error });

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

    const targetOwnerId = book.owner;

    const exchange = await ExchangeRequest.create({
      book: bookId,
      owner: book.owner,
      requester: req.user._id,
      type: requestType,
      offeredBook: validatedOfferedBookId,
      durationDays: validation.value.durationDays,
      message: validation.value.message,
      status: 'pending',
    });

    // Notify book owner about the new request
    try {
      await createNotification({
        recipient: targetOwnerId,
        sender: req.user._id,
        title: requestType === 'exchange'
          ? 'New Exchange Request'
          : 'New Borrow Request',
        message: requestType === 'exchange'
          ? `${req.user.name || 'A student'} submitted an exchange request for "${book.title}".`
          : `${req.user.name || 'A student'} submitted a borrow request for "${book.title}".`,
        type: 'request',
        link: '/exchange/requests',
      });
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    const populatedExchange = await ExchangeRequest.findById(exchange._id)
      .populate('book', 'title author images listingType price condition')
      .populate('offeredBook', 'title author images listingType condition')
      .populate('owner', 'name email college');

    res.status(201).json({
      success: true,
      message: `${
        requestType === 'exchange'
          ? 'Exchange proposal'
          : 'Borrow request'
      } submitted successfully!`,
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
  let session;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }

    session = await mongoose.startSession();
    let responseMessage = '';

    await session.withTransaction(async () => {
      const request = await ExchangeRequest.findById(req.params.id).session(session);
      if (!request) {
        const error = new Error('Request not found');
        error.statusCode = 404;
        throw error;
      }
      if (request.owner.toString() !== req.user._id.toString()) {
        const error = new Error('Only the book owner has permission to accept this request');
        error.statusCode = 403;
        throw error;
      }
      if (request.status !== 'pending') {
        const error = new Error(`Cannot accept request with status: ${request.status}`);
        error.statusCode = 400;
        throw error;
      }

      const book = await Book.findById(request.book).session(session);
      if (!book || book.status !== 'available') {
        const error = new Error('The requested book is no longer available.');
        error.statusCode = 400;
        throw error;
      }

      let offeredBookForExchange = null;
      if (request.type === 'exchange') {
        offeredBookForExchange = await Book.findById(request.offeredBook).session(session);
        if (
          !offeredBookForExchange ||
          offeredBookForExchange.status !== 'available' ||
          offeredBookForExchange.owner.toString() !== request.requester.toString()
        ) {
          const error = new Error('The offered book is no longer available for this exchange.');
          error.statusCode = 400;
          throw error;
        }
      }

      request.status = 'accepted';
      request.returnDueDate = request.type === 'borrow'
        ? new Date(Date.now() + (request.durationDays || 14) * 24 * 60 * 60 * 1000)
        : null;
      await request.save({ session });

      if (request.type === 'borrow') {
        book.status = 'borrowed';
        await book.save({ session });
      } else if (request.type === 'exchange') {
        const originalOwnerId = book.owner;
        book.owner = request.requester;
        book.status = 'available';
        offeredBookForExchange.owner = originalOwnerId;
        offeredBookForExchange.status = 'available';
        await book.save({ session });
        await offeredBookForExchange.save({ session });
      }

      await ExchangeRequest.updateMany(
        { book: book._id, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected', message: 'Book accepted by another student request.' },
        { session }
      );

      responseMessage = request.type === 'borrow'
        ? 'Borrow request accepted. The book is now marked as borrowed.'
        : 'Exchange accepted. Ownership of both books has been transferred.';
    });

    const updated = await ExchangeRequest.findById(req.params.id)
      .populate('book', 'title author images listingType status')
      .populate('requester', 'name email college')
      .populate('owner', 'name email college');

    // Notify the requester that their request was accepted
    try {
      await createNotification({
        recipient: updated.requester?._id || updated.requester,
        sender: req.user._id,
        title: 'Request Accepted!',
        message: `Your ${updated.type} request for "${updated.book?.title || 'the book'}" was accepted by the owner.`,
        type: 'request',
        link: '/exchange/requests',
      });
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    res.status(200).json({ success: true, message: responseMessage, data: updated });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  } finally {
    if (session) await session.endSession();
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
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the book owner has permission to reject this request' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot reject request with status: ${request.status}` });
    }

    request.status = 'rejected';
    if (req.body.reason) {
      const reason = String(req.body.reason).trim().slice(0, 500);
      request.message = request.message
        ? `${request.message} (Rejection Note: ${reason})`.slice(0, 500)
        : `Rejection Note: ${reason}`;
    }
    await request.save();

    // Notify the requester about the rejection
    try {
      await createNotification({
        recipient: request.requester,
        sender: req.user._id,
        title: 'Request Rejected',
        message: `Your ${request.type} request was declined by the owner.`,
        type: 'request',
        link: '/exchange/requests',
      });
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    res.status(200).json({ success: true, message: 'Request has been rejected.', data: request });
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
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own submitted requests' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending requests can be cancelled. Current status is ${request.status}`,
      });
    }

    request.status = 'cancelled';
    await request.save();

    // Notify the book owner about the cancellation
    try {
      await createNotification({
        recipient: request.owner,
        sender: req.user._id,
        title: 'Request Cancelled',
        message: `A ${request.type} request for your book has been cancelled.`,
        type: 'request',
        link: '/exchange/requests',
      });
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    res.status(200).json({ success: true, message: 'Your request has been cancelled.', data: request });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a borrowed or exchanged book as returned/completed
// @route   PATCH /api/exchanges/:id/return
// @access  Private (Owner or Requester)
const returnExchangeRequest = async (req, res, next) => {
  let session;
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid request ID.' });
    }

    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      const request = await ExchangeRequest.findById(req.params.id).session(session);
      if (!request) {
        const error = new Error('Transaction request not found');
        error.statusCode = 404;
        throw error;
      }

      const userId = req.user._id.toString();
      const isOwner = request.owner.toString() === userId;
      const isRequester = request.requester.toString() === userId;
      if (!isOwner && !isRequester) {
        const error = new Error('You are not a participant in this transaction');
        error.statusCode = 403;
        throw error;
      }

      if (!['accepted', 'approved', 'active'].includes(request.status)) {
        const error = new Error(`Transaction cannot be marked as returned from status: ${request.status}`);
        error.statusCode = 400;
        throw error;
      }

      const isBorrow = request.type === 'borrow';
      if (isBorrow) {
        const book = await Book.findById(request.book).session(session);
        if (!book) {
          const error = new Error('The borrowed book could not be found.');
          error.statusCode = 404;
          throw error;
        }
        if (book.status !== 'borrowed') {
          const error = new Error('The book is not currently marked as borrowed.');
          error.statusCode = 409;
          throw error;
        }
        book.status = 'available';
        await book.save({ session });
      }

      request.status = isBorrow ? 'returned' : 'completed';
      await request.save({ session });
    });

    const updated = await ExchangeRequest.findById(req.params.id)
      .populate('book', 'title author images listingType status')
      .populate('requester', 'name email college')
      .populate('owner', 'name email college');

    // Notify the other party about the return/completion
    try {
      const recipientId = updated.owner?.toString() === req.user._id.toString()
        ? (updated.requester?._id || updated.requester)
        : (updated.owner?._id || updated.owner);
      await createNotification({
        recipient: recipientId,
        sender: req.user._id,
        title: 'Book Returned',
        message: updated.type === 'borrow'
          ? `The borrowed book "${updated.book?.title || 'the book'}" has been marked as returned.`
          : `The exchange for "${updated.book?.title || 'the book'}" has been marked as completed.`,
        type: 'request',
        link: '/exchange/requests',
      });
    } catch (notifErr) {
      console.warn('[Notification Error]', notifErr.message);
    }

    res.status(200).json({
      success: true,
      message: updated.type === 'borrow'
        ? 'Book marked as returned and is available again.'
        : 'Exchange marked as completed.',
      data: updated,
    });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  } finally {
    if (session) await session.endSession();
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
