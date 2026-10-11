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

  // Fetch books from API endpoint
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

  return (
    <div className="container" style={{ padding: '2rem 1rem', minHeight: '70vh' }}>
      {/* Module 2 Header Card */}
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Badge variant="terracotta">Module 2 • Campus Library Catalog</Badge>
            <h2 style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>Browse Books</h2>
            <p className="text-muted" style={{ margin: 0 }}>
              Search and explore second-hand textbooks available for sale, borrow, or exchange across campus.
            </p>
          </div>
          <Link to="/books/add">
            <Button variant="primary">+ List a Book</Button>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="grid-3" style={{ marginTop: '1.5rem', alignItems: 'end' }}>
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
              { value: 'Sell', label: 'Buy / Sell Only' },
              { value: 'Borrow', label: 'Borrow / Lend Only' },
              { value: 'Exchange', label: 'Exchange Trade Only' },
            ]}
          />

          <div style={{ marginBottom: '1rem' }}>
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ErrorAlert message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Catalog Display */}
      {loading ? (
        <Loader text="Retrieving campus library catalog..." />
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
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>Available Volumes</h3>
            <span className="text-muted text-small">
              Showing {books.length} {books.length === 1 ? 'book' : 'books'}
            </span>
          </div>

          <div className="grid-3">
            {books.map((book) => (
              <BookCard key={book._id || book.id} book={book} actionLabel="View Details" />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BookListingPage;
