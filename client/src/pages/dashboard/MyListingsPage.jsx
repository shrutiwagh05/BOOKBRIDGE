import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import userService from '../../services/userService';

const MyListingsPage = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMyBooks = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await userService.getProfile();

        const myBooks = response.data?.myListings || [];

        setBooks(myBooks);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to load your books'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMyBooks();
  }, []);

  const getBookImage = (book) => {
    if (book?.images && book.images.length > 0) {
      return book.images[0];
    }

    return null;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'available':
        return 'success';

      case 'reserved':
      case 'borrowed':
        return 'terracotta';

      case 'exchanged':
      case 'sold':
        return 'default';

      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="paper-card">
          <p className="text-muted">Loading your books...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="paper-card">
          <h3>Unable to load your books</h3>

          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            {error}
          </p>

          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Page Header */}
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Link
          to="/dashboard"
          className="text-terracotta text-small"
        >
          &larr; Back to Dashboard
        </Link>

        <div style={{ marginTop: '0.75rem' }}>
          <Badge variant="terracotta">
            Module 4 • My Books
          </Badge>
        </div>

        <div
          className="flex-between"
          style={{
            marginTop: '0.75rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2>My Books</h2>

            <p className="text-muted">
              Manage the books you have listed on BookBridge.
            </p>
          </div>

          <Link to="/books/add">
            <Button variant="primary">
              + Add New Book
            </Button>
          </Link>
        </div>
      </div>

      {/* Book Count */}
      <div
        className="paper-card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
        }}
      >
        <strong>{books.length}</strong>{' '}
        {books.length === 1 ? 'book' : 'books'} listed by you
      </div>

      {/* Empty State */}
      {books.length === 0 && (
        <div className="paper-card" style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
            }}
          >
            📚
          </div>

          <h3>Your Book Shelf is Empty</h3>

          <p
            className="text-muted"
            style={{
              maxWidth: '500px',
              margin: '0.75rem auto 1.5rem',
            }}
          >
            You haven't listed any books yet. Add your first
            book and start sharing it with your campus community.
          </p>

          <Link to="/books/add">
            <Button variant="primary">
              List Your First Book
            </Button>
          </Link>
        </div>
      )}

      {/* Books Grid */}
      {books.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {books.map((book) => {
            const image = getBookImage(book);

            return (
              <div
                key={book._id}
                className="paper-card"
                style={{
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                {/* Book Image */}
                <div
                  style={{
                    height: '220px',
                    background: '#f1ebe4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={book.title || 'Book cover'}
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
                        color: 'var(--color-deep-brown)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '3rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        📖
                      </div>

                      <span className="text-muted text-small">
                        No cover image
                      </span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div style={{ padding: '1.25rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        lineHeight: '1.3',
                      }}
                    >
                      {book.title}
                    </h3>

                    <Badge
                      variant={getStatusVariant(book.status)}
                    >
                      {book.status || 'available'}
                    </Badge>
                  </div>

                  <p
                    className="text-muted"
                    style={{ marginBottom: '0.75rem' }}
                  >
                    by {book.author}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gap: '0.45rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <p className="text-small">
                      <strong>Category:</strong>{' '}
                      {book.category || 'Other'}
                    </p>

                    <p className="text-small">
                      <strong>Type:</strong>{' '}
                      {book.listingType || 'Not specified'}
                    </p>

                    <p className="text-small">
                      <strong>Condition:</strong>{' '}
                      {book.condition || 'Not specified'}
                    </p>

                    {book.listingType === 'Sell' && (
                      <p className="text-small">
                        <strong>Price:</strong>{' '}
                        ₹{Number(book.price || 0).toLocaleString('en-IN')}
                      </p>
                    )}

                    {book.listingType === 'Borrow' &&
                      book.rentalPeriodDays && (
                        <p className="text-small">
                          <strong>Borrow period:</strong>{' '}
                          {book.rentalPeriodDays} days
                        </p>
                      )}
                  </div>

                  <Link to={`/books/${book._id}`}>
                    <Button
                      variant="outline"
                      style={{ width: '100%' }}
                    >
                      View Book
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;