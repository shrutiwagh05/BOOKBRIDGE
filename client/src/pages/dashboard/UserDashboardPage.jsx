import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import userService from '../../services/userService';

const UserDashboardPage = () => {
  const { user, setUser } = useAuth();

  const [dashboardData, setDashboardData] = useState({
    listingsCount: 0,
    borrowedCount: 0,
    lentCount: 0,
    pendingRequestsCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await userService.getProfile();

        const data = response.data || {};

        setDashboardData({
          listingsCount: data.listingsCount || 0,
          borrowedCount: data.borrowedCount || 0,
          lentCount: data.lentCount || 0,
          pendingRequestsCount: data.pendingRequestsCount || 0,
        });

        if (data.user && setUser) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Unable to load dashboard activity.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [setUser]);

  const {
    listingsCount,
    borrowedCount,
    lentCount,
    pendingRequestsCount,
  } = dashboardData;

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

      {error && (
        <div
          className="paper-card"
          style={{
            marginBottom: '1.5rem',
            border: '1px solid var(--color-error)',
          }}
        >
          <p className="text-muted">{error}</p>
        </div>
      )}

      <div
        className="grid-3"
        style={{ gap: '1.5rem', marginBottom: '2rem' }}
      >
        <div className="paper-card">
          <h4>Active Listings</h4>

          <p className="text-muted text-small">
            Books you currently offer to campus
          </p>

          <h2 className="text-terracotta">
            {loading ? '...' : listingsCount}
          </h2>

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

          <h2 className="text-deep-brown">
            {loading ? '...' : borrowedCount}
          </h2>

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
          <h4>Books Lent</h4>

          <p className="text-muted text-small">
            Books currently borrowed by others
          </p>

          <h2 className="text-deep-brown">
            {loading ? '...' : lentCount}
          </h2>

          <Link to="/dashboard/lent">
            <Button
              size="sm"
              variant="ghost"
              style={{ marginTop: '0.5rem' }}
            >
              View Lent Books
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h4>My Requests</h4>

          <p className="text-muted text-small">
            Track your borrow and exchange requests
          </p>

          <h2 className="text-deep-brown">
            {loading ? '...' : pendingRequestsCount}
          </h2>

          <Link to="/exchange/requests">
            <Button
              size="sm"
              variant="ghost"
              style={{ marginTop: '0.5rem' }}
            >
              View Requests
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h4>Transaction History</h4>

          <p className="text-muted text-small">
            View your borrow and exchange history
          </p>

          <Link to="/dashboard/transactions">
            <Button
              size="sm"
              variant="ghost"
              style={{ marginTop: '0.5rem' }}
            >
              View History
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h4>Student Reputation</h4>

          <p className="text-muted text-small">
            Based on verified returns & trades
          </p>

          <h2 style={{ color: 'var(--color-success)' }}>
            {user?.rating !== undefined ? `${user.rating} ★` : '5.0 ★'}
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