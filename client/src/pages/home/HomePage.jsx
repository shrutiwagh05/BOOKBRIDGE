import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import './HomePages.css';

const sampleBooks = [
  {
    _id: 'sample-1',
    title: 'Introduction to Algorithms (CLRS)',
    author: 'Thomas H. Cormen, Charles E. Leiserson',
    category: 'Computer Science & IT',
    listingType: 'Borrow',
    price: 0,
    condition: 'Like New',
    locationCollege: 'Main Campus Library Desk',
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
  },
];

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleCardClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  return (
    <div className="bb-home-page container">
      {/* Hero Section */}
      <section className="bb-hero-section">
        <div className="bb-hero-badge">
          <Badge variant="terracotta">Module 1 • Home & Discovery Foundation</Badge>
        </div>
        <h1 className="bb-hero-title">
          Where College Books Find <span className="bb-highlight">Their Next Reader</span>
        </h1>
        <p className="bb-hero-lead lead">
          Welcome to the BookBridge central foundation. Browse second-hand college textbooks,
          lend notes to batchmates, and exchange knowledge without textbook debt.
        </p>
        <div className="bb-hero-actions">
          <Link to="/books">
            <Button size="lg" variant="primary">
              Explore Library Catalog
            </Button>
          </Link>
          <Link to="/books/add">
            <Button size="lg" variant="outline">
              Offer a Book
            </Button>
          </Link>
        </div>
      </section>

      {/* Module Architecture Roadmap Banner */}
      <section className="bb-foundation-status paper-card">
        <div className="flex-between">
          <div>
            <h3>🏛️ 5-Module Team Collaboration Map</h3>
            <p className="text-small text-muted">
              Shared foundation is established. Each developer can build inside their respective module directory.
            </p>
          </div>
          <Badge variant="success" size="md">Foundation Ready</Badge>
        </div>

        <div className="bb-modules-grid">
          <div className="bb-module-pill">
            <strong>Module 1</strong>
            <span>Home & Discovery</span>
            <small className="text-muted">src/pages/home/</small>
          </div>
          <div className="bb-module-pill">
            <strong>Module 2</strong>
            <span>Book Listing & Details</span>
            <small className="text-muted">src/pages/books/</small>
          </div>
          <div className="bb-module-pill">
            <strong>Module 3</strong>
            <span>Borrow, Lend & Exchange</span>
            <small className="text-muted">src/pages/exchange/</small>
          </div>
          <div className="bb-module-pill">
            <strong>Module 4</strong>
            <span>User Account & Dashboard</span>
            <small className="text-muted">src/pages/dashboard/</small>
          </div>
          <div className="bb-module-pill">
            <strong>Module 5</strong>
            <span>Admin & Notifications</span>
            <small className="text-muted">src/pages/admin/</small>
          </div>
        </div>
      </section>

      {/* Showcase of Shared Components */}
      <section className="bb-showcase-section">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2>Featured Volumes (Theme Showcase)</h2>
            <p className="text-muted">
              Live sample of the shared <code>BookCard</code>, <code>Badge</code>, and "Paper & Ink" aesthetics.
            </p>
          </div>
          <Link to="/discover">
            <Button variant="ghost">Browse All &rarr;</Button>
          </Link>
        </div>

        <div className="grid-3">
          {sampleBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              actionLabel="Quick Preview"
              onAction={handleCardClick}
            />
          ))}
        </div>
      </section>

      {/* Interactive Modal Preview Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBook?.title || 'Book Details'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Link to={`/books/${selectedBook?._id}`}>
              <Button variant="primary">Full Details Page</Button>
            </Link>
          </>
        }
      >
        {selectedBook && (
          <div>
            <p><strong>Author:</strong> {selectedBook.author}</p>
            <p><strong>Category:</strong> {selectedBook.category}</p>
            <p><strong>Type:</strong> <Badge variant={selectedBook.listingType}>{selectedBook.listingType}</Badge></p>
            <p><strong>Condition:</strong> <Badge variant={selectedBook.condition}>{selectedBook.condition}</Badge></p>
            <p><strong>Campus Location:</strong> {selectedBook.locationCollege}</p>
            <p className="text-muted text-small" style={{ marginTop: '1rem' }}>
              This dialog demonstrates the shared <code>Modal</code> component. Developer 2 and 3 can integrate this for fast requests and confirmations.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
