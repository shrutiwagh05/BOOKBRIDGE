import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import BookCard from '../../components/books/BookCard';
import bookService from '../../services/bookService';

const MyListingsPage = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchMyListings = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await bookService.getMyListings();

        if (isMounted) {
          setBooks(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Failed to load your book listings:', err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              err.message ||
              'Unable to load your book listings.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyListings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this book listing? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      setActionLoading(`delete-${bookId}`);
      setError('');

      await bookService.deleteBook(bookId);

      setBooks((previousBooks) =>
        previousBooks.filter((book) => book._id !== bookId)
      );
    } catch (err) {
      console.error('Failed to delete listing:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to delete the book listing.'
      );
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusChange = async (bookId, status) => {
    try {
      setActionLoading(`status-${bookId}`);
      setError('');

      const response = await bookService.updateBookStatus(bookId, status);
      const updatedBook = response.data;

      setBooks((previousBooks) =>
        previousBooks.map((book) =>
          book._id === bookId
            ? { ...book, status: updatedBook.status }
            : book
        )
      );
    } catch (err) {
      console.error('Failed to update listing status:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to update listing status.'
      );
    } finally {
      setActionLoading('');
    }
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

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <Loader text="Loading your book listings..." />
      </div>
    );
  }

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <section
        className="paper-card"
        style={{ marginBottom: '2rem', padding: '1.5rem' }}
      >
        <Link
          to="/dashboard"
          className="text-terracotta text-small"
        >
          &larr; Back to Dashboard
        </Link>

        <div
          className="flex-between"
          style={{
            marginTop: '0.75rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginTop: 0 }}>My Books on Campus Shelf</h1>
            <p className="text-muted">
              Manage the books you have listed on BookBridge.
            </p>
          </div>

          <Link to="/books/add" style={{ textDecoration: 'none' }}>
            <Button variant="primary">+ Add New Book</Button>
          </Link>
        </div>
      </section>

      {error && (
        <div
          className="paper-card"
          role="alert"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            color: '#9b2c2c',
          }}
        >
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}

      <div
        className="paper-card"
        style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}
      >
        <strong>{books.length}</strong>{' '}
        {books.length === 1 ? 'book' : 'books'} listed by you
      </div>

      {books.length === 0 ? (
        <div
          className="paper-card"
          style={{ padding: '2rem', textAlign: 'center' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            📚
          </div>

          <h2>Your Book Shelf is Empty</h2>

          <p className="text-muted">
            You haven't listed any books yet. Add your first book and
            start sharing it with your campus community.
          </p>

          <Link to="/books/add" style={{ textDecoration: 'none' }}>
            <Button variant="primary">List Your First Book</Button>
          </Link>
        </div>
      ) : (
        <div className="grid-3">
          {books.map((book) => (
            <div key={book._id}>
              <BookCard book={book} actionLabel="View Details" />

              <section
                className="paper-card"
                style={{ marginTop: '0.75rem', padding: '1rem' }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Listing Status</strong>

                  <div style={{ marginTop: '0.5rem' }}>
                    <Badge variant={getStatusVariant(book.status)}>
                      {book.status || 'available'}
                    </Badge>
                  </div>

                  <label
                    htmlFor={`status-${book._id}`}
                    style={{
                      display: 'block',
                      marginTop: '0.75rem',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Change status
                  </label>

                  <select
                    id={`status-${book._id}`}
                    value={book.status || 'available'}
                    disabled={actionLoading === `status-${book._id}`}
                    onChange={(event) =>
                      handleStatusChange(book._id, event.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                    }}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="exchanged">Exchanged</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/books/${book._id}/edit`)}
                  >
                    Edit Listing
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(book._id)}
                    disabled={actionLoading === `delete-${book._id}`}
                  >
                    {actionLoading === `delete-${book._id}`
                      ? 'Deleting...'
                      : 'Delete Listing'}
                  </Button>
                </div>
              </section>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyListingsPage;