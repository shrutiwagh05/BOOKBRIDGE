import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const ExchangeHubPage = () => {
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
            <Badge variant="terracotta">Module 3 • Borrow / Lend / Exchange</Badge>
            <h2 style={{ marginTop: '0.5rem' }}>Borrow & Exchange Hub</h2>
            <p className="text-muted">
              Assigned to <strong>Developer 3</strong>. Facilitate peer-to-peer lending, exchange proposals,
              and tracking return due dates.
            </p>
          </div>
          <Link to="/exchange/requests">
            <Button variant="outline">My Active Requests</Button>
          </Link>
        </div>
      </div>

      <div className="grid-3" style={{ gap: '1.5rem' }}>
        {/* Card 1: Borrowing */}
        <div className="paper-card">
          <span style={{ fontSize: '2rem' }}>🤝</span>
          <h3 style={{ marginTop: '0.5rem' }}>Borrow Books</h3>
          <p className="text-small text-muted">
            Request to borrow a book from a student for 7, 14, or 30 days. Set return dates and deposit terms.
          </p>
          <Badge variant="borrow">Lending Mode</Badge>
        </div>

        {/* Card 2: Lending */}
        <div className="paper-card">
          <span style={{ fontSize: '2rem' }}>📦</span>
          <h3 style={{ marginTop: '0.5rem' }}>Lend to Batchmates</h3>
          <p className="text-small text-muted">
            Share your semester syllabus books when you are not using them. Help juniors and build your campus reputation.
          </p>
          <Badge variant="success">Peer Lending</Badge>
        </div>

        {/* Card 3: Direct Trade */}
        <div className="paper-card">
          <span style={{ fontSize: '2rem' }}>🔄</span>
          <h3 style={{ marginTop: '0.5rem' }}>Direct Book Exchange</h3>
          <p className="text-small text-muted">
            Trade a novel or reference book you finished for another student's book without spending a single rupee.
          </p>
          <Badge variant="exchange">Barter Trade</Badge>
        </div>
      </div>
    </div>
  );
};

export default ExchangeHubPage;
