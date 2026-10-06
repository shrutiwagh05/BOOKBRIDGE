import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyBorrowedBooksPage = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returningId, setReturningId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/exchanges/outgoing');

      const requests = response.data?.data || [];

      const activeBorrowedBooks = requests.filter(
        (request) =>
          request.type === 'borrow' &&
          ['accepted', 'approved', 'active'].includes(request.status)
      );

      setBorrowedBooks(activeBorrowedBooks);
    } catch (err) {
      console.error('Failed to load borrowed books:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load your borrowed books. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleReturnBook = async (requestId) => {
    const confirmed = window.confirm(
      'Are you sure you want to mark this book as returned?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setReturningId(requestId);
      setError('');
      setSuccessMessage('');

      await api.patch(`/exchanges/${requestId}/return`);

      setBorrowedBooks((currentBooks) =>
        currentBooks.filter((book) => book._id !== requestId)
      );

      setSuccessMessage('Book returned successfully.');
    } catch (err) {
      console.error('Failed to return book:', err);

      setError(
        err.response?.data?.message ||
          'Unable to return the book. Please try again.'
      );
    } finally {
      setReturningId(null);
    }
  };

  const getBookImage = (book) => {
    if (!book?.images) {
      return null;
    }

    if (Array.isArray(book.images)) {
      return book.images[0] || null;
    }

    return book.images;
  };

  const formatDate = (date) => {
    if (!date) {
      return 'Not available';
    }

    const formatted = new Date(date);

    if (Number.isNaN(formatted.getTime())) {
      return 'Not available';
    }

    return formatted.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) {
      return null;
    }

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const difference = due.getTime() - today.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="paper-card">
          <p className="text-muted">Loading your borrowed books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <Link
            to="/dashboard"
            style={{
              textDecoration: 'none',
              color: 'var(--color-terracotta)',
              fontWeight: '600',
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}
          >
            ← Back to Dashboard
          </Link>

          <h1 style={{ marginBottom: '0.35rem' }}>
            My Borrowed Books
          </h1>

          <p className="text-muted">
            Books you are currently borrowing from other BookBridge members.
          </p>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div
          style={{
            padding: '0.9rem 1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            background: '#e8f5e9',
            color: '#2e7d32',
            border: '1px solid #a5d6a7',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '0.9rem 1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            background: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef9a9a',
          }}
        >
          {error}
        </div>
      )}

      {/* Count */}
      <div
        className="paper-card"
        style={{
          marginBottom: '1.5rem',
        }}
      >
        <p className="text-muted text-small">Currently Borrowed</p>

        <h2
          className="text-terracotta"
          style={{ marginTop: '0.35rem' }}
        >
          {borrowedBooks.length}
        </h2>
      </div>

      {/* Empty state */}
      {borrowedBooks.length === 0 ? (
        <div
          className="paper-card"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}
          >
            📚
          </div>

          <h2 style={{ marginBottom: '0.75rem' }}>
            No borrowed books
          </h2>

          <p
            className="text-muted"
            style={{
              maxWidth: '500px',
              margin: '0 auto 1.5rem',
              lineHeight: '1.6',
            }}
          >
            You are not currently borrowing any books.
            Browse available books and find something you'd like to read.
          </p>

          <Link
            to="/books"
            className="btn btn-primary"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
            }}
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {borrowedBooks.map((request) => {
            const book = request.book;
            const image = getBookImage(book);
            const daysRemaining = getDaysRemaining(
              request.returnDueDate
            );

            return (
              <div
                key={request._id}
                className="paper-card"
                style={{
                  overflow: 'hidden',
                }}
              >
                {/* Book image */}
                <div
                  style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    background: '#f3eee8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={book?.title || 'Book cover'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        color: 'var(--color-muted)',
                      }}
                    >
                      <div style={{ fontSize: '2.5rem' }}>📖</div>
                      <p style={{ marginTop: '0.5rem' }}>
                        No cover image
                      </p>
                    </div>
                  )}
                </div>

                {/* Book information */}
                <h2
                  style={{
                    fontSize: '1.3rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  {book?.title || 'Untitled Book'}
                </h2>

                <p
                  className="text-muted"
                  style={{ marginBottom: '1rem' }}
                >
                  by {book?.author || 'Unknown Author'}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gap: '0.65rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <span className="text-muted text-small">
                      Condition
                    </span>
                    <p style={{ fontWeight: '600' }}>
                      {book?.condition || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted text-small">
                      Borrow Duration
                    </span>
                    <p style={{ fontWeight: '600' }}>
                      {request.durationDays
                        ? `${request.durationDays} days`
                        : 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted text-small">
                      Due Date
                    </span>
                    <p style={{ fontWeight: '600' }}>
                      {formatDate(request.returnDueDate)}
                    </p>
                  </div>

                  {daysRemaining !== null && (
                    <div>
                      <span className="text-muted text-small">
                        Time Remaining
                      </span>

                      <p
                        style={{
                          fontWeight: '600',
                          color:
                            daysRemaining < 0
                              ? '#c62828'
                              : daysRemaining <= 3
                              ? '#e65100'
                              : 'var(--color-success)',
                        }}
                      >
                        {daysRemaining < 0
                          ? `${Math.abs(daysRemaining)} day(s) overdue`
                          : daysRemaining === 0
                          ? 'Due today'
                          : `${daysRemaining} day(s) remaining`}
                      </p>
                    </div>
                  )}

                  {request.owner && (
                    <div>
                      <span className="text-muted text-small">
                        Book Owner
                      </span>

                      <p style={{ fontWeight: '600' }}>
                        {request.owner.name || 'BookBridge Member'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {book?._id && (
                    <Link
                      to={`/books/${book._id}`}
                      className="btn btn-secondary"
                      style={{
                        textDecoration: 'none',
                        flex: '1',
                        textAlign: 'center',
                      }}
                    >
                      View Book
                    </Link>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleReturnBook(request._id)}
                    disabled={returningId === request._id}
                    style={{
                      flex: '1',
                      cursor:
                        returningId === request._id
                          ? 'not-allowed'
                          : 'pointer',
                      opacity:
                        returningId === request._id ? 0.7 : 1,
                    }}
                  >
                    {returningId === request._id
                      ? 'Returning...'
                      : 'Return Book'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBorrowedBooksPage;