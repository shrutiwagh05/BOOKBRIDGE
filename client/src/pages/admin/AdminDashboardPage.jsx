import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeListings: 0,
    pendingRequests: 0,
    activeTransactions: 0,
    completedTransactions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await adminService.getStats();

        if (res.data) {
          setStats(res.data);
        }
      } catch (err) {
        setError('Unable to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      description: 'Registered users',
      className: 'text-terracotta',
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      description: 'Books listed on platform',
      className: 'text-deep-brown',
    },
    {
      title: 'Active Listings',
      value: stats.activeListings,
      description: 'Currently available books',
      className: 'text-terracotta',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      description: 'Requests awaiting action',
      className: 'text-deep-brown',
    },
    {
      title: 'Active Transactions',
      value: stats.activeTransactions,
      description: 'Ongoing exchanges or borrows',
      className: 'text-terracotta',
    },
    {
      title: 'Completed Transactions',
      value: stats.completedTransactions,
      description: 'Successfully completed',
      className: 'text-deep-brown',
    },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
          
            <h2 style={{ marginTop: '0.5rem' }}>
              Admin Dashboard
            </h2>

            <p className="text-muted">
              Monitor users, books, requests, transactions, and platform activity.
            </p>
          </div>

          <Link to="/admin/notifications">
            <Button variant="outline">
              Notifications
            </Button>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="paper-card"
          style={{
            marginBottom: '1.5rem',
            borderLeft: '4px solid var(--color-terracotta)',
          }}
        >
          <p className="text-muted">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div
        className="grid-3"
        style={{
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {statCards.map((stat) => (
          <div className="paper-card" key={stat.title}>
            <h4>{stat.title}</h4>

            <h2 className={stat.className}>
              {loading ? '—' : stat.value}
            </h2>

            <p className="text-muted text-small">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Administrative Controls */}
      <div className="paper-card">
        <h3>Administrative Controls</h3>

        <p
          className="text-small text-muted"
          style={{ marginBottom: '1.5rem' }}
        >
          Manage the BookBridge platform, monitor activity, and communicate
          with users from the administrative workspace.
        </p>

        <div
          className="grid-3"
          style={{
            gap: '1rem',
          }}
        >
          <Link to="/admin/users">
            <Button variant="outline">
              User Management
            </Button>
          </Link>

          <Link to="/admin/books">
            <Button variant="outline">
              Book Management
            </Button>
          </Link>

          <Link to="/admin/requests">
            <Button variant="outline">
              Requests & Transactions
            </Button>
          </Link>

          <Link to="/admin/notifications">
            <Button variant="outline">
              Notifications
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;