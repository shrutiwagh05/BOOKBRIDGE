import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import api from '../../services/api';

const BookDetailPage = () => {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/books/${id}`);

        setBook(
          response.data?.book ||
          response.data?.data ||
          response.data
        );
      } catch (err) {
        console.error('Failed to fetch book:', err);
        setError(
          err.response?.data?.message ||
          'Unable to load this book. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div
          className="paper-card"
          style={{
            maxWidth: '850px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div
          className="paper-card"
          style={{
            maxWidth: '850px',
            margin: '0 auto',
          }}
        >
          <Link to="/books" className="text-terracotta text-small">
            &larr; Back to Catalog
          </Link>

          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
            }}
          >
            <h2>Book Not Found</h2>

            <p className="text-muted">
              {error || 'This book could not be found.'}
            </p>

            <Link to="/books">
              <Button variant="primary">
                Back to Catalog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = book.title || 'Untitled Book';

  const author = Array.isArray(book.authors)
    ? book.authors.join(', ')
    : book.author || 'Unknown Author';

  const listingType =
    book.listingIntent ||
    book.type ||
    book.listingType ||
    'Available';

  const condition = book.condition || 'Not specified';

  const price =
    book.price !== undefined && book.price !== null
      ? book.price
      : 0;

  // FIXED: locationCollege is the actual field used by BookBridge
  const location =
    book.locationCollege ||
    book.location ||
    book.campusLocation ||
    book.campusHostelLocation ||
    'Location not specified';

  const description =
    book.conditionNotes ||
    book.description ||
    'No additional condition notes provided.';

  const normalizedType = String(listingType).toLowerCase();

  const isBorrow =
    normalizedType.includes('borrow') ||
    normalizedType.includes('lend');

  const isExchange =
    normalizedType.includes('exchange');

  const badgeVariant = isExchange
    ? 'exchange'
    : isBorrow
      ? 'borrow'
      : 'sell';

  return (
    <div
      className="container"
      style={{ padding: '2rem 1rem' }}
    >
      <div
        className="paper-card"
        style={{
          maxWidth: '850px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/books"
            className="text-terracotta text-small"
          >
            &larr; Back to Catalog
          </Link>

          <div style={{ marginTop: '0.75rem' }}>
            <Badge variant="terracotta">
              Module 2 • Book Details
            </Badge>
          </div>
        </div>

        <div
          className="grid-2"
          style={{ gap: '2rem' }}
        >
          {/* Cover Display */}
          <div
            style={{
              background: 'var(--color-paper-dark)',
              borderRadius: 'var(--radius-md)',
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '3.5rem',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                📖
              </span>

              <p className="text-muted text-small">
                Book Cover / Photo Placeholder
                <br />
                Book ID: <code>{id}</code>
              </p>
            </div>
          </div>

          {/* Details Column */}
          <div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '8px',
                flexWrap: 'wrap',
              }}
            >
              <Badge variant={badgeVariant}>
                {listingType}
              </Badge>

              <Badge variant="like-new">
                {condition}
              </Badge>
            </div>

            <h2>{title}</h2>

            <p
              className="text-serif text-muted"
              style={{
                fontStyle: 'italic',
                marginBottom: '1rem',
              }}
            >
              by {author}
            </p>

            {!isBorrow && price > 0 && (
              <h3
                className="text-terracotta"
                style={{ marginBottom: '1.25rem' }}
              >
                ₹{price}
              </h3>
            )}

            {isBorrow && (
              <h3
                className="text-terracotta"
                style={{ marginBottom: '1.25rem' }}
              >
                Available for Borrow
              </h3>
            )}

            <div
              style={{
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              <h4>Description & Condition Note</h4>

              <p className="text-small">
                {description}
              </p>

              <p className="text-small">
                <strong>Location:</strong> {location}
              </p>

              {book.category && (
                <p className="text-small">
                  <strong>Category:</strong> {book.category}
                </p>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="primary"
                onClick={() =>
                  setShowRequestModal(true)
                }
              >
                {isExchange
                  ? 'Request Exchange'
                  : isBorrow
                    ? 'Request to Borrow'
                    : 'Request to Buy'}
              </Button>

              <Link to="/exchange">
                <Button variant="outline">
                  Propose Exchange
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() =>
          setShowRequestModal(false)
        }
        title="Send Request to Owner"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setShowRequestModal(false)
              }
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                alert(
                  'Request hook ready! Developer 2 & 3 will connect this to /api/exchanges.'
                );

                setShowRequestModal(false);
              }}
            >
              Send Request
            </Button>
          </>
        }
      >
        <p>
          You are requesting{' '}
          <strong>{title}</strong>.
        </p>

        <p className="text-small text-muted">
          Module 3 will link this directly to the
          exchange/borrow workflow.
        </p>
      </Modal>
    </div>
  );
};

export default BookDetailPage;