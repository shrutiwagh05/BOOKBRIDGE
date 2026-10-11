import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './BookCard.css';

/**
 * Shared BookCard component for all modules
 * @param {Object} book - Book data object
 * @param {string} book.title - Title of the book
 * @param {string} book.author - Author name
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
  const navigate = useNavigate();

  if (!book) return null;

  const {
    _id,
    title = 'Untitled Book',
    author = 'Unknown Author',
    listingType = 'Sell',
    price = 0,
    condition = 'Good',
    category = 'General',
    image = '',
    locationCollege = '',
  } = book;

  const bookId = _id || book.id;
  const coverImage = image || (Array.isArray(book.images) && book.images[0] ? book.images[0] : '');

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onAction) {
      onAction(book);
    } else if (bookId) {
      navigate(`/books/${bookId}`);
    }
  };

  return (
    <div className={`bb-book-card ${className}`}>
      {/* Book Cover Area */}
      <div className="bb-book-card-cover">
        {coverImage ? (
          <img src={coverImage} alt={title} className="bb-book-cover-img" />
        ) : (
          <div className="bb-book-cover-placeholder">
            <span className="bb-book-spine-line"></span>
            <div className="bb-book-placeholder-inner">
              <span className="bb-book-placeholder-icon">📖</span>
              <span className="bb-book-placeholder-title">{title}</span>
            </div>
          </div>
        )}
        <div className="bb-book-card-badges">
          <Badge variant={listingType}>{listingType}</Badge>
          <Badge variant={condition}>{condition}</Badge>
        </div>
      </div>

      {/* Book Information */}
      <div className="bb-book-card-body">
        <span className="bb-book-category">{category}</span>
        <h3 className="bb-book-title" title={title}>
          <Link to={bookId ? `/books/${bookId}` : '#'}>{title}</Link>
        </h3>
        <p className="bb-book-author">by {author}</p>

        {locationCollege && (
          <p className="bb-book-location">
            <span>📍</span> {locationCollege}
          </p>
        )}

        {/* Pricing / Listing Type Details */}
        <div className="bb-book-card-footer">
          <div className="bb-book-price-block">
            {listingType === 'Sell' ? (
              <span className="bb-book-price">₹{price}</span>
            ) : listingType === 'Borrow' ? (
              <span className="bb-book-borrow-note">Lend / Borrow</span>
            ) : (
              <span className="bb-book-exchange-note">Exchange Offer</span>
            )}
          </div>

          <div className="bb-book-card-actions">
            <Button
              size="sm"
              variant={onAction ? 'outline' : 'primary'}
              onClick={handleActionClick}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
