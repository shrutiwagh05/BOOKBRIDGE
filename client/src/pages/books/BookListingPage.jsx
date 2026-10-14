
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import bookService from '../../services/bookService';

const BookListingPage = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (filterType) {
        params.type = filterType;
      }

      const response = await bookService.getBooks(params);
      const serverBooks =
        response?.data || (Array.isArray(response) ? response : []);

      setBooks(Array.isArray(serverBooks) ? serverBooks : []);
    } catch (err) {
      console.error('[BookListing] Failed to load catalog:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to retrieve books. Please try again.'
      );
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchCatalog]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('');
  };

  return (
    <div
      className="container"
      style={{ padding: '2rem 1rem', minHeight: '70vh' }}
    >
      <div
        className="paper-card"
        style={{ marginBottom: '2rem' }}
      >
        <div
          className="flex-between"
          style={{
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <div>
            <Badge variant="terracotta">
              Browse Books
            </Badge>
            <h1 style={{ marginTop: '0.5rem' }}>
              Discover Books on Campus
            </h1>
            <p className="text-muted">
              Find books to buy, borrow, or exchange with fellow students.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate('/books/add')}
          >
            + List a Book
          </Button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '1.5rem',
          }}
        >
          <div style={{ flex: '1 1 240px' }}>
            <Input
              type="text"
              placeholder="Search by title, author, or keyword..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(event) => setFilterType(event.target.value)}
            aria-label="Filter books by listing type"
            style={{
              minWidth: '180px',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #ddd)',
              background: 'var(--surface, #fff)',
            }}
          >
            <option value="">All listing types</option>
            <option value="sale">For Sale</option>
            <option value="borrow">For Borrowing</option>
            <option value="exchange">For Exchange</option>
            <option value="lend">For Lending</option>
          </select>

          <Button variant="secondary" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          message={error}
          onRetry={fetchCatalog}
        />
      )}

      {loading ? (
        <Loader text="Loading books..." />
      ) : books.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No books found"
          description={
            searchQuery || filterType
              ? 'Try changing your search or filters.'
              : 'There are no books available right now. Be the first to list one!'
          }
          actionLabel={
            searchQuery || filterType ? 'Clear Filters' : 'List a Book'
          }
          onAction={() => {
            if (searchQuery || filterType) {
              resetFilters();
            } else {
              navigate('/books/add');
            }
          }}
        />
      ) : (
        <>
          <div
            className="flex-between"
            style={{ marginBottom: '1rem', flexWrap: 'wrap' }}
          >
            <h2>Available Books</h2>
            <span className="text-muted">
              {books.length} {books.length === 1 ? 'book' : 'books'} found
            </span>
          </div>

          <div className="book-grid">
            {books.map((book) => (
              <BookCard
                key={book._id || book.id}
                book={book}
                actionLabel="View Details"
              />
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default BookListingPage;
