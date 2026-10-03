import React from 'react';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';

const NotificationsPage = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Link to="/admin" className="text-terracotta text-small">
          &larr; Back to Admin Overview
        </Link>
        <div style={{ marginTop: '0.5rem' }}>
          <Badge variant="terracotta">Module 5 • Notifications & Dispatch</Badge>
        </div>
        <h2 style={{ marginTop: '0.5rem' }}>Campus System Notifications</h2>
        <p className="text-muted">
          Assigned to <strong>Developer 5</strong>. System announcements, borrow due reminders, and alert logs.
        </p>
      </div>

      <EmptyState
        icon="🔔"
        title="All Quiet in the Archives"
        description="No unread alerts or notifications currently pending. Real-time updates and notifications will appear here."
      />
    </div>
  );
};

export default NotificationsPage;
