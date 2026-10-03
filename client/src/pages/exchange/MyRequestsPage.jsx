import React from 'react';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';

const MyRequestsPage = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Link to="/exchange" className="text-terracotta text-small">
          &larr; Back to Exchange Hub
        </Link>
        <div style={{ marginTop: '0.5rem' }}>
          <Badge variant="terracotta">Module 3 • Requests Manager</Badge>
        </div>
        <h2 style={{ marginTop: '0.5rem' }}>My Borrow & Exchange Requests</h2>
        <p className="text-muted">
          Assigned to <strong>Developer 3</strong>. Track pending, approved, and completed requests
          connected to <code>/api/exchanges</code>.
        </p>
      </div>

      <EmptyState
        icon="📬"
        title="No Active Requests in Pipeline"
        description="When you request to borrow a textbook or another student proposes an exchange for your listings, they will show up here."
        actionLabel="Explore Available Books"
        onAction={() => window.location.href = '/books'}
      />
    </div>
  );
};

export default MyRequestsPage;
