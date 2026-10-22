import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import Badge from '../../components/common/Badge';
import bookService from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';

const BookListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  // Fetch books from API endpoint with debounced search and filtering
  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterType) params.type = filterType;

      const res = await bookService.getBooks(params);
      const serverBooks = res?.data || (Array.isArray(res) ? res : []);
      setBooks(Array.isArray(serverBooks) ? serverBooks : []);
    } catch (err) {
      console.error('[BookListing] Failed to load catalog from API:', err);
      setError(
        err.message || 'Unable to retrieve catalog. Please check that the server is running.'
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

  const isMyBook = (book) => {
    if (!user || !book.owner) {
      return false;
    }

    const ownerId =
      typeof book.owner === 'object'
        ? book.owner._id || book.owner.id
        : book.owner;

    const userId = user._id || user.id;

    return Boolean(
      ownerId &&
      userId &&
      String(ownerId) === String(userId)
    );
  };

  return (
    <main
      className="container"
      style={{
        padding: '2rem 1rem',
        minHeight: '65vh',
        color: 'var(--text-primary, #30231e)',
      }}
    >
      <section
        className="paper-card"
        style={{ marginBottom: '2rem', padding: '1.5rem' }}
      >
        <div
          className="flex-between"
          style={{ gap: '1rem', flexWrap: 'wrap' }}
        >
          <div>
            <h1 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              Campus Book Catalog
            </h1>

            <p className="text-muted" style={{ marginBottom: 0 }}>
              Discover textbooks to buy, borrow, or exchange with your
              campus community.
            </p>
          </div>

          <Link to="/books/add" style={{ textDecoration: 'none' }}>
            <Button variant="primary">+ List a Book</Button>
          </Link>
        </div>

        <div
          className="grid-3"
          style={{ marginTop: '1.5rem', alignItems: 'end' }}
        >
          <Input
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Input
            type="select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: '', label: 'All Listing Types' },
              { value: 'Sell', label: 'Buy / Sell' },
              { value: 'Borrow', label: 'Borrow / Lend' },
              { value: 'Exchange', label: 'Book Exchange' },
            ]}
          />

          <div style={{ marginBottom: '1rem' }}>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorAlert message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Catalog Display */}
      {loading ? (
        <Loader text="Loading available books..." />
      ) : books.length === 0 ? (
        <EmptyState
          title={searchQuery || filterType ? 'No Books Matched' : 'No Books Listed Yet'}
          description={
            searchQuery || filterType
              ? 'Try clearing your search terms or filter criteria to discover more volumes.'
              : 'There are no book listings currently available in the catalog. Be the first to list one!'
          }
          actionLabel={searchQuery || filterType ? 'Reset Filters' : '+ List a Book Now'}
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
            style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}
          >
            <h2 style={{ margin: 0 }}>Available Listings</h2>

            <span className="text-muted">
              {books.length} {books.length === 1 ? 'book' : 'books'} found
            </span>
          </div>

          <div className="grid-3">
            {books.map((book) => {
              const myBook = isMyBook(book);

              return (
                <div
                  key={book._id || book.id}
                  style={{ position: 'relative' }}
                >
                  {myBook && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        zIndex: 2,
                      }}
                    >
                      <Badge variant="terracotta">
                        Your Listing
                      </Badge>
                    </div>
                  )}

                  <BookCard
                    book={book}
                    actionLabel={
                      myBook ? 'View Your Listing' : 'View Details'
                    }
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
};

export default BookListingPage;