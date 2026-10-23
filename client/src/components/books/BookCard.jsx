import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './BookCard.css';

/**
 * Shared BookCard component for all modules
 * @param {Object} book - Book data object
 * @param {string} book.title - Title of the book
 * @param {string} book.author - Author name
 * @param {string} book.isbn - ISBN of the book
 * @param {string} book.listingType - 'Sell' | 'Borrow' | 'Exchange'
 * @param {number} book.price - Selling or deposit price
 * @param {string} book.condition - 'New' | 'Like New' | 'Good' | 'Fair'
 * @param {string} book.category - Book category
 * @param {string} book.image - Cover image URL
 * @param {string} book._id - Book ID for navigation
 * @param {function} onAction - Optional custom button action
 * @param {string} actionLabel - Label for the action button
 */
const BookCard = ({
  book,
  onAction,
  actionLabel = 'View Details',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  if (!book) return null;

  const {
    _id,
    id,
    title = 'Untitled Book',
    author = 'Unknown Author',
    isbn = '',
    listingType = 'Sell',
    price = 0,
    condition = 'Good',
    category = 'General',
    image = '',
    locationCollege = '',
  } = book;

  const bookId = _id || id;
  const rawImagePath = image || (Array.isArray(book.images) && book.images[0] ? book.images[0] : '');

  // Resolve uploaded images (/uploads/...) to the backend origin
  const getCoverImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    if (path.startsWith('/uploads/')) {
      const apiBaseUrl =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? '' : 'https://bookbridge-s1mx.onrender.com');
      const backendUrl = apiBaseUrl.replace(/\/api\/?$/, '');
      return `${backendUrl}${path}`;
    }
    return path;
  };

  const coverImageUrl = getCoverImageUrl(rawImagePath);

  return (
    <div className={`bb-book-card ${className}`}>
      {/* Book Cover Area */}
      <div className="bb-book-card-cover">
        {coverImageUrl && !imageError ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="bb-book-cover-img"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="bb-book-cover-placeholder">
            <span className="bb-book-spine-line"></span>
            <div className="bb-book-placeholder-inner">
              <span className="bb-book-placeholder-icon">📖</span>
              <span className="bb-book-placeholder-title">
                {title}
              </span>
            </div>
          </div>
        )}

        <div className="bb-book-card-badges">
          <Badge variant={listingType}>
            {listingType}
          </Badge>

          <Badge variant={condition}>
            {condition}
          </Badge>
        </div>
      </div>

      {/* Book Information */}
      <div className="bb-book-card-body">
        <span className="bb-book-category">
          {category}
        </span>

        <h3
          className="bb-book-title"
          title={title}
        >
          <Link to={`/books/${bookId || 'preview'}`}>
            {title}
          </Link>
        </h3>

        <p className="bb-book-author">
          by {author}
        </p>

        {isbn && (
          <p className="bb-book-isbn">
            <strong>ISBN:</strong> {isbn}
          </p>
        )}

        {locationCollege && (
          <p className="bb-book-location">
            <span>📍</span> {locationCollege}
          </p>
        )}

        {/* Pricing / Listing Type Details */}
        <div className="bb-book-card-footer">
          <div className="bb-book-price-block">
            {listingType === 'Sell' ? (
              <span className="bb-book-price">
                ₹{price}
              </span>
            ) : listingType === 'Borrow' ? (
              <span className="bb-book-borrow-note">
                Lend / Borrow
              </span>
            ) : (
              <span className="bb-book-exchange-note">
                Exchange Offer
              </span>
            )}
          </div>

          <div className="bb-book-card-actions">
            {onAction ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction(book)}
              >
                {actionLabel}
              </Button>
            ) : (
              <Link to={`/books/${bookId || 'preview'}`}>
                <Button size="sm" variant="primary">
                  {actionLabel}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
