import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import bookService from '../../services/bookService';

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science & IT',
    listingType: 'Sell',
    price: '',
    condition: 'Good',
    description: '',
    locationCollege: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await bookService.getBookById(id);
        const book = res.data?.data ?? res.data;

        setFormData({
          title: book.title || '',
          author: book.author || '',
          isbn: book.isbn || '',
          category: book.category || 'Computer Science & IT',
          listingType: book.listingType || 'Sell',
          price: book.price ?? '',
          condition: book.condition || 'Good',
          description: book.description || '',
          locationCollege: book.locationCollege || '',
        });
        setExistingImage(book.images?.[0] || book.image || '');
        setImageFile(null);
        setRemoveImage(false);
      } catch (err) {
        console.error('[EditBook] Failed to load book:', err);

        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to load this book listing.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Book title is required.');
      return;
    }

    if (!formData.author.trim()) {
      setError('Author name is required.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Book description is required.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        category: formData.category,
        listingType: formData.listingType,
        price:
          formData.price === ''
            ? undefined
            : Number(formData.price),
        condition: formData.condition,
        description: formData.description.trim(),
        locationCollege: formData.locationCollege.trim(),
      };

      const multipartPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined) multipartPayload.append(key, value);
      });
      if (imageFile) multipartPayload.append('image', imageFile);
      if (removeImage) multipartPayload.append('removeImage', 'true');

      await bookService.updateBook(id, multipartPayload);

      setSuccess('Book listing updated successfully.');

      setTimeout(() => {
        navigate('/dashboard/listings');
      }, 500);
    } catch (err) {
      console.error('[EditBook] Update failed:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to update the book listing.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <Loader text="Loading book listing..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card">
        <Link
          to="/dashboard/listings"
          className="text-terracotta text-small"
        >
          &larr; Back to My Listings
        </Link>

        <div style={{ marginTop: '0.75rem' }}>
          <Badge variant="terracotta">
            Module 2 &bull; Edit Book Listing
          </Badge>
        </div>

        <h2 style={{ marginTop: '0.75rem' }}>
          Edit Book Listing
        </h2>

        <p className="text-muted">
          Update the information for your listed book.
        </p>

        {error && (
          <div
            className="bb-alert bb-alert--error"
            style={{ marginTop: '1rem' }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="bb-alert bb-alert--success"
            style={{ marginTop: '1rem' }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="edit-book-image"><strong>Book Photo (JPG, PNG or WEBP, max 5 MB)</strong></label>
            <input
              id="edit-book-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
                  setError('Choose a JPG, PNG or WEBP image up to 5 MB.');
                  e.target.value = '';
                  return;
                }
                setError('');
                setImageFile(file);
                setRemoveImage(false);
              }}
              style={{ display: 'block', marginTop: '0.5rem' }}
            />
            {(imageFile || existingImage) && !removeImage && (
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : existingImage}
                alt="Book photo preview"
                style={{ display: 'block', width: '150px', height: '180px', objectFit: 'contain', marginTop: '0.75rem' }}
              />
            )}
            {(imageFile || existingImage) && !removeImage && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setExistingImage('');
                  setRemoveImage(true);
                  const input = document.getElementById('edit-book-image');
                  if (input) input.value = '';
                }}
                style={{ marginTop: '0.5rem' }}
              >
                Remove photo
              </button>
            )}
          </div>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div>
              <label htmlFor="title">
                <strong>Book Title *</strong>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="author">
                <strong>Author *</strong>
              </label>

              <input
                id="author"
                name="author"
                type="text"
                value={formData.author}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="isbn">
                <strong>ISBN</strong>
              </label>

              <input
                id="isbn"
                name="isbn"
                type="text"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="e.g. 9780262046305"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="category">
                <strong>Category</strong>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              >
                <option value="Computer Science & IT">
                  Computer Science & IT
                </option>
                <option value="Engineering">Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Management">Management</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="listingType">
                <strong>Listing Type</strong>
              </label>

              <select
                id="listingType"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              >
                <option value="Sell">Sell</option>
                <option value="Borrow">Borrow</option>
                <option value="Exchange">Exchange</option>
              </select>
            </div>

            <div>
              <label htmlFor="price">
                <strong>Price (₹)</strong>
              </label>

              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              />
            </div>

            <div>
              <label htmlFor="condition">
                <strong>Condition</strong>
              </label>

              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="locationCollege">
                <strong>Location / College</strong>
              </label>

              <input
                id="locationCollege"
                name="locationCollege"
                type="text"
                value={formData.locationCollege}
                onChange={handleChange}
                placeholder="e.g. Computer Engineering Department"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  marginTop: '0.35rem',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="description">
              <strong>Description *</strong>
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="5"
              style={{
                width: '100%',
                padding: '0.65rem',
                marginTop: '0.35rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <Button
              type="submit"
              variant="primary"
              isLoading={saving}
            >
              Save Changes
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/listings')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookPage;

