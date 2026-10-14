import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import bookService from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';

const BookListingPage = () => {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await bookService.getBooks();
        const serverBooks = res.data || [];
        if (serverBooks.length > 0) {
          setBooks(serverBooks);

        if (isMounted) {
          setBooks(Array.isArray(serverBooks) ? serverBooks : []);
        }
      } catch (err) {
        console.error('Failed to load book catalog:', err);

        if (isMounted) {
          setBooks([]);
          setError(
            'The book catalog could not be loaded. Please check your connection and try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const title = (book.title || '').toLowerCase();
    const author = (book.author || '').toLowerCase();

    const matchesSearch =
      title.includes(normalizedQuery) ||
      author.includes(normalizedQuery);

    const matchesType = filterType
      ? book.listingType === filterType
      : true;

    return matchesSearch && matchesType;
  });

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

    return (
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

      <section aria-live="polite">
        {loading ? (
          <Loader text="Loading available books..." />
        ) : error ? (
          <div className="paper-card" style={{ padding: '1.5rem' }}>
            <h2>Unable to Load Books</h2>
            <p className="text-muted">{error}</p>

            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <EmptyState
            title={
              books.length === 0
                ? 'No Books Listed Yet'
                : 'No Books Found'
            }
            description={
              books.length === 0
                ? 'There are no book listings available yet. You can create the first listing.'
                : 'Try a different search or clear your filters to see more books.'
            }
            actionLabel={
              books.length === 0 ? 'List a Book' : 'Clear Filters'
            }
            onAction={() => {
              if (books.length === 0) {
                window.location.assign('/books/add');
              } else {
                resetFilters();
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
                {filteredBooks.length}{' '}
                {filteredBooks.length === 1 ? 'book' : 'books'} found
              </span>
            </div>

            <div className="grid-3">
              {filteredBooks.map((book) => {
                const myBook = isMyBook(book);

                return (
                  <div
                    key={book._id}
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
      </section>
    </main>
  );
};

export default BookListingPage;