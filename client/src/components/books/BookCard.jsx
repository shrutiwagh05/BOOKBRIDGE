
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './BookCard.css';

// Backend API URL
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : 'https://bookbridge-s1mx.onrender.com/api')
).replace(/\/+$/, '');

// Remove /api to get the backend server URL
const BACKEND_URL = API_BASE_URL.replace(/\/api$/i, '');

// Convert the saved book image path into a usable image URL
const getCoverImageUrl = (book) => {
  if (!book) return '';

  const imageFields = [
    book.image,
    book.imageUrl,
    book.coverImage,
    book.coverImageUrl,
    Array.isArray(book.images) ? book.images[0] : '',
  ];

  let image = imageFields.find((item) => item);

  // Support APIs that return an image object
  if (image && typeof image === 'object') {
    image = image.url || image.secure_url || image.path || '';
  }

  if (typeof image !== 'string' || !image.trim()) {
    return '';
  }

  image = image.trim();

  // Keep complete URLs and embedded image data unchanged
  if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:')) {
    return image.startsWith('//') ? `https:${image}` : image;
  }

  // Resolve API paths against the backend origin.
if (image.startsWith('/api/')) {
  return `${BACKEND_URL}${image}`;
}

// Convert legacy /uploads paths into backend image URLs.
const normalizedPath = image
  .replace(/\\/g, '/')
  .replace(/^\/+/, '');

return `${BACKEND_URL}/${normalizedPath}`;
};

const BookCard = ({
  book,
  onAction,
  actionLabel,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Calculate the image URL safely.
const coverImageUrl = getCoverImageUrl(book);

  // Reset the image fallback when the cover changes
  useEffect(() => {
    setImageError(false);
  }, [coverImageUrl]);

  // Do not render a card when book data is missing
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
            alt={`${title || 'Book'} cover`}
            className="bb-book-cover-img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="bb-book-cover-placeholder">
            <span className="bb-book-spine-line"></span>
            <span className="bb-book-placeholder-icon">📖</span>
            <span className="bb-book-placeholder-text">
              No Cover Image
            </span>
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
