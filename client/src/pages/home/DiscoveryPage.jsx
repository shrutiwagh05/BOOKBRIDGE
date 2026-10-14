import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import bookService from '../../services/bookService';
import './DiscoveryPage.css';

/* ─── Constants ───────────────────────────────────────────────── */
const CATEGORIES = [
  'Computer Science & IT',
  'Engineering',
  'Business & Economics',
  'Medical & Science',
  'Literature & Fiction',
  'Humanities & Arts',
  'Competitive Exams',
  'Other',
];

const LISTING_TYPES = ['Sell', 'Borrow', 'Exchange'];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
];

const CONDITION_OPTIONS = ['New', 'Like New', 'Good', 'Fair'];

/* ─── Component ───────────────────────────────────────────────── */
const DiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* Read initial state from URL query params (so hero search links work) */
  const [searchQuery,    setSearchQuery]    = useState(searchParams.get('search')   || '');
  const [category,       setCategory]       = useState(searchParams.get('category') || '');
  const [listingType,    setListingType]    = useState(searchParams.get('type')     || '');
  const [condition,      setCondition]      = useState('');
  const [sort,           setSort]           = useState(searchParams.get('sort')     || 'newest');

  const [books,          setBooks]          = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [totalCount,     setTotalCount]     = useState(0);

  /* Debounced search — fetch whenever filters change */
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { sort };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (category)           params.category = category;
      if (listingType)        params.type = listingType;

      const res = await bookService.getBooks(params);
      let data = res.data || [];

      /* Client-side condition filter (no backend field for it yet) */
      if (condition) {
        data = data.filter((b) => b.condition === condition);
      }

      setBooks(data);
      setTotalCount(data.length);
    } catch (err) {
      setError(err.message || 'Something went wrong while searching. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, category, listingType, condition, sort]);

  /* Sync URL params so links from HomePage pre-fill filters */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  /* Update URL query string on filter changes */
  useEffect(() => {
    const params = {};
    if (searchQuery) params.search   = searchQuery;
    if (category)    params.category = category;
    if (listingType) params.type     = listingType;
    if (sort !== 'newest') params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [searchQuery, category, listingType, sort, setSearchParams]);

  const handleReset = () => {
    setSearchQuery('');
    setCategory('');
    setListingType('');
    setCondition('');
    setSort('newest');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || category || listingType || condition || sort !== 'newest';

  return (
    <div className="bb-discovery-page container">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bb-discovery-header">
        <Badge variant="terracotta">Module 1 • Discovery Archive</Badge>
        <h1 style={{ marginTop: '0.5rem' }}>Discover Books</h1>
        <p className="lead text-muted">
          Search, filter and sort thousands of campus book listings — all
          available for sale, borrowing or exchange.
        </p>
      </div>

      {/* ── Search & Filter Panel ───────────────────────────── */}
      <div className="bb-discovery-filters paper-card">
        {/* Search Row */}
        <div className="bb-discovery-search-row">
          <div className="bb-discovery-search-wrap">
            <span className="bb-discovery-search-icon">🔍</span>
            <input
              type="text"
              className="bb-discovery-search-input"
              placeholder="Search by title or author…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search books by title or author"
            />
            {searchQuery && (
              <button
                className="bb-discovery-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Row */}
        <div className="bb-discovery-filter-row">
          <Input
            type="select"
            name="category"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Input
            type="select"
            name="listingType"
            label="Listing Type"
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              ...LISTING_TYPES.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Input
            type="select"
            name="condition"
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            options={[
              { value: '', label: 'Any Condition' },
              ...CONDITION_OPTIONS.map((c) => ({ value: c, label: c })),
            ]}
          />
          <Input
            type="select"
            name="sort"
            label="Sort By"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={SORT_OPTIONS}
          />
        </div>

        {/* Filter Meta Row */}
        <div className="bb-discovery-meta-row">
          <div className="bb-discovery-result-count">
            {loading ? (
              <span className="text-muted text-small">Searching…</span>
            ) : (
              <span className="text-small">
                <strong>{totalCount}</strong>{' '}
                {totalCount === 1 ? 'volume' : 'volumes'} found
                {hasActiveFilters && ' for current filters'}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              ✕ Clear All Filters
            </Button>
          )}
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="bb-active-chips">
            {searchQuery && (
              <span className="bb-filter-chip">
                🔍 "{searchQuery}"
                <button onClick={() => setSearchQuery('')} aria-label="Remove search filter">✕</button>
              </span>
            )}
            {category && (
              <span className="bb-filter-chip">
                📂 {category}
                <button onClick={() => setCategory('')} aria-label="Remove category filter">✕</button>
              </span>
            )}
            {listingType && (
              <span className="bb-filter-chip">
                🏷️ {listingType}
                <button onClick={() => setListingType('')} aria-label="Remove type filter">✕</button>
              </span>
            )}
            {condition && (
              <span className="bb-filter-chip">
                ✨ {condition}
                <button onClick={() => setCondition('')} aria-label="Remove condition filter">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Results Grid ────────────────────────────────────── */}
      <div className="bb-discovery-results">

        {/* Error State */}
        {error && (
          <ErrorAlert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="bb-discovery-loading">
            <Loader text="Searching the library archives…" />
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && books.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No Volumes Found"
            description={
              hasActiveFilters
                ? 'No books match your current search and filter combination. Try broadening your search or clearing some filters.'
                : 'The library archive is empty right now. Be the first to list a book!'
            }
            actionLabel={hasActiveFilters ? 'Reset All Filters' : 'List a Book'}
            onAction={hasActiveFilters ? handleReset : () => window.location.href = '/books/add'}
          />
        )}

        {/* Results */}
        {!loading && !error && books.length > 0 && (
          <>
            <div className="grid-3">
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  actionLabel="View Details"
                />
              ))}
            </div>

            {/* Bottom CTA when results exist */}
            {totalCount >= 6 && (
              <div className="bb-discovery-bottom-cta">
                <p className="text-muted text-small">
                  Showing all {totalCount} results. Can't find what you need?
                </p>
                <Link to="/books/add">
                  <Button variant="outline" size="sm">
                    + List a Book Yourself
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Sidebar / Quick Links ───────────────────────────── */}
      <div className="bb-discovery-quicklinks paper-card">
        <h4>Quick Browse</h4>
        <div className="bb-quicklink-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`bb-quicklink-btn ${category === cat ? 'is-active' : ''}`}
              onClick={() => setCategory(category === cat ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="vintage-divider"><span>or</span></div>
        <div className="bb-quicklink-types">
          {LISTING_TYPES.map((type) => (
            <button
              key={type}
              className={`bb-quicklink-btn ${listingType === type ? 'is-active' : ''}`}
              onClick={() => setListingType(listingType === type ? '' : type)}
            >
              {type === 'Sell' ? '💰' : type === 'Borrow' ? '🤝' : '🔄'} {type}
            </button>
          ))}
        </div>
        <Link to="/exchange" className="bb-discovery-exchange-link">
          <Badge variant="terracotta">Browse Exchange Hub →</Badge>
        </Link>
      </div>

    </div>
  );
};

export default DiscoveryPage;
