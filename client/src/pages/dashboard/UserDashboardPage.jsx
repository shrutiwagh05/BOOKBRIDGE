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
              Assigned to <strong>Developer 4</strong>. Personal library
              shelf, profile details, and activity ledger.
            </p>
          </div>

          <Link to="/books/add">
            <Button variant="primary">+ Offer Another Book</Button>
          </Link>
        </div>
      </div>

      <div
        className="grid-3"
        style={{ gap: '1.5rem', marginBottom: '2rem' }}
      >
        <div className="paper-card">
          <h4>Active Listings</h4>

          <p className="text-muted text-small">
            Books you currently offer to campus
          </p>

          <h2 className="text-terracotta">0</h2>

          <Link to="/dashboard/listings">
            <Button
              size="sm"
              variant="outline"
              style={{ marginTop: '0.5rem' }}
            >
              Manage Listings
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h4>Books Borrowed</h4>

          <p className="text-muted text-small">
            Currently reading on loan
          </p>

          <h2 className="text-deep-brown">0</h2>

          {/* CHANGED: Now opens My Borrowed Books page */}
          <Link to="/dashboard/borrowed">
            <Button
              size="sm"
              variant="ghost"
              style={{ marginTop: '0.5rem' }}
            >
              View Due Dates
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h4>Student Reputation</h4>

          <p className="text-muted text-small">
            Based on verified returns & trades
          </p>

          <h2 style={{ color: 'var(--color-success)' }}>
            5.0 ★
          </h2>

          <Badge variant="success">
            Verified Campus Member
          </Badge>
        </div>
      </div>

      <div className="paper-card">
        <h3>User Profile Summary</h3>

        <p>
          <strong>Email:</strong> {user?.email || 'N/A'}
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
          Developer 4 can build edit profile forms, saved favorites,
          and transaction history cards here.
        </p>
      </div>
    </div>
  );
};

export default UserDashboardPage;