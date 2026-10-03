import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const BookDetailPage = () => {
  const { id } = useParams();
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/books" className="text-terracotta text-small">
            &larr; Back to Catalog
          </Link>
          <div style={{ marginTop: '0.75rem' }}>
            <Badge variant="terracotta">Module 2 • Book Details Foundation</Badge>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '2rem' }}>
          {/* Cover Display */}
          <div
            style={{
              background: 'var(--color-paper-dark)',
              borderRadius: 'var(--radius-md)',
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'center',
              padding: '2rem',
            }}
          >
            <div>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.5rem' }}>
                📖
              </span>
              <p className="text-muted text-small">
                Book Cover / Photo Placeholder
                <br />
                Book ID: <code>{id}</code>
              </p>
            </div>
          </div>

          {/* Details Column */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="sell">Sell</Badge>
              <Badge variant="like-new">Like New</Badge>
            </div>

            <h2>Computer Networks: A Systems Approach</h2>
            <p className="text-serif text-muted" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
              by Larry L. Peterson & Bruce S. Davie
            </p>

            <h3 className="text-terracotta" style={{ marginBottom: '1.25rem' }}>
              ₹320 <span className="text-muted text-small" style={{ fontWeight: 400 }}>(or borrow for 14 days)</span>
            </h3>

            <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              <h4>Description & Condition Note</h4>
              <p className="text-small">
                Includes all original pages, zero highlighter markings on chapters 1-4, slightly dog-eared
                corner on back page. Perfect for CS semester 5.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => setShowRequestModal(true)}>
                Request to Borrow / Buy
              </Button>
              <Link to="/exchange">
                <Button variant="outline">Propose Exchange</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow/Buy Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Send Request to Owner"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Request hook ready! Developer 2 & 3 will connect this to /api/exchanges.');
                setShowRequestModal(false);
              }}
            >
              Send Request
            </Button>
          </>
        }
      >
        <p>You are requesting <strong>Computer Networks: A Systems Approach</strong>.</p>
        <p className="text-small text-muted">
          Module 3 will link this directly to the exchange/borrow workflow.
        </p>
      </Modal>
    </div>
  );
};

export default BookDetailPage;
