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
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await userService.getProfile();
        const data = response.data || {};

        if (!isMounted) return;

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

        if (isMounted) {
          setError('Unable to load dashboard activity.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [setUser]);

  const {
    listingsCount,
    borrowedCount,
    lentCount,
    pendingRequestsCount,
  } = dashboardData;

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <section
        className="paper-card"
        style={{ marginBottom: '2rem', padding: '1.5rem' }}
      >
        <div
          className="flex-between"
          style={{ gap: '1rem', flexWrap: 'wrap' }}
        >
          <div>
            <h2 style={{ marginTop: 0 }}>
              Welcome, {user?.name || 'Reader'}
            </h2>

            <p className="text-muted">
              Manage your BookBridge account, book listings, and campus
              activities from your dashboard.
            </p>
          </div>

          <Link to="/books/add" style={{ textDecoration: 'none' }}>
            <Button variant="primary">+ Offer Another Book</Button>
          </Link>
        </div>
      </section>

      {error && (
        <div
          className="paper-card"
          role="alert"
          style={{ marginBottom: '1.5rem', padding: '1rem' }}
        >
          <p className="text-muted">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}

      <section
        className="grid-3"
        style={{ gap: '1.5rem', marginBottom: '2rem' }}
      >
        <div className="paper-card">
          <h3>My Listings</h3>
          <p className="text-muted text-small">
            Books you have listed on BookBridge.
          </p>
          <h2>{loading ? '...' : listingsCount}</h2>

          <Link to="/dashboard/listings">
            <Button size="sm" variant="primary">
              View My Listings
            </Button>
          </Link>

          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/books/add" className="text-terracotta text-small">
              + Add a New Book
            </Link>
          </div>
        </div>

        <div className="paper-card">
          <h3>Books Borrowed</h3>
          <p className="text-muted text-small">
            Books you are currently borrowing.
          </p>
          <h2>{loading ? '...' : borrowedCount}</h2>

          <Link to="/dashboard/borrowed">
            <Button size="sm" variant="ghost">
              View Borrowed Books
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h3>Books Lent</h3>
          <p className="text-muted text-small">
            Books currently borrowed by others.
          </p>
          <h2>{loading ? '...' : lentCount}</h2>

          <Link to="/dashboard/lent">
            <Button size="sm" variant="ghost">
              View Lent Books
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h3>My Requests</h3>
          <p className="text-muted text-small">
            Track your borrow and exchange requests.
          </p>
          <h2>{loading ? '...' : pendingRequestsCount}</h2>

          <Link to="/exchange/requests">
            <Button size="sm" variant="ghost">
              View Requests
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h3>Transaction History</h3>
          <p className="text-muted text-small">
            View your borrowing and exchange history.
          </p>

          <Link to="/dashboard/transactions">
            <Button size="sm" variant="ghost">
              View History
            </Button>
          </Link>
        </div>

        <div className="paper-card">
          <h3>Student Reputation</h3>
          <p className="text-muted text-small">
            Based on verified returns and trades.
          </p>

          <h2 style={{ color: 'var(--color-success)' }}>
            {user?.rating != null ? `${user.rating} ★` : '5.0 ★'}
          </h2>

          <Badge variant="success">
            Verified Campus Member
          </Badge>
        </div>
      </section>

      <section
        className="paper-card"
        style={{ marginBottom: '2rem', padding: '1.5rem' }}
      >
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
            <Button variant="primary">My Listings</Button>
          </Link>

          <Link to="/books/add">
            <Button variant="outline">Add Book</Button>
          </Link>

          <Link to="/books">
            <Button variant="outline">Browse Books</Button>
          </Link>
        </div>
      </section>

      <section className="paper-card" style={{ padding: '1.5rem' }}>
        <h3>User Profile Summary</h3>

        <p>
          <strong>Email:</strong> {user?.email || 'N/A'}
        </p>

        <p>
          <strong>College:</strong> {user?.college || 'Not specified'}
        </p>

        <p>
          <strong>Department:</strong>{' '}
          {user?.department || 'Not specified'}
        </p>

        <p className="text-small text-muted" style={{ marginTop: '1rem' }}>
          Manage your listed books, browse campus books, and participate
          in BookBridge exchanges.
        </p>
      </section>
    </main>
  );
};

export default UserDashboardPage;