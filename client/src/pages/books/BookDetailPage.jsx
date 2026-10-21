import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import Input from '../../components/common/Input';
import bookService from '../../services/bookService';
import exchangeService from '../../services/exchangeService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [userBooks, setUserBooks] = useState([]);
  const [offeredBookId, setOfferedBookId] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [requestMessage, setRequestMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successFeedback, setSuccessFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await bookService.getBookById(id);
        const resolvedBook =
          response?.data?.book ||
          response?.data?.data ||
          response?.data ||
          response?.book ||
          response;

        if (isMounted) {
          if (resolvedBook && resolvedBook.title) {
            setBook(resolvedBook);
          } else {
            setError('Book listing not found.');
          }
        }
      } catch (err) {
        console.warn(`[BookDetailPage] Could not load book id ${id} from API:`, err.message);
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.message ||
            'Unable to load this book. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchBook();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Load user's books for trade proposal
  useEffect(() => {
    const fetchUserShelf = async () => {
      if (isAuthenticated) {
        try {
          const res = await userService.getProfile();
          if (res?.data?.myListings) {
            const availableOnly = res.data.myListings.filter(
              (b) => (b._id !== id && b.id !== id) && b.status === 'available'
            );
            setUserBooks(availableOnly);
            if (availableOnly.length > 0) {
              setOfferedBookId(availableOnly[0]._id || availableOnly[0].id);
            }
          }
        } catch {
          // Ignore profile load errors here
        }
      }
    };

    fetchUserShelf();
  }, [isAuthenticated, id]);

  const handleOpenRequest = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/books/${id}` } } });
      return;
    }

    setDurationDays(book?.rentalPeriodDays || 14);
    setRequestMessage('');
    setAgreeTerms(false);
    setModalError('');
    setSuccessFeedback('');
    setShowRequestModal(true);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!book) return;

    if (!agreeTerms) {
      setModalError('Please accept the campus honor code terms before sending.');
      return;
    }

    const listingType = (book.listingType || '').toLowerCase();
    const isExchange = listingType.includes('exchange');

    if (isExchange && !offeredBookId && userBooks.length > 0) {
      setModalError('Please select one of your listed volumes to offer in trade.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');

      const ownerId = book.owner?._id || book.owner;

      const payload = {
        bookId: book._id || book.id,
        ownerId: ownerId && typeof ownerId === 'object' ? ownerId._id : ownerId,
        type: isExchange ? 'exchange' : 'borrow',
        durationDays: Number(durationDays) || 14,
        offeredBookId: isExchange ? offeredBookId : undefined,
        message: requestMessage.trim(),
      };

      await exchangeService.createRequest(payload);
      setSuccessFeedback('Your request has been successfully dispatched to the owner!');

      setTimeout(() => {
        setShowRequestModal(false);
        navigate('/exchange/requests');
      }, 1500);
    } catch (err) {
      setModalError(err.message || 'Unable to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', minHeight: '60vh' }}>
        <Loader text="Gathering volume details from library catalog..." />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="paper-card" style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center', padding: '3rem 1.5rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📭</span>
          <h2>Book Not Found</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            {error || 'This book listing is no longer available in the campus catalog.'}
          </p>
          <Link to="/books">
            <Button variant="primary">&larr; Return to Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = book.title || 'Untitled Book';
  const author = Array.isArray(book.authors)
    ? book.authors.join(', ')
    : book.author || 'Unknown Author';

  const isbn = book.isbn || '';
  const listingType =
    book.listingType ||
    book.type ||
    book.listingIntent ||
    'Sell';

  const condition = book.condition || 'Good';
  const price = typeof book.price === 'number' ? book.price : 0;
  const location =
    book.locationCollege ||
    book.location ||
    book.campusLocation ||
    book.campusHostelLocation ||
    'Main Campus Library';

  const description =
    book.description ||
    book.conditionNotes ||
    'No additional description provided.';

  const coverImage =
    book.image ||
    (Array.isArray(book.images) && book.images[0] ? book.images[0] : '');

  const normalizedType = String(listingType).toLowerCase();
  const isBorrow = normalizedType.includes('borrow') || normalizedType.includes('lend');
  const isExchange = normalizedType.includes('exchange');

  const getOwnerId = () => {
    if (!book.owner) return null;
    if (typeof book.owner === 'object') return book.owner._id || book.owner.id || null;
    return book.owner;
  };

  const currentUserId = user?._id || user?.id;
  const ownerId = getOwnerId();
  const isMyBook = Boolean(currentUserId && ownerId && String(currentUserId) === String(ownerId));

  const badgeVariant = isExchange ? 'exchange' : isBorrow ? 'borrow' : 'sell';

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/books" className="text-terracotta text-small">
            &larr; Back to Catalog
          </Link>
        </div>

        <div className="grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>
          {/* Cover Display */}
          <div
            style={{
              background: 'var(--color-paper-dark, #F2E7D7)',
              borderRadius: 'var(--radius-md, 8px)',
              minHeight: '360px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-subtle, #E4D5C1)',
              textAlign: 'center',
              padding: '1.5rem',
            }}
          >
            {coverImage ? (
              <img
                src={coverImage}
                alt={title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '360px',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  boxShadow: 'var(--shadow-card)',
                }}
              />
            ) : (
              <div>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '0.5rem' }}>
                  📖
                </span>
                <p className="text-serif" style={{ fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
                  {title}
                </p>
                <p className="text-muted text-small" style={{ margin: 0 }}>
                  Volume ID: <code>{id}</code>
                </p>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <Badge variant={badgeVariant}>{listingType}</Badge>
              <Badge variant={condition}>{condition}</Badge>
              {book.category && <Badge variant="secondary">{book.category}</Badge>}
              {isMyBook && (
                <Badge variant="terracotta">
                  Your Listing
                </Badge>
              )}
            </div>

            <h1 style={{ marginTop: '0.25rem', marginBottom: '0.5rem', fontSize: '1.85rem' }}>
              {title}
            </h1>

            <p className="text-serif text-muted" style={{ fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
              by {author}
            </p>

            {!isBorrow && price > 0 && (
              <h2 className="text-terracotta" style={{ marginBottom: '1.25rem' }}>
                ₹{price}
              </h2>
            )}

            {isBorrow && (
              <h3 className="text-terracotta" style={{ marginBottom: '1.25rem' }}>
                Available for Borrow & Loan
              </h3>
            )}

            {isExchange && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 className="text-terracotta" style={{ margin: 0 }}>
                  Open for Book Barter / Exchange
                </h3>
                {book.exchangePreferences && (
                  <p className="text-small" style={{ margin: '0.25rem 0 0' }}>
                    <strong>Looking for:</strong> {book.exchangePreferences}
                  </p>
                )}
              </div>
            )}

            <div style={{ marginBottom: '1.75rem', lineHeight: '1.7' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Description & Condition Notes</h4>
              <p className="text-small" style={{ marginBottom: '1rem', color: 'var(--color-ink-light, #4A3E37)' }}>
                {description}
              </p>

              {isbn && (
                <p className="text-small" style={{ marginBottom: '0.5rem' }}>
                  <strong>ISBN:</strong> {isbn}
                </p>
              )}

              <p className="text-small" style={{ marginBottom: '0.5rem' }}>
                <strong>📍 Campus Location:</strong> {location}
              </p>

              {book.owner?.name && (
                <p className="text-small" style={{ marginBottom: '0.5rem' }}>
                  <strong>👤 Listed by:</strong> {book.owner.name} ({book.owner.college || 'Peer Student'})
                </p>
              )}

              {book.editionOrYear && (
                <p className="text-small" style={{ marginBottom: '0.5rem' }}>
                  <strong>📅 Edition / Year:</strong> {book.editionOrYear}
                </p>
              )}
            </div>

            {/* Interaction Buttons */}
            {isMyBook ? (
              <div
                style={{
                  padding: '1rem',
                  border: '1px solid var(--color-border-subtle, #E4D5C1)',
                  borderRadius: 'var(--radius-md, 8px)',
                  background: 'var(--color-paper-dark, #F2E7D7)',
                }}
              >
                <h4 style={{ marginBottom: '0.5rem' }}>Your Listing</h4>
                <p className="text-small text-muted" style={{ marginBottom: '1rem' }}>
                  This is your own book. You cannot request to buy, borrow, or exchange your own listing.
                </p>
                <Link to="/dashboard/listings">
                  <Button variant="outline">View My Books</Button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {isBorrow ? (
                  <Button variant="primary" size="lg" onClick={handleOpenRequest}>
                    🤝 Request to Borrow
                  </Button>
                ) : isExchange ? (
                  <Button variant="primary" size="lg" onClick={handleOpenRequest}>
                    🔄 Propose Exchange
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" onClick={handleOpenRequest}>
                    🛒 Contact Seller
                  </Button>
                )}

                <Link to="/exchange">
                  <Button variant="outline" size="lg">
                    Explore Exchange Hub
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interaction Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => !submitting && setShowRequestModal(false)}
        title={isExchange ? `Propose Exchange for "${title}"` : `Request to Borrow "${title}"`}
        footer={
          <>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setShowRequestModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={submitting}
              onClick={handleSendRequest}
            >
              Confirm & Dispatch Request
            </Button>
          </>
        }
      >
        <div>
          {modalError && <ErrorAlert message={modalError} onClose={() => setModalError('')} />}
          {successFeedback && (
            <div
              style={{
                background: '#E6F4EA',
                color: '#137333',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              ✓ {successFeedback}
            </div>
          )}

          <p>
            You are requesting <strong>{title}</strong> by {author}.
          </p>

          {isBorrow && (
            <div style={{ margin: '1rem 0' }}>
              <Input
                label="Requested Borrow Duration (days)"
                type="number"
                min="1"
                max="60"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </div>
          )}

          {isExchange && (
            <div style={{ margin: '1rem 0' }}>
              {userBooks.length > 0 ? (
                <Input
                  label="Select a book from your shelf to offer in trade:"
                  type="select"
                  value={offeredBookId}
                  onChange={(e) => setOfferedBookId(e.target.value)}
                  options={userBooks.map((b) => ({
                    value: b._id || b.id,
                    label: `${b.title} (${b.condition})`,
                  }))}
                />
              ) : (
                <div
                  style={{
                    background: '#FFF3CD',
                    color: '#856404',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  ℹ️ You do not have any available books listed on your shelf yet. You can still message the owner below to coordinate a trade.
                </div>
              )}
            </div>
          )}

          <div style={{ margin: '1rem 0' }}>
            <Input
              label="Note to Book Owner (Optional)"
              type="textarea"
              placeholder="e.g. Hey! Need this for next week's mid-terms. Can meet near college library."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '1rem', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span>I agree to respect the campus lending honor code and return/trade the volume safely.</span>
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default BookDetailPage;
