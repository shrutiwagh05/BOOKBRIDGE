import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorAlert from '../../components/common/ErrorAlert';
import bookService from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import './HomePages.css';

/* ─── Static Data ─────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Computer Science & IT',  icon: '💻', slug: 'Computer Science & IT' },
  { label: 'Engineering',             icon: '⚙️',  slug: 'Engineering' },
  { label: 'Business & Economics',    icon: '📊', slug: 'Business & Economics' },
  { label: 'Medical & Science',       icon: '🔬', slug: 'Medical & Science' },
  { label: 'Literature & Fiction',    icon: '📖', slug: 'Literature & Fiction' },
  { label: 'Humanities & Arts',       icon: '🎨', slug: 'Humanities & Arts' },
  { label: 'Competitive Exams',       icon: '🏆', slug: 'Competitive Exams' },
  { label: 'Other',                   icon: '📚', slug: 'Other' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '📋',
    title: 'List Your Book',
    desc: 'Add your pre-loved textbook in 2 minutes — set it as Sell, Borrow, or Exchange.',
  },
  {
    step: '02',
    icon: '🔍',
    title: 'Discover & Search',
    desc: 'Search by title, author, or category. Filter by condition and campus location.',
  },
  {
    step: '03',
    icon: '🤝',
    title: 'Connect & Trade',
    desc: 'Send a borrow request or exchange proposal directly to your fellow student.',
  },
  {
    step: '04',
    icon: '♻️',
    title: 'Keep Books Alive',
    desc: 'Every exchange reduces waste. Build a campus reading culture together.',
  },
];

const SUSTAINABILITY_STATS = [
  { value: '500+', label: 'Books Circulated', icon: '📚' },
  { value: '₹2L+', label: 'Student Savings',  icon: '💰' },
  { value: '300+', label: 'Students Connected', icon: '🎓' },
  { value: '0',    label: 'Books Wasted',      icon: '♻️' },
];

/* ─── Component ───────────────────────────────────────────────── */
const HomePage = () => {
  const navigate   = useNavigate();
  const { isAuthenticated } = useAuth();

  const [heroSearch,     setHeroSearch]     = useState('');
  const [featuredBooks,  setFeaturedBooks]  = useState([]);
  const [recentBooks,    setRecentBooks]    = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRecent,   setLoadingRecent]   = useState(true);
  const [featuredError,  setFeaturedError]  = useState('');
  const [recentError,    setRecentError]    = useState('');

  /* Fetch featured books (Borrow + Exchange, limit 6) */
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const res = await bookService.getBooks({ limit: 6, sort: 'newest' });
        setFeaturedBooks(res.data || []);
      } catch {
        setFeaturedError('Could not load featured books right now.');
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  /* Fetch recently added (newest 4, any type) */
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoadingRecent(true);
        const res = await bookService.getBooks({ limit: 4, sort: 'newest' });
        setRecentBooks(res.data || []);
      } catch {
        setRecentError('Could not load recent books right now.');
      } finally {
        setLoadingRecent(false);
      }
    };
    fetchRecent();
  }, []);

  /* Hero search submit */
  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/discover?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="bb-home-page">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bb-hero-section">
        <div className="bb-hero-inner container">
          <div className="bb-hero-text">
            <Badge variant="terracotta">Campus Book Marketplace</Badge>
            <h1 className="bb-hero-title">
              Where College Books Find{' '}
              <span className="bb-highlight">Their Next Reader</span>
            </h1>
            <p className="bb-hero-lead lead">
              Buy, sell, borrow, lend and exchange pre-loved textbooks with
              students across your campus. No middlemen — just knowledge
              flowing freely.
            </p>
            <div className="bb-hero-actions">
              <Link to="/discover">
                <Button size="lg" variant="primary">Explore Library Catalog</Button>
              </Link>
              <Link to="/books/add">
                <Button size="lg" variant="outline">
                  {isAuthenticated ? 'List a Book' : 'Offer a Book'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Search Bar */}
          <form className="bb-hero-search-form" onSubmit={handleHeroSearch}>
            <div className="bb-hero-search-box">
              <span className="bb-hero-search-icon">🔍</span>
              <input
                type="text"
                className="bb-hero-search-input"
                placeholder="Search by title, author, or subject…"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                aria-label="Search books"
              />
              <button type="submit" className="bb-hero-search-btn">
                Search
              </button>
            </div>
            <div className="bb-hero-search-hints">
              <span>Popular:</span>
              {['CLRS Algorithms', 'Engineering Physics', 'Mankiw Economics'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className="bb-search-hint-tag"
                  onClick={() => {
                    setHeroSearch(t);
                    navigate(`/discover?search=${encodeURIComponent(t)}`);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Decorative shelf rule */}
        <div className="bb-hero-shelf-rule" aria-hidden="true">
          <span>📖</span><span>📕</span><span>📗</span><span>📘</span>
          <span>📙</span><span>📚</span><span>📖</span><span>📕</span>
        </div>
      </section>

      {/* ── SUSTAINABILITY STATS ──────────────────────────────── */}
      <section className="bb-stats-strip">
        <div className="container">
          <div className="bb-stats-grid">
            {SUSTAINABILITY_STATS.map((s) => (
              <div key={s.label} className="bb-stat-card">
                <span className="bb-stat-icon">{s.icon}</span>
                <span className="bb-stat-value">{s.value}</span>
                <span className="bb-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED BOOKS ────────────────────────────────────── */}
      <section className="bb-section container">
        <div className="bb-section-header flex-between">
          <div>
            <h6>From the Shelves</h6>
            <h2>Featured Volumes</h2>
            <p className="text-muted">
              Hand-picked listings available on campus right now.
            </p>
          </div>
          <Link to="/discover">
            <Button variant="ghost">Browse All →</Button>
          </Link>
        </div>

        {featuredError && (
          <ErrorAlert type="warning" message={featuredError} onClose={() => setFeaturedError('')} />
        )}

        {loadingFeatured ? (
          <Loader text="Gathering featured volumes…" />
        ) : featuredBooks.length === 0 ? (
          <div className="bb-empty-shelf paper-card">
            <span className="bb-empty-shelf-icon">📭</span>
            <p className="text-muted">
              No books listed yet.{' '}
              <Link to="/books/add" className="text-terracotta">Be the first to list one!</Link>
            </p>
          </div>
        ) : (
          <div className="grid-3">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} actionLabel="View Details" />
            ))}
          </div>
        )}
      </section>

      {/* ── POPULAR CATEGORIES ────────────────────────────────── */}
      <section className="bb-section bb-categories-section">
        <div className="container">
          <div className="bb-section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h6>Browse by Subject</h6>
            <h2>Popular Categories</h2>
            <p className="text-muted">
              Dive straight into the discipline you need.
            </p>
          </div>
          <div className="bb-categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/discover?category=${encodeURIComponent(cat.slug)}`}
                className="bb-category-card"
              >
                <span className="bb-category-icon">{cat.icon}</span>
                <span className="bb-category-label">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENTLY ADDED ────────────────────────────────────── */}
      <section className="bb-section container">
        <div className="bb-section-header flex-between">
          <div>
            <h6>Fresh Arrivals</h6>
            <h2>Recently Added</h2>
            <p className="text-muted">
              Books listed by students in the past few days.
            </p>
          </div>
          <Link to="/discover?sort=newest">
            <Button variant="ghost">See All New →</Button>
          </Link>
        </div>

        {recentError && (
          <ErrorAlert type="warning" message={recentError} onClose={() => setRecentError('')} />
        )}

        {loadingRecent ? (
          <Loader text="Loading fresh arrivals…" />
        ) : recentBooks.length === 0 ? (
          <div className="bb-empty-shelf paper-card">
            <span className="bb-empty-shelf-icon">🕊️</span>
            <p className="text-muted">
              No recent listings.{' '}
              <Link to="/books/add" className="text-terracotta">Add yours now!</Link>
            </p>
          </div>
        ) : (
          <div className="grid-4">
            {recentBooks.map((book) => (
              <BookCard key={book._id} book={book} actionLabel="View Details" />
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bb-section bb-how-section">
        <div className="container">
          <div className="bb-section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h6>The Process</h6>
            <h2>How BookBridge Works</h2>
            <p className="text-muted">
              Four simple steps to keep campus knowledge in motion.
            </p>
          </div>
          <div className="bb-how-grid">
            {HOW_IT_WORKS.map((step, idx) => (
              <div key={step.step} className="bb-how-card paper-card">
                <div className="bb-how-step-num">{step.step}</div>
                <div className="bb-how-icon">{step.icon}</div>
                <h4 className="bb-how-title">{step.title}</h4>
                <p className="text-small text-muted">{step.desc}</p>
                {idx < HOW_IT_WORKS.length - 1 && (
                  <span className="bb-how-connector" aria-hidden="true">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BORROW / LEND / EXCHANGE INTRO ────────────────────── */}
      <section className="bb-section container">
        <div className="bb-exchange-intro paper-card">
          <div className="bb-exchange-intro-content">
            <Badge variant="terracotta">Zero Cost Transactions</Badge>
            <h2 style={{ marginTop: '0.75rem' }}>
              Borrow, Lend & Exchange — <span className="bb-highlight">Free</span>
            </h2>
            <p className="lead">
              Not every student can afford every textbook. BookBridge's peer
              lending system lets you borrow books for exam season and return
              them after. Propose a direct exchange — trade your finished
              semester's books for next semester's ones.
            </p>
            <div className="bb-exchange-intro-features">
              <div className="bb-exchange-feature">
                <span>🤝</span>
                <div>
                  <strong>Borrow</strong>
                  <p className="text-small text-muted">Request any book for up to 30 days.</p>
                </div>
              </div>
              <div className="bb-exchange-feature">
                <span>📦</span>
                <div>
                  <strong>Lend</strong>
                  <p className="text-small text-muted">List your idle books for juniors to use.</p>
                </div>
              </div>
              <div className="bb-exchange-feature">
                <span>🔄</span>
                <div>
                  <strong>Exchange</strong>
                  <p className="text-small text-muted">Trade book-for-book with a classmate.</p>
                </div>
              </div>
            </div>
            <div className="bb-exchange-intro-actions">
              <Link to="/exchange">
                <Button variant="primary">Explore Exchange Hub</Button>
              </Link>
              <Link to="/books/add">
                <Button variant="outline">Lend a Book to Campus</Button>
              </Link>
            </div>
          </div>
          <div className="bb-exchange-intro-visual" aria-hidden="true">
            <div className="bb-exchange-book-stack">
              <span>📗</span><span>📘</span><span>📕</span>
            </div>
            <div className="bb-exchange-arrows">⇄</div>
            <div className="bb-exchange-book-stack">
              <span>📙</span><span>📖</span><span>📚</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUSTAINABILITY ────────────────────────────────────── */}
      <section className="bb-section bb-sustainability-section">
        <div className="container">
          <div className="bb-sustainability-inner">
            <div className="bb-sustainability-text">
              <h6>Why It Matters</h6>
              <h2>Every Reused Book is a Win for the Planet</h2>
              <p className="lead">
                Printing a single textbook uses approximately 8–10 kg of CO₂.
                When students share and reuse books, the environmental and
                financial savings multiply across every semester.
              </p>
              <ul className="bb-sustainability-list">
                <li>♻️ Reduce academic paper waste on campus</li>
                <li>💸 Save up to ₹5,000+ per semester on textbooks</li>
                <li>🌱 Build a culture of sustainable learning</li>
                <li>🤝 Support fellow students who need affordable access</li>
              </ul>
              <Link to="/discover">
                <Button variant="primary">Start Exploring</Button>
              </Link>
            </div>
            <div className="bb-sustainability-visual">
              <div className="bb-eco-badge">
                <span className="bb-eco-icon">🌿</span>
                <p className="bb-eco-label">Campus<br />Eco Library</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="bb-section bb-cta-section">
        <div className="container">
          <div className="bb-cta-card">
            <h2>Ready to Join the BookBridge Library?</h2>
            <p className="lead">
              Thousands of textbooks. Zero middlemen. One student community.
            </p>
            <div className="bb-cta-actions">
              <Link to="/discover">
                <Button size="lg" variant="primary">Browse All Books</Button>
              </Link>
              <Link to={isAuthenticated ? '/books/add' : '/register'}>
                <Button size="lg" variant="outline">
                  {isAuthenticated ? 'List a Book' : 'Join BookBridge Free'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
