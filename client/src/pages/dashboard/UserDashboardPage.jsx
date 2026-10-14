import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const UserDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
            <Badge variant="terracotta">
              Module 4 • User Account & Dashboard
            </Badge>

            <h2 style={{ marginTop: '0.5rem' }}>
              Welcome, {user?.name || 'Reader'}
            </h2>

            <p className="text-muted">
              Manage your BookBridge account, book listings, and campus
              activities from your dashboard.
            </p>
          </div>

          <Link to="/books/add">
            <Button variant="primary">
              + Offer Another Book
            </Button>
          </Link>
        </div>
      </div>

      <div
        className="grid-3"
        style={{
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* My Listings */}
        <div className="paper-card">
          <h4>My Listings</h4>

          <p className="text-muted text-small">
            Manage the books you have listed on BookBridge.
          </p>

          <div style={{ marginTop: '1rem' }}>
            <Link to="/dashboard/listings">
              <Button
                size="sm"
                variant="primary"
              >
                View My Listings
              </Button>
            </Link>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <Link
              to="/books/add"
              className="text-terracotta text-small"
            >
              + Add a New Book
            </Link>
          </div>
        </div>

        {/* Borrowed Books */}
        <div className="paper-card">
          <h4>Books Borrowed</h4>

          <p className="text-muted text-small">
            Currently reading on loan.
          </p>

          <h2 className="text-deep-brown">0</h2>

          <Link to="/exchange/requests">
            <Button
              size="sm"
              variant="ghost"
              style={{ marginTop: '0.5rem' }}
            >
              View Due Dates
            </Button>
          </Link>
        </div>

        {/* Reputation */}
        <div className="paper-card">
          <h4>Student Reputation</h4>

          <p className="text-muted text-small">
            Based on verified returns and trades.
          </p>

          <h2 style={{ color: 'var(--color-success)' }}>
            5.0 ★
          </h2>

          <Badge variant="success">
            Verified Campus Member
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <h3>Quick Actions</h3>

        <p className="text-muted">
          Quickly access your book management features.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginTop: '1rem',
          }}
        >
          <Link to="/dashboard/listings">
            <Button variant="primary">
              My Listings
            </Button>
          </Link>

          <Link to="/books/add">
            <Button variant="outline">
              Add Book
            </Button>
          </Link>

          <Link to="/books">
            <Button variant="outline">
              Browse Books
            </Button>
          </Link>
        </div>
      </div>

      {/* User Profile */}
      <div className="paper-card">
        <h3>User Profile Summary</h3>

        <p>
          <strong>Email:</strong>{' '}
          {user?.email || 'N/A'}
        </p>

        <p>
          <strong>College:</strong>{' '}
          {user?.college || 'Not specified'}
        </p>

        <p>
          <strong>Department:</strong>{' '}
          {user?.department || 'Not specified'}
        </p>

        <p
          className="text-small text-muted"
          style={{ marginTop: '1rem' }}
        >
          Manage your listed books, browse campus books, and
          participate in BookBridge exchanges.
        </p>
      </div>
    </div>
  );
};

export default UserDashboardPage;