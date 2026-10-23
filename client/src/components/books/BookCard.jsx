
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './BookCard.css';

/**
 * Shared BookCard component for all modules
 */
const BookCard = ({
  book,
  onAction,
  actionLabel,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  if (!book) {
    return null;
  }

  const {
    _id,
    title,
    author,
    price,
    condition,
    listingType,
    status,
    locationCollege,
    category,
  } = book;

  const bookId = _id || book.id;

  // Support different image fields returned by the backend.
  const rawCoverImage =
    book.image ||
    book.imageUrl ||
    book.coverImage ||
    book.coverImageUrl ||
    (Array.isArray(book.images) ? book.images[0] : '') ||
    '';

  // Resolve uploaded image paths to the backend server.
  const apiBaseUrl = (
    import.meta.env.VITE_API_URL ||
    'https://bookbridge-s1mx.onrender.com/api'
  ).replace(/\/+$/, '');

  const backendUrl = apiBaseUrl.replace(/\/api$/, '');

  const coverImageUrl =
    typeof rawCoverImage === 'string' && rawCoverImage.trim()
      ? rawCoverImage.startsWith('/uploads/')
        ? `${backendUrl}${rawCoverImage}`
        : rawCoverImage.startsWith('uploads/')
          ? `${backendUrl}/${rawCoverImage}`
          : rawCoverImage
      : '';

  const handleActionClick = (event) => {
    event.stopPropagation();

    if (onAction) {
      onAction(book);
    }
  };

  const handleCardClick = () => {
    if (bookId) {
      navigate('/books/' + bookId);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleCardClick();
    }
  };

  return (
    <div
      className="bb-book-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="bb-book-card-cover">
        {coverImageUrl && !imageError ? (
          <img
            src={coverImageUrl}
            alt={title || 'Book cover'}
            className="bb-book-cover-img"
            onError={() => setImageError(true)}
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
          {listingType && (
            <Badge variant="primary">
              {listingType}
            </Badge>
          )}

          {status && status !== 'available' && (
            <Badge variant="secondary">
              {status}
            </Badge>
          )}
        </div>
      </div>

      <div className="bb-book-card-content">
        <div className="bb-book-card-header">
          <h3 className="bb-book-card-title">
            {title || 'Untitled Book'}
          </h3>

          <p className="bb-book-card-author">
            by {author || 'Unknown Author'}
          </p>
        </div>

        <div className="bb-book-card-details">
          {category && (
            <span className="bb-book-card-category">
              {category}
            </span>
          )}

          {condition && (
            <span className="bb-book-card-condition">
              {condition}
            </span>
          )}
        </div>

        {locationCollege && (
          <div className="bb-book-card-location">
            <span>📍</span>
            <span>{locationCollege}</span>
          </div>
        )}

        <div className="bb-book-card-footer">
          <div className="bb-book-card-price">
            {price !== undefined &&
            price !== null &&
            price !== '' ? (
              <span>₹{price}</span>
            ) : (
              <span>Contact for price</span>
            )}
          </div>

          {showActions && (
            <div className="bb-book-card-actions">
              {onAction ? (
                <Button
                  onClick={handleActionClick}
                  variant="primary"
                  size="small"
                >
                  {actionLabel || 'View Details'}
                </Button>
              ) : (
                <Link
                  to={'/books/' + bookId}
                  onClick={(event) => event.stopPropagation()}
                  className="bb-book-card-view-link"
                >
                  View Details
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
