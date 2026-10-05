import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
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
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await bookService.getMyListings();
      setBooks(res.data || []);
    } catch (err) {
      console.error('[MyListings] Failed to load listings:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to load your book listings.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this book listing? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(`delete-${bookId}`);
      setError('');

      await bookService.deleteBook(bookId);

      setBooks((prevBooks) =>
        prevBooks.filter((book) => book._id !== bookId)
      );
    } catch (err) {
      console.error('[MyListings] Delete failed:', err);

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

      const res = await bookService.updateBookStatus(bookId, status);

      const updatedBook = res.data;

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book._id === bookId
            ? { ...book, status: updatedBook.status }
            : book
        )
      );
    } catch (err) {
      console.error('[MyListings] Status update failed:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to update listing status.'
      );
    } finally {
      setActionLoading('');
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
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" className="text-terracotta text-small">
          &larr; Back to Dashboard
        </Link>

        <div style={{ marginTop: '0.5rem' }}>
          <Badge variant="terracotta">
            Module 4 &bull; My Listings
          </Badge>
        </div>

        <div
          className="flex-between"
          style={{ marginTop: '0.5rem' }}
        >
          <div>
            <h2>My Books on Campus Shelf</h2>

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

      {error && (
        <div
          className="bb-alert bb-alert--error"
          style={{ marginBottom: '1.5rem' }}
        >
          {error}
        </div>
      )}

      {books.length === 0 ? (
        <EmptyState
          icon="📖"
          title="Your Shelf is Empty"
          description="You have not listed any books yet. Add your first book to start sharing with your campus peers!"
          actionLabel="List a Book Now"
          onAction={() => navigate('/books/add')}
        />
      ) : (
        <div className="grid-3">
          {books.map((book) => (
            <div key={book._id}>
              <BookCard
                book={book}
                actionLabel="View Details"
              />

              <div
                className="paper-card"
                style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <label
                    htmlFor={`status-${book._id}`}
                    style={{
                      display: 'block',
                      fontWeight: '600',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Listing Status
                  </label>

                  <select
                    id={`status-${book._id}`}
                    value={book.status || 'available'}
                    disabled={
                      actionLoading === `status-${book._id}`
                    }
                    onChange={(e) =>
                      handleStatusChange(
                        book._id,
                        e.target.value
                      )
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
                    <option value="exchanged">Exchanged</option>
                    <option value="sold">Sold</option>
                    <option value="borrowed">Borrowed</option>
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
                    onClick={() =>
                      navigate(`/books/${book._id}/edit`)
                    }
                  >
                    Edit Listing
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDelete(book._id)
                    }
                    isLoading={
                      actionLoading === `delete-${book._id}`
                    }
                  >
                    Delete Listing
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;