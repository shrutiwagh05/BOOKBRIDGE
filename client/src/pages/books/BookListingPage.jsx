import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import bookService from '../../services/bookService';

// Sample fallback books if database has no entries yet
const initialDemoBooks = [
  {
    _id: 'bk-101',
    title: 'Operating System Concepts (10th Ed)',
    author: 'Abraham Silberschatz, Peter Baer Galvin',
    category: 'Computer Science & IT',
    listingType: 'Sell',
    price: 350,
    condition: 'Good',
    locationCollege: 'Department of Computing',
  },
  {
    _id: 'bk-102',
    title: 'Database System Concepts',
    author: 'Henry F. Korth',
    category: 'Computer Science & IT',
    listingType: 'Borrow',
    price: 0,
    condition: 'Like New',
    locationCollege: 'Library Stacks 3',
  },
  {
    _id: 'bk-103',
    title: 'Macroeconomics: Theory & Policy',
    author: 'N. Gregory Mankiw',
    category: 'Business & Economics',
    listingType: 'Exchange',
    price: 0,
    condition: 'Fair',
    locationCollege: 'Commerce Wing',
  },
];

const BookListingPage = () => {
  const [books, setBooks] = useState(initialDemoBooks);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await bookService.getBooks();
        if (res.data && res.data.length > 0) {
          setBooks(res.data);
        }
      } catch (err) {
        // Fallback to demo items during foundation phase
        console.info('[BookListing] Using demo dataset while database is empty');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType ? b.listingType === filterType : true;
    return matchSearch && matchType;
  });

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Module 2 Banner */}
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
            <Badge variant="terracotta">Module 2 • Book Listing Foundation</Badge>
            <h2 style={{ marginTop: '0.5rem' }}>Campus Book Catalog</h2>
            <p className="text-muted">
              Assigned to <strong>Developer 2</strong>. Filter, search, and view all listed second-hand books.
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
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setFilterType('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Catalog Display */}
      {loading ? (
        <Loader text="Retrieving library catalog..." />
      ) : filteredBooks.length === 0 ? (
        <EmptyState
          title="No Books Matched"
          description="Try clearing your search terms or filter criteria to discover more volumes."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilterType('');
          }}
        />
      ) : (
        <div className="grid-3">
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} actionLabel="View Details" />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookListingPage;
