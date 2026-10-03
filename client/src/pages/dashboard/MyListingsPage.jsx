import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const MyListingsPage = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" className="text-terracotta text-small">
          &larr; Back to Dashboard
        </Link>
        <div style={{ marginTop: '0.5rem' }}>
          <Badge variant="terracotta">Module 4 • My Listings</Badge>
        </div>
        <div className="flex-between" style={{ marginTop: '0.5rem' }}>
          <div>
            <h2>My Books on Campus Shelf</h2>
            <p className="text-muted">
              Assigned to <strong>Developer 4</strong>. Edit or remove your posted book listings.
            </p>
          </div>
          <Link to="/books/add">
            <Button variant="primary">+ Add New Book</Button>
          </Link>
        </div>
      </div>

      <EmptyState
        icon="📖"
        title="Your Shelf is Empty"
        description="You have not listed any textbooks or novels yet. Add your first book to start sharing with your campus peers!"
        actionLabel="List a Book Now"
        onAction={() => window.location.href = '/books/add'}
      />
    </div>
  );
};

export default MyListingsPage;
