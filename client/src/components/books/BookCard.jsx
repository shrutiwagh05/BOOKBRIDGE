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

  // Resolve API paths against the backend origin
  if (image.startsWith('/api/')) {
    return `${BACKEND_URL}${image}`;
  }

  // Convert legacy /uploads paths into backend image URLs
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

  const coverImageUrl = getCoverImageUrl(book);

  // Reset the image fallback when the cover changes
  useEffect(() => {
    setImageError(false);
  }, [coverImageUrl]);

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
      {/* Existing book-cover rendering */}
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

      {/* Book information: class names match BookCard.css */}
      <div className="bb-book-card-body">
        {category && (
          <span className="bb-book-category">
            {category}
          </span>
        )}

        <h3
          className="bb-book-title"
          title={title || 'Untitled Book'}
        >
          <Link
            to={'/books/' + (bookId || 'preview')}
            onClick={(event) => event.stopPropagation()}
          >
            {title || 'Untitled Book'}
          </Link>
        </h3>

        <p className="bb-book-author">
          by {author || 'Unknown Author'}
        </p>

        {condition && (
          <div className="bb-book-condition">
            <Badge variant="secondary">
              {condition}
            </Badge>
          </div>
        )}

        {locationCollege && (
          <p className="bb-book-location">
            <span>📍</span> {locationCollege}
          </p>
        )}

        {/* Price and listing information */}
        <div className="bb-book-card-footer">
          <div className="bb-book-price-block">
            {listingType === 'Borrow' ? (
              <span className="bb-book-borrow-note">
                Lend / Borrow
              </span>
            ) : listingType === 'Exchange' ? (
              <span className="bb-book-exchange-note">
                Exchange Offer
              </span>
            ) : price !== undefined &&
              price !== null &&
              price !== '' ? (
              <span className="bb-book-price">
                ₹{price}
              </span>
            ) : (
              <span className="bb-book-price">
                Contact for price
              </span>
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
                  to={'/books/' + (bookId || 'preview')}
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
