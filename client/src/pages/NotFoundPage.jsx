import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
      <div className="paper-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📜</span>
        <h1 style={{ marginBottom: '0.5rem' }}>404: Page Missing</h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          The requested page appears to have vanished from the campus library catalogue.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Library Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
