const ALLOWED_REQUEST_TYPES = ['borrow', 'exchange'];

const validateExchangeInput = ({ type, durationDays, message, offeredBookId, bookId, defaultDuration = 14 }) => {
  const requestType = type || 'borrow';

  if (!ALLOWED_REQUEST_TYPES.includes(requestType)) {
    return { error: 'Request type must be borrow or exchange.' };
  }

  if (requestType === 'exchange') {
    if (!offeredBookId) return { error: 'Select a book to offer in exchange.' };
    if (String(offeredBookId) === String(bookId)) {
      return { error: 'You cannot offer the same book you are requesting.' };
    }
  } else if (offeredBookId) {
    return { error: 'An offered book is only allowed for exchange requests.' };
  }

  const rawDuration = durationDays === undefined || durationDays === null || durationDays === ''
    ? defaultDuration
    : Number(durationDays);
  if (!Number.isInteger(rawDuration) || rawDuration < 1 || rawDuration > 365) {
    return { error: 'Borrow duration must be a whole number between 1 and 365 days.' };
  }

  if (message !== undefined && typeof message !== 'string') {
    return { error: 'Message must be text.' };
  }
  const cleanMessage = (message || '').trim();
  if (cleanMessage.length > 500) {
    return { error: 'Message cannot exceed 500 characters.' };
  }

  return { value: { requestType, durationDays: rawDuration, message: cleanMessage } };
};

module.exports = { validateExchangeInput };
