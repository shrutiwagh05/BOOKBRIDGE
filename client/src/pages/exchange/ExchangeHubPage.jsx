import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookService from '../../services/bookService';
import userService from '../../services/userService';
import exchangeService from '../../services/exchangeService';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import './ExchangeHub.css';

// Fallback campus books for demo if database has no entries yet
const fallbackCampusBooks = [
  {
    _id: 'demo-b-1',
    title: 'Operating System Concepts (10th Edition)',
    author: 'Abraham Silberschatz, Peter B. Galvin',
    category: 'Computer Science & IT',
    listingType: 'Borrow',
    rentalPeriodDays: 14,
    condition: 'Good',
    locationCollege: 'Department of Computing',
    status: 'available',
    description: 'Silberschatz OS concepts dinosaur book. All chapters intact, clean margins.',
    owner: { _id: 'owner-101', name: 'Aarav Sharma', college: 'Campus Library Desk' },
  },
  {
    _id: 'demo-b-2',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    category: 'Computer Science & IT',
    listingType: 'Exchange',
    condition: 'Like New',
    locationCollege: 'Boys Hostel Wing B',
    status: 'available',
    description: 'Gang of Four design patterns reference. Looking to exchange for Database System Concepts.',
    exchangePreferences: 'Database Systems or Microprocessors',
    owner: { _id: 'owner-102', name: 'Priya Patel', college: 'CS Dept Block' },
  },
  {
    _id: 'demo-b-3',
    title: 'Campbell Biology (12th Edition)',
    author: 'Lisa A. Urry, Michael L. Cain',
    category: 'Medical & Science',
    listingType: 'Borrow',
    rentalPeriodDays: 21,
    condition: 'Like New',
    locationCollege: 'Life Sciences Hall',
    status: 'available',
    description: 'Heavy hardcover. Willing to lend for 3 weeks for mid-term preparations.',
    owner: { _id: 'owner-103', name: 'Rohan Deshmukh', college: 'Bio Labs' },
  },
  {
    _id: 'demo-b-4',
    title: 'Economics (Principles & Applications)',
    author: 'N. Gregory Mankiw',
    category: 'Business & Economics',
    listingType: 'Exchange',
    condition: 'Good',
    locationCollege: 'Management Wing',
    status: 'available',
    description: 'Core micro/macro concepts. Open to exchanging for Corporate Finance.',
    exchangePreferences: 'Corporate Finance or Accounting Principles',
    owner: { _id: 'owner-104', name: 'Neha Joshi', college: 'Commerce Library' },
  },
];

const ExchangeHubPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [books, setBooks] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userBooksLoading, setUserBooksLoading] = useState(false);

  // Filter states
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'borrow' | 'exchange'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Request modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetBook, setTargetBook] = useState(null);
  const [requestType, setRequestType] = useState('borrow'); // 'borrow' | 'exchange'
  const [durationDays, setDurationDays] = useState(14);
  const [offeredBookId, setOfferedBookId] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successFeedback, setSuccessFeedback] = useState('');

  // Fetch available books for interaction
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await bookService.getBooks();
        if (res.data && res.data.length > 0) {
          // Filter to books meant for Borrow or Exchange that are currently available
          const exchangeable = res.data.filter(
            (b) => (b.listingType === 'Borrow' || b.listingType === 'Exchange') && b.status === 'available'
          );
          setBooks(exchangeable.length > 0 ? exchangeable : fallbackCampusBooks);
        } else {
          setBooks(fallbackCampusBooks);
        }
      } catch (err) {
        console.info('[ExchangeHub] Using campus fallback dataset');
        setBooks(fallbackCampusBooks);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  // Fetch logged-in user's shelf to populate offered books for barter
  useEffect(() => {
    const fetchUserShelf = async () => {
      if (isAuthenticated) {
        try {
          setUserBooksLoading(true);
          const res = await userService.getProfile();
          if (res.data?.myListings) {
            setUserBooks(res.data.myListings.filter((b) => b.status === 'available'));
          }
        } catch (err) {
          console.warn('[ExchangeHub] Could not load user listings');
        } finally {
          setUserBooksLoading(false);
        }
      }
    };

    fetchUserShelf();
  }, [isAuthenticated]);

  // Handle open request modal
  const handleInitiateRequest = (book) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/exchange' } } });
      return;
    }

    setTargetBook(book);
    setRequestType(book.listingType === 'Exchange' ? 'exchange' : 'borrow');
    setDurationDays(book.rentalPeriodDays || 14);
    setOfferedBookId(userBooks.length > 0 ? userBooks[0]._id : '');
    setRequestMessage('');
    setAgreeTerms(false);
    setModalError('');
    setSuccessFeedback('');
    setIsModalOpen(true);
  };

  // Submit borrow / exchange request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!targetBook) return;

    if (!agreeTerms) {
      setModalError('Please accept the campus honor code terms before proceeding.');
      return;
    }

    if (requestType === 'exchange' && !offeredBookId && userBooks.length > 0) {
      setModalError('Please select one of your listed books to offer in trade.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError('');

      const payload = {
        bookId: targetBook._id,
        ownerId: targetBook.owner?._id || targetBook.owner,
        type: requestType,
        durationDays: requestType === 'borrow' ? Number(durationDays) : undefined,
        offeredBookId: requestType === 'exchange' ? offeredBookId : undefined,
        message: requestMessage,
      };

      await exchangeService.createRequest(payload);
      setSuccessFeedback(
        `${requestType === 'exchange' ? 'Exchange proposal' : 'Borrow request'} successfully dispatched to ${targetBook.owner?.name || 'the book owner'}!`
      );

      // Clean up after small delay
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/exchange/requests');
      }, 1500);
    } catch (err) {
      setModalError(err.message || 'Unable to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter book list based on active tab and search
  const filteredBooks = books.filter((book) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'borrow'
        ? book.listingType === 'Borrow'
        : book.listingType === 'Exchange';

    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.locationCollege && book.locationCollege.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter ? book.category === categoryFilter : true;

    return matchesTab && matchesSearch && matchesCategory;
  });

  return (
    <div className="bb-exchange-hub container">
      {/* Hero Header */}
      <section className="bb-exchange-hero paper-card">
        <div className="bb-exchange-hero-content">
          <Badge variant="terracotta">Module 3 • Campus Peer Lending & Barter</Badge>
          <h1 className="bb-exchange-hero-title">Borrow, Lend & Exchange Volumes</h1>
          <p className="lead bb-exchange-hero-desc">
            Circulate textbooks without spending a rupee. Borrow syllabus readings for exam season,
            lend idle volumes to juniors, or exchange a finished book for your next read.
          </p>

          <div className="bb-exchange-hero-actions">
            <Link to="/exchange/requests">
              <Button variant="primary">
                📬 View My Requests & Loans
              </Button>
            </Link>
            <Link to="/books/add">
              <Button variant="outline">
                📦 Lend a Book to Campus
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* User's Available Books Bar (If logged in) */}
      {isAuthenticated && (
        <section className="bb-user-shelf-bar paper-card">
          <div className="flex-between">
            <div className="bb-user-shelf-info">
              <span className="bb-shelf-icon">📚</span>
              <div>
                <h4 style={{ margin: 0 }}>Your Active Campus Shelf</h4>
                <p className="text-small text-muted" style={{ margin: 0 }}>
                  You currently have <strong>{userBooks.length}</strong> available volume(s) on offer for peer lending or barter.
                </p>
              </div>
            </div>
            <Link to="/books/add">
              <Button size="sm" variant="secondary">
                + Offer Another Book
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Action Selector: Borrow vs Lend vs Exchange */}
      <section className="bb-action-tabs-section">
        <div className="bb-action-tabs">
          <button
            type="button"
            className={`bb-action-tab ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span>📖</span>
            <strong>All Circulating Volumes</strong>
          </button>
          <button
            type="button"
            className={`bb-action-tab ${activeTab === 'borrow' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('borrow')}
          >
            <span>🤝</span>
            <strong>Borrow from Peers</strong>
            <small>Temporary study loans</small>
          </button>
          <button
            type="button"
            className={`bb-action-tab ${activeTab === 'exchange' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('exchange')}
          >
            <span>🔄</span>
            <strong>Barter & Direct Exchange</strong>
            <small>Trade volume for volume</small>
          </button>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bb-exchange-filter-bar paper-card">
        <div className="grid-3" style={{ alignItems: 'end' }}>
          <Input
            label="Search Catalog"
            placeholder="Search by title, author, or campus spot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Input
            label="Filter by Discipline"
            type="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Disciplines' },
              { value: 'Computer Science & IT', label: 'Computer Science & IT' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Business & Economics', label: 'Business & Economics' },
              { value: 'Medical & Science', label: 'Medical & Science' },
              { value: 'Literature & Fiction', label: 'Literature & Fiction' },
              { value: 'Humanities & Arts', label: 'Humanities & Arts' },
              { value: 'Competitive Exams', label: 'Competitive Exams' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setActiveTab('all');
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </section>

      {/* Available Books Grid */}
      <section className="bb-exchange-catalog">
        <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h3>Available for Immediate Request ({filteredBooks.length})</h3>
            <p className="text-small text-muted">
              Select a book below to initiate a peer borrow or propose an exchange.
            </p>
          </div>
          <Link to="/exchange/requests" className="text-small text-terracotta">
            Manage Incoming & Outgoing Requests &rarr;
          </Link>
        </div>

        {loading ? (
          <Loader text="Gathering peer circulating archives..." />
        ) : filteredBooks.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No Matching Circulating Books"
            description="No student has listed books matching your current search or tab filters. Try adjusting your search or offer your own book to begin!"
            actionLabel="Reset Search Filters"
            onAction={() => {
              setSearchQuery('');
              setCategoryFilter('');
              setActiveTab('all');
            }}
          />
        ) : (
          <div className="grid-3">
            {filteredBooks.map((book) => {
              const isOwner = user && (book.owner?._id === user._id || book.owner === user._id);
              const isBorrow = book.listingType === 'Borrow';

              return (
                <div key={book._id} className="bb-exchange-card-wrapper">
                  <BookCard
                    book={book}
                    actionLabel={
                      isOwner
                        ? 'Your Volume'
                        : isBorrow
                        ? 'Request to Borrow'
                        : 'Propose Exchange'
                    }
                    onAction={isOwner ? null : handleInitiateRequest}
                  />
                  {isOwner && (
                    <div className="bb-card-owner-banner">
                      <span>✓ Listed by You</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Confirmation & Submission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title={
          requestType === 'exchange'
            ? `Propose Book Exchange: "${targetBook?.title}"`
            : `Borrow Request: "${targetBook?.title}"`
        }
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={submitting}
              disabled={submitting || !agreeTerms}
              onClick={handleSubmitRequest}
            >
              {requestType === 'exchange' ? 'Send Exchange Proposal' : 'Confirm Borrow Request'}
            </Button>
          </>
        }
      >
        {targetBook && (
          <form onSubmit={handleSubmitRequest} className="bb-request-modal-body">
            <ErrorAlert message={modalError} onClose={() => setModalError('')} />
            {successFeedback && (
              <div className="bb-alert bb-alert--success" style={{ marginBottom: '1rem' }}>
                {successFeedback}
              </div>
            )}

            {/* Target Book Info Card */}
            <div className="bb-target-book-summary">
              <div className="bb-summary-details">
                <span className="bb-summary-label">Target Volume</span>
                <h4 style={{ margin: '2px 0' }}>{targetBook.title}</h4>
                <p className="text-small text-muted" style={{ margin: 0 }}>
                  by {targetBook.author} • Condition: <Badge variant={targetBook.condition}>{targetBook.condition}</Badge>
                </p>
                <p className="text-small" style={{ margin: '4px 0 0 0' }}>
                  <strong>Lender:</strong> {targetBook.owner?.name || 'Fellow Student'} {targetBook.locationCollege && `(${targetBook.locationCollege})`}
                </p>
              </div>
            </div>

            {/* Borrow Specific Options */}
            {requestType === 'borrow' ? (
              <div style={{ marginTop: '1rem' }}>
                <Input
                  label="Loan Duration"
                  type="select"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  options={[
                    { value: 7, label: '7 Days (Quick Exam Preparation)' },
                    { value: 14, label: '14 Days (Standard Campus Loan - Recommended)' },
                    { value: 21, label: '21 Days (3 Weeks)' },
                    { value: 30, label: '30 Days (Full Month Study)' },
                  ]}
                  helperText="You will be expected to return this volume to the owner on or before the due date."
                />
              </div>
            ) : (
              /* Exchange Specific Options */
              <div style={{ marginTop: '1rem' }}>
                {userBooks.length > 0 ? (
                  <Input
                    label="Select Your Volume to Offer in Trade"
                    type="select"
                    value={offeredBookId}
                    onChange={(e) => setOfferedBookId(e.target.value)}
                    options={userBooks.map((b) => ({
                      value: b._id,
                      label: `${b.title} (${b.condition})`,
                    }))}
                    helperText="The owner will review your offered title before accepting the barter."
                    required
                  />
                ) : (
                  <div className="bb-no-books-warning">
                    <p className="text-small" style={{ margin: 0 }}>
                      ⚠️ <strong>No volumes currently on your shelf:</strong> You don't have any available books listed to offer for a barter exchange. You can still write a proposal message, or <Link to="/books/add" target="_blank" className="text-terracotta">list a book first</Link>.
                    </p>
                  </div>
                )}

                {targetBook.exchangePreferences && (
                  <div className="bb-exchange-pref-note">
                    <span className="text-small">
                      <strong>Owner's Wishlist:</strong> "{targetBook.exchangePreferences}"
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Note/Message Input */}
            <Input
              label="Message to Owner (Meeting Spot & Contact Info)"
              type="textarea"
              name="message"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="e.g. Hi! I'm in Computer Science sem 5. Can we meet near the library ground floor to hand over the book?"
              rows={3}
            />

            {/* Campus Honor Code Checkbox */}
            <div className="bb-honor-code-box">
              <label className="bb-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <span className="text-small">
                  <strong>Campus Honor Pledge:</strong> I commit to keeping this book in clean condition, avoiding highlighter markings, and coordinating with the owner for a safe and timely handover.
                </span>
              </label>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ExchangeHubPage;
