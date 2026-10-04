import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import bookService from '../../services/bookService';
import ErrorAlert from '../../components/common/ErrorAlert';

const AddBookPage = () => {
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

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author || !formData.description) {
      setErrorMsg('Please complete title, author, and description.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        category: formData.category,
        listingType: formData.listingType,
        price: Number(formData.price) || 0,
        condition: formData.condition,
        description: formData.description.trim(),

        // Explicitly send the campus/hostel location
        locationCollege: formData.locationCollege.trim(),
      };

      console.log('BookBridge listing payload:', payload);

      await bookService.createBook(payload);

      setSuccessMsg('Book submitted! Redirecting to catalog...');

      setTimeout(() => {
        navigate('/books');
      }, 1200);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        'Error listing book. Please check server connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div
        className="paper-card"
        style={{ maxWidth: '720px', margin: '0 auto' }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/books" className="text-terracotta text-small">
            &larr; Back to Catalog
          </Link>

          <div style={{ marginTop: '0.5rem' }}>
            <Badge variant="terracotta">
              Module 2 • Add Book Listing
            </Badge>
          </div>

          <h2 style={{ marginTop: '0.5rem' }}>
            List a Book for the Library
          </h2>

          <p className="text-muted">
            Assigned to <strong>Developer 2</strong>. Fill in the volume
            metadata to offer it to students.
          </p>
        </div>

        <ErrorAlert
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />

        {successMsg && (
          <div
            className="bb-alert bb-alert--success"
            style={{ marginBottom: '1rem' }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Book Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Design Patterns: Elements of Reusable Object-Oriented Software"
            required
          />

          <Input
            label="ISBN"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            placeholder="e.g. 9780262046305"
          />

          <div className="grid-2">
            <Input
              label="Author(s)"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Erich Gamma, Richard Helm"
              required
            />

            <Input
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleChange}
              options={[
                'Computer Science & IT',
                'Engineering',
                'Business & Economics',
                'Medical & Science',
                'Literature & Fiction',
                'Humanities & Arts',
                'Competitive Exams',
                'Other',
              ]}
            />
          </div>

          <div className="grid-3">
            <Input
              label="Listing Intent"
              name="listingType"
              type="select"
              value={formData.listingType}
              onChange={handleChange}
              options={[
                { value: 'Sell', label: 'Sell (Set price)' },
                { value: 'Borrow', label: 'Lend / Borrow' },
                {
                  value: 'Exchange',
                  label: 'Exchange for another book',
                },
              ]}
            />

            <Input
              label="Price (₹, if selling)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
            />

            <Input
              label="Physical Condition"
              name="condition"
              type="select"
              value={formData.condition}
              onChange={handleChange}
              options={['New', 'Like New', 'Good', 'Fair']}
            />
          </div>

          <Input
            label="Campus / Hostel Location"
            name="locationCollege"
            value={formData.locationCollege}
            onChange={handleChange}
            placeholder="e.g. Main Library Floor 2 or Boys Hostel A"
          />

          <Input
            label="Condition Notes & Edition Info"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe highlighted sections, markings, edition year..."
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
          >
            Publish Book Listing
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage;