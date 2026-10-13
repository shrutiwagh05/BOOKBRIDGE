import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const BookManagementPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [listingType, setListingType] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (listingType) params.type = listingType;
      if (status) params.status = status;
      if (sort) params.sort = sort;

      const response = await adminService.getBooks(params);
      setBooks(response.data || []);
    } catch (err) {
      setError('Unable to load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchBooks();
  };

  const handleDelete = async (bookId) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this book listing?'
    );

    if (!confirmed) return;

    try {
      setError('');
      await adminService.deleteBook(bookId);

      setBooks((current) =>
        current.filter((book) => book._id !== bookId)
      );
    } catch (err) {
      setError('Unable to remove the book listing.');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <section className="paper-card" style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin" className="text-small text-terracotta">
          &larr; Back to Dashboard
        </Link>

        <div style={{ marginTop: '0.5rem' }}>
          
          <h1>Book Management</h1>
          <p className="text-muted">
            Review, search, filter, and remove book listings from the platform.
          </p>
        </div>
      </section>

      <section className="paper-card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
              gap: '0.75rem',
              alignItems: 'end',
            }}
          >
            <div>
              <label>Search Books</label>
              <input
                type="text"
                placeholder="Title, author or description"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            
            <div>
              <label>Category</label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Computer Science & IT">Computer Science &amp; IT</option>
                <option value="Engineering">Engineering</option>
                <option value="Business & Economics">Business &amp; Economics</option>
                <option value="Medical & Science">Medical &amp; Science</option>
                <option value="Literature & Fiction">Literature &amp; Fiction</option>
                <option value="Humanities & Arts">Humanities &amp; Arts</option>
                <option value="Competitive Exams">Competitive Exams</option>
                <option value="Other">Other</option>
              </select>
            </div>


            
            <div>
              <label>Listing Type</label>
              <select
                value={listingType}
                onChange={(event) => setListingType(event.target.value)}
              >
                <option value="">All Types</option>
                <option value="Sell">Sell</option>
                <option value="BorrowlistingType">Borrow</option>
                <option value="Exchange">Exchange</option>
              </select>
            </div>


            <div>
              <label>Status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="borrowed">Borrowed</option>
                <option value="exchanged">Exchanged</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div>
              <label>Sort</label>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <Button type="submit">Search</Button>
          </div>
        </form>
      </section>

      {error && (
        <div
          className="paper-card"
          style={{
            marginBottom: '1.5rem',
            borderLeft: '4px solid var(--color-terracotta)',
          }}
        >
          {error}
        </div>
      )}

      <section className="paper-card">
        <div style={{ marginBottom: '1rem' }}>
          <h2>Book Listings</h2>
          <p className="text-muted">
            {loading ? 'Loading...' : `${books.length} book(s) found`}
          </p>
        </div>

        {loading ? (
          <p>Loading book listings...</p>
        ) : books.length === 0 ? (
          <div style={{ padding: '2rem 0' }}>
            <h3>No books found</h3>
            <p className="text-muted">
              There are currently no book listings matching your filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <strong>{book.title}</strong>
                      <br />
                      <span className="text-small text-muted">
                        {book.author}
                      </span>
                    </td>

                    <td>{book.category || '—'}</td>

                    <td>{book.listingType || '—'}</td>

                    <td>
                      {book.owner?.name || 'Unknown'}
                    </td>

                    <td>
                      <Badge variant="terracotta">
                        {book.status || 'unknown'}
                      </Badge>
                    </td>

                    <td>
                      {book.price ? `₹${book.price}` : '—'}
                    </td>

                    <td>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(book._id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default BookManagementPage;