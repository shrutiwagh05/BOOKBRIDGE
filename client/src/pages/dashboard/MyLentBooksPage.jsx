import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyLentBooksPage = () => {
  const [lentBooks, setLentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [returningId, setReturningId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchLentBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/exchanges/incoming');

      const requests = response.data?.data || [];

      const activeLentBooks = requests.filter(
        (request) =>
          request.type === 'borrow' &&
          ['accepted', 'approved', 'active'].includes(request.status)
      );

      setLentBooks(activeLentBooks);
    } catch (err) {
      console.error('Failed to load lent books:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load your lent books. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLentBooks();
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

      setLentBooks((currentBooks) =>
        currentBooks.filter((request) => request._id !== requestId)
      );

      setSuccessMessage('Book marked as returned successfully.');
    } catch (err) {
      console.error('Failed to return book:', err);

      setError(
        err.response?.data?.message ||
          'Unable to mark the book as returned. Please try again.'
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

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
  };

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: '2rem 1rem' }}
      >
        <div className="paper-card">
          <p className="text-muted">
            Loading your lent books...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ padding: '2rem 1rem' }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '1.5rem',
        }}
      >
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
          My Lent Books
        </h1>

        <p className="text-muted">
          Books you are currently lending to other
          BookBridge members.
        </p>
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
        <p className="text-muted text-small">
          Currently Lent
        </p>

        <h2
          className="text-terracotta"
          style={{ marginTop: '0.35rem' }}
        >
          {lentBooks.length}
        </h2>
      </div>

      {/* Empty state */}
      {lentBooks.length === 0 ? (
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
            No lent books
          </h2>

          <p
            className="text-muted"
            style={{
              maxWidth: '500px',
              margin: '0 auto 1.5rem',
              lineHeight: '1.6',
            }}
          >
            You are not currently lending any books
            to other BookBridge members.
          </p>

          <Link
            to="/dashboard/listings"
            className="btn btn-primary"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
            }}
          >
            View My Books
          </Link>
        </div>
      ) : (
        /* Lent books */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {lentBooks.map((request) => {
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
                      alt={
                        book?.title ||
                        'Book cover'
                      }
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
                      <div
                        style={{
                          fontSize: '2.5rem',
                        }}
                      >
                        📖
                      </div>

                      <p
                        style={{
                          marginTop: '0.5rem',
                        }}
                      >
                        No cover image
                      </p>
                    </div>
                  )}
                </div>
                {/* Book details */}
                <div>
                  <h2
                    style={{
                      marginBottom: '0.5rem',
                    }}
                  >
                    {book?.title || 'Untitled Book'}
                  </h2>

                  <p
                    className="text-muted"
                    style={{
                      marginBottom: '0.75rem',
                    }}
                  >
                    by {book?.author || 'Unknown Author'}
                  </p>

                  {/* Condition */}
                  {book?.condition && (
                    <div
                      style={{
                        marginBottom: '1rem',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.35rem 0.7rem',
                          borderRadius: '20px',
                          background: '#f3eee8',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                        }}
                      >
                        {book.condition}
                      </span>
                    </div>
                  )}

                  {/* Borrower information */}
                  <div
                    style={{
                      padding: '1rem',
                      background: '#faf7f2',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      Borrowed By
                    </h3>

                    <p
                      style={{
                        marginBottom: '0.35rem',
                      }}
                    >
                      <strong>
                        {request.requester?.name ||
                          'Unknown User'}
                      </strong>
                    </p>

                    {request.requester?.college && (
                      <p
                        className="text-muted"
                        style={{
                          marginBottom: '0.35rem',
                        }}
                      >
                        {request.requester.college}
                      </p>
                    )}

                    {request.requester?.email && (
                      <p
                        className="text-muted"
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        {request.requester.email}
                      </p>
                    )}
                  </div>

                  {/* Borrow duration */}
                  <div
                    style={{
                      marginBottom: '0.75rem',
                    }}
                  >
                    <strong>
                      Borrow Duration:
                    </strong>{' '}
                    {request.durationDays
                      ? `${request.durationDays} days`
                      : 'Not specified'}
                  </div>

                  {/* Due date */}
                  <div
                    style={{
                      marginBottom: '0.75rem',
                    }}
                  >
                    <strong>
                      Due Date:
                    </strong>{' '}
                    {formatDate(
                      request.returnDueDate
                    )}
                  </div>

                  {/* Days remaining */}
                  {daysRemaining !== null && (
                    <div
                      style={{
                        marginBottom: '1.25rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '6px',
                        background:
                          daysRemaining < 0
                            ? '#ffebee'
                            : daysRemaining <= 3
                            ? '#fff8e1'
                            : '#e8f5e9',
                        color:
                          daysRemaining < 0
                            ? '#c62828'
                            : daysRemaining <= 3
                            ? '#f57f17'
                            : '#2e7d32',
                        fontWeight: '600',
                      }}
                    >
                      {daysRemaining < 0
                        ? `Overdue by ${Math.abs(
                            daysRemaining
                          )} ${
                            Math.abs(
                              daysRemaining
                            ) === 1
                              ? 'day'
                              : 'days'
                          }`
                        : daysRemaining === 0
                        ? 'Due today'
                        : `${daysRemaining} ${
                            daysRemaining === 1
                              ? 'day'
                              : 'days'
                          } remaining`}
                    </div>
                  )}

                  {/* Actions */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Link
                      to={`/books/${book?._id}`}
                      className="btn btn-secondary"
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      View Book
                    </Link>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        handleReturnBook(request._id)
                      }
                      disabled={
                        returningId === request._id
                      }
                    >
                      {returningId === request._id
                        ? 'Returning...'
                        : 'Mark as Returned'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLentBooksPage;