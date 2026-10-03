import React from 'react';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';

const DiscoveryPage = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Badge variant="terracotta">Module 1 • Home + Discovery</Badge>
        <h2 style={{ marginTop: '0.75rem' }}>Discovery & Genre Archive</h2>
        <p className="text-muted">
          Assigned to <strong>Developer 1</strong>. This page will feature curated categories, search filters,
          trending campus books, and discovery carousels.
        </p>
      </div>

      <EmptyState
        icon="🔍"
        title="Discovery Feed in Incubation"
        description="Developer 1 can populate this page with category filters, search input boxes, and discovery grids."
      >
        <div style={{ marginTop: '1rem' }}>
          <Link to="/books" className="text-terracotta">
            &larr; Return to Book Listings
          </Link>
        </div>
      </EmptyState>
    </div>
  );
};

export default DiscoveryPage;
