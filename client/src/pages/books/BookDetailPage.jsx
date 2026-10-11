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

// Fallback demo books registry to ensure sample preview links also display gracefully
const fallbackDemoBooks = [
  {
    _id: 'bk-101',
    title: 'Operating System Concepts (10th Ed)',
    author: 'Abraham Silberschatz, Peter Baer Galvin',
    category: 'Computer Science & IT',
    listingType: 'Sell',
    price: 350,
    condition: 'Good',
    locationCollege: 'Department of Computing',
    description: 'Comprehensive dinosaur OS book. Covers virtualization, deadlocks, and kernel memory.',
  },
  {
    _id: 'bk-102',
    title: 'Database System Concepts',
    author: 'Henry F. Korth',
    category: 'Computer Science & IT',
    listingType: 'Borrow',
    price: 0,
    rentalPeriodDays: 14,
    condition: 'Like New',
    locationCollege: 'Library Stacks 3',
    description: 'Classic database text covering relational calculus, normalization, transactions, and indexing.',
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
    description: 'Macroeconomics principles with handwritten marginal notes. Looking to trade for Microeconomics.',
  },
  {
    _id: 'sample-1',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'Computer Science & IT',
    listingType: 'Borrow',
    price: 0,
    rentalPeriodDays: 21,
    condition: 'Like New',
    locationCollege: 'Main Campus Library Desk',
    description: 'MIT Press Algorithms reference book. Essential for Data Structures & Algorithms.',
  },
  {
    _id: 'sample-2',
    title: 'Principles of Neural Science',
    author: 'Eric Kandel',
    category: 'Medical & Science',
    listingType: 'Sell',
    price: 450,
    condition: 'Good',
    locationCollege: 'Medical Sciences Block',
    description: 'Foundational neuroscience textbook in solid condition. Minor highlighting in early chapters.',
  },
  {
    _id: 'sample-3',
    title: 'Clean Code: A Handbook of Agile Software',
    author: 'Robert C. Martin',
    category: 'Computer Science & IT',
    listingType: 'Exchange',
    price: 0,
    condition: 'New',
    locationCollege: 'Department of Computing',
    description: 'Clean Code handbook. Open to exchanging for Clean Architecture or Refactoring.',
  },
];

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
            // Check fallback demo books if not found in DB
            const fallback = fallbackDemoBooks.find((b) => b._id === id);
            if (fallback) {
              setBook(fallback);
            } else {
              setError('Book listing not found.');
            }
          }
        }
      } catch (err) {
        console.warn(`[BookDetailPage] Could not load book id ${id} from API:`, err.message);
        // Check fallback demo list
        const fallback = fallbackDemoBooks.find((b) => b._id === id);
        if (isMounted) {
          if (fallback) {
            setBook(fallback);
          } else {
            setError(err.message || 'Unable to load this book. Please try again.');
          }
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

  const listingType = book.listingType || book.type || 'Sell';
  const condition = book.condition || 'Good';
  const price = typeof book.price === 'number' ? book.price : 0;
  const location = book.locationCollege || book.location || 'Main Campus Library';
  const description = book.description || book.conditionNotes || 'No additional description provided.';
  const coverImage = book.image || (Array.isArray(book.images) && book.images[0] ? book.images[0] : '');

  const normalizedType = String(listingType).toLowerCase();
  const isBorrow = normalizedType.includes('borrow') || normalizedType.includes('lend');
  const isExchange = normalizedType.includes('exchange');
  const isOwner = user && (book.owner?._id === user._id || book.owner === user._id);

  const badgeVariant = isExchange ? 'exchange' : isBorrow ? 'borrow' : 'sell';

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/books" className="text-terracotta text-small">
            &larr; Back to Catalog
          </Link>
          <div style={{ marginTop: '0.75rem' }}>
            <Badge variant="terracotta">Module 2 • Book Volume Profile</Badge>
          </div>
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
            </div>

            <h1 style={{ marginTop: '0.25rem', marginBottom: '0.5rem', fontSize: '1.85rem' }}>
              {title}
            </h1>

            <p className="text-serif text-muted" style={{ fontStyle: 'italic', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
              by {author}
            </p>

            {listingType === 'Sell' && price > 0 && (
              <h2 className="text-terracotta" style={{ marginBottom: '1.25rem' }}>
                ₹{price}
              </h2>
            )}

            {isBorrow && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 className="text-terracotta" style={{ margin: 0 }}>
                  Available for Free Campus Borrowing
                </h3>
                <small className="text-muted">Standard lending period: up to {book.rentalPeriodDays || 14} days</small>
              </div>
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
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {isOwner ? (
                <Badge variant="terracotta" size="md">
                  ✓ This is your volume listing
                </Badge>
              ) : isBorrow ? (
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