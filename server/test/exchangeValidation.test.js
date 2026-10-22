const test = require('node:test');
const assert = require('node:assert/strict');
const { validateExchangeInput } = require('../src/utils/exchangeValidation');

test('accepts a valid borrow request and trims its message', () => {
  const result = validateExchangeInput({
    type: 'borrow',
    bookId: 'book-a',
    durationDays: '14',
    message: '  Need this for exams  ',
  });
  assert.equal(result.error, undefined);
  assert.deepEqual(result.value, {
    requestType: 'borrow',
    durationDays: 14,
    message: 'Need this for exams',
  });
});

test('uses the listing duration when borrow duration is omitted', () => {
  const result = validateExchangeInput({
    type: 'borrow',
    bookId: 'book-a',
    defaultDuration: 21,
  });
  assert.equal(result.value.durationDays, 21);
});

test('rejects unsupported request types', () => {
  assert.match(
    validateExchangeInput({ type: 'purchase', bookId: 'book-a' }).error,
    /borrow or exchange/
  );
});

test('rejects invalid borrow durations', () => {
  for (const durationDays of [0, -1, 1.5, 366, 'not-a-number']) {
    assert.ok(validateExchangeInput({ type: 'borrow', bookId: 'book-a', durationDays }).error);
  }
});

test('requires an offered book for an exchange', () => {
  assert.match(
    validateExchangeInput({ type: 'exchange', bookId: 'book-a' }).error,
    /Select a book/
  );
});

test('rejects offering the requested book itself', () => {
  assert.match(
    validateExchangeInput({
      type: 'exchange',
      bookId: 'book-a',
      offeredBookId: 'book-a',
    }).error,
    /same book/
  );
});

test('rejects offered books on borrow requests', () => {
  assert.match(
    validateExchangeInput({
      type: 'borrow',
      bookId: 'book-a',
      offeredBookId: 'book-b',
    }).error,
    /only allowed for exchange/
  );
});

test('rejects non-text and oversized messages', () => {
  assert.match(
    validateExchangeInput({ type: 'borrow', bookId: 'book-a', message: 42 }).error,
    /must be text/
  );
  assert.match(
    validateExchangeInput({ type: 'borrow', bookId: 'book-a', message: 'x'.repeat(501) }).error,
    /500 characters/
  );
});

test('accepts an exchange with a distinct offered book', () => {
  const result = validateExchangeInput({
    type: 'exchange',
    bookId: 'book-a',
    offeredBookId: 'book-b',
    message: 'Trade?',
  });
  assert.equal(result.error, undefined);
  assert.equal(result.value.requestType, 'exchange');
});
