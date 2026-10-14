```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './BookCard.css';

/**
 * Shared BookCard component for all modules
 */
const BookCard = ({
  book,
  onAction,
  actionLabel = 'View Details',
  className = '',
}) => {
  if (!book) return null;

  const {
    _id,
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

  const coverImage = image || book.images?.[0] || '';

  return (
    <div className={`bb-book-card ${className}`}>
      {/* Book Cover Area */}
      <div className="bb-book-card-cover">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="bb-book-cover-img"
          />
        ) : (
          <div className="bb-book-cover-placeholder">
            <span className="bb-book-spine-line"></span>

            <div className="bb-book-placeholder-inner">
              <span className="bb-book-placeholder-icon">
                📖
              </span>

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
          <Link to={`/books/${_id || 'preview'}`}>
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
              <Link to={`/books/${_id || 'preview'}`}>
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
```
