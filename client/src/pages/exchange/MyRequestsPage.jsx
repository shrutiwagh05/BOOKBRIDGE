import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import exchangeService from '../../services/exchangeService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import Input from '../../components/common/Input';
import './MyRequests.css';

const MyRequestsPage = () => {
  const { user } = useAuth();

  // Tab state: 'incoming' | 'outgoing'
  const [activeTab, setActiveTab] = useState('incoming');

  // Request lists
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Alerts & Notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation Modal states
  const [activeModal, setActiveModal] = useState(null); // 'accept' | 'reject' | 'cancel' | 'return' | null
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Fetch all requests
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [incomingRes, outgoingRes] = await Promise.all([
        exchangeService.getIncomingRequests(),
        exchangeService.getOutgoingRequests(),
      ]);

      setIncomingRequests(incomingRes.data || []);
      setOutgoingRequests(outgoingRes.data || []);
    } catch (err) {
      console.warn('[MyRequests] Error fetching live requests:', err.message);
      setErrorMsg(err.message || 'Unable to retrieve requests. Please check your network.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Open modal handlers
  const handleOpenActionModal = (type, req) => {
    setSelectedRequest(req);
    setActiveModal(type);
    setRejectReason('');
    setErrorMsg('');
  };

  const handleCloseModal = () => {
    if (!actionLoading) {
      setActiveModal(null);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  // 1. Accept Request (Owner)
  const handleConfirmAccept = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      const res = await exchangeService.acceptRequest(selectedRequest._id);
      setSuccessMsg(res.message || 'Request accepted! Volume status marked as active loan.');
      handleCloseModal();
      await fetchRequests();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Reject Request (Owner)
  const handleConfirmReject = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      const res = await exchangeService.rejectRequest(selectedRequest._id, rejectReason);
      setSuccessMsg(res.message || 'Request rejected.');
      handleCloseModal();
      await fetchRequests();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Cancel Request (Requester)
  const handleConfirmCancel = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      const res = await exchangeService.cancelRequest(selectedRequest._id);
      setSuccessMsg(res.message || 'Request cancelled.');
      handleCloseModal();
      await fetchRequests();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to cancel request.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Return Book (Owner or Borrower)
  const handleConfirmReturn = async () => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      setErrorMsg('');
      const res = await exchangeService.returnRequest(selectedRequest._id);
      setSuccessMsg(res.message || 'Volume marked as returned! Book is now available on campus shelves again.');
      handleCloseModal();
      await fetchRequests();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to mark volume as returned.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: map status string to Badge variant
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'accepted':
      case 'approved':
      case 'active':
        return <Badge variant="success">Active Loan</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="info">Cancelled</Badge>;
      case 'returned':
      case 'completed':
        return <Badge variant="info">Returned & Done</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDaysRemaining = (dueDateString) => {
    if (!dueDateString) return null;
    const due = new Date(dueDateString);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const displayedList = activeTab === 'incoming' ? incomingRequests : outgoingRequests;
  const pendingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="bb-requests-page container">
      {/* Header */}
      <section className="bb-requests-header paper-card">
        <div className="flex-between">
          <div>
            <Link to="/exchange" className="text-small text-terracotta">
              &larr; Back to Borrow & Exchange Hub
            </Link>
            <div style={{ marginTop: '0.5rem' }}>
              <Badge variant="terracotta">Module 3 • Transaction Ledger</Badge>
            </div>
            <h1 className="bb-requests-title">Campus Borrow & Exchange Ledger</h1>
            <p className="text-muted" style={{ margin: 0 }}>
              Track all your peer loans, incoming borrowing inquiries, barter proposals, and return schedules.
            </p>
          </div>
          <Link to="/exchange">
            <Button variant="outline">+ Browse More Volumes</Button>
          </Link>
        </div>
      </section>

      {/* Global Alerts */}
      <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />
      {successMsg && (
        <div className="bb-alert bb-alert--success">
          <span>✓</span>
          <div className="bb-alert-message">{successMsg}</div>
          <button
            type="button"
            className="bb-alert-close"
            onClick={() => setSuccessMsg('')}
          >
            &times;
          </button>
        </div>
      )}

      {/* Tabs */}
      <section className="bb-requests-tabs-wrapper">
        <div className="bb-requests-tabs">
          <button
            type="button"
            className={`bb-req-tab ${activeTab === 'incoming' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            <span>📥</span>
            <span>Incoming Inquiries (As Book Owner)</span>
            <span className="bb-tab-count">
              {incomingRequests.length}
              {pendingCount > 0 && <span className="bb-pending-dot" title={`${pendingCount} pending`}></span>}
            </span>
          </button>

          <button
            type="button"
            className={`bb-req-tab ${activeTab === 'outgoing' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('outgoing')}
          >
            <span>📤</span>
            <span>Outgoing Requests (As Borrower / Trader)</span>
            <span className="bb-tab-count">{outgoingRequests.length}</span>
          </button>
        </div>
      </section>

      {/* Requests Content */}
      <section className="bb-requests-content">
        {loading ? (
          <Loader text="Auditing transaction records..." />
        ) : displayedList.length === 0 ? (
          <EmptyState
            icon={activeTab === 'incoming' ? '📥' : '📤'}
            title={
              activeTab === 'incoming'
                ? 'No Incoming Inquiries Yet'
                : 'No Outgoing Proposals'
            }
            description={
              activeTab === 'incoming'
                ? 'When classmates request to borrow your listed books or propose a trade, their proposals will appear here for your review.'
                : 'You have not sent any borrow or barter requests to fellow students yet. Browse the campus catalog to find your next study reading!'
            }
            actionLabel={activeTab === 'incoming' ? 'Lend a Book to Campus' : 'Explore Available Books'}
            onAction={() => {
              if (activeTab === 'incoming') {
                window.location.href = '/books/add';
              } else {
                window.location.href = '/exchange';
              }
            }}
          />
        ) : (
          <div className="bb-requests-list">
            {displayedList.map((req) => {
              const book = req.book || {};
              const partner = activeTab === 'incoming' ? req.requester : req.owner;
              const isBorrow = req.type === 'borrow';
              const isPending = req.status === 'pending';
              const isActiveLoan = ['accepted', 'approved', 'active'].includes(req.status);
              const daysRemaining = calculateDaysRemaining(req.returnDueDate);

              return (
                <div key={req._id} className="bb-request-card paper-card">
                  {/* Left Column: Book Details */}
                  <div className="bb-req-book-col">
                    <div className="bb-req-cover">
                      {book.images && book.images[0] ? (
                        <img src={book.images[0]} alt={book.title} />
                      ) : (
                        <div className="bb-req-cover-placeholder">
                          <span>📖</span>
                        </div>
                      )}
                    </div>

                    <div className="bb-req-details">
                      <div className="bb-req-type-pill">
                        <Badge variant={isBorrow ? 'borrow' : 'exchange'}>
                          {isBorrow ? '🤝 Peer Borrow' : '🔄 Barter Exchange'}
                        </Badge>
                        <Badge variant={book.condition || 'Good'}>{book.condition || 'Good'}</Badge>
                      </div>

                      <h3 className="bb-req-book-title">{book.title || 'Untitled Volume'}</h3>
                      <p className="text-small text-muted" style={{ margin: '2px 0 6px 0' }}>
                        by {book.author || 'Unknown Author'}
                      </p>

                      <div className="bb-req-partner-info">
                        <span>
                          {activeTab === 'incoming' ? 'Requested by:' : 'Owned by:'}{' '}
                          <strong>{partner?.name || 'Fellow Student'}</strong>
                        </span>
                        {partner?.college && (
                          <span className="text-muted"> • {partner.college}</span>
                        )}
                        {partner?.rating && (
                          <span style={{ color: 'var(--color-warning)' }}> ★ {partner.rating.toFixed(1)}</span>
                        )}
                      </div>

                      {/* Requester Message / Offered Book Details */}
                      {req.message && (
                        <div className="bb-req-note-box">
                          <span className="text-small text-muted">Student Note:</span>
                          <p className="text-small" style={{ margin: 0 }}>
                            "{req.message}"
                          </p>
                        </div>
                      )}

                      {!isBorrow && req.offeredBook && (
                        <div className="bb-offered-book-preview">
                          <span className="text-small text-muted">Offered in Barter Trade:</span>
                          <p className="text-small" style={{ margin: '2px 0 0 0', fontWeight: 600 }}>
                            📚 {req.offeredBook.title} ({req.offeredBook.condition || 'Good'})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Status & Actions */}
                  <div className="bb-req-status-col">
                    <div className="bb-status-badge-container">
                      {getStatusBadge(req.status)}
                      <span className="text-small text-muted" style={{ display: 'block', marginTop: '4px' }}>
                        Requested: {formatDate(req.createdAt)}
                      </span>
                    </div>

                    {/* Active Due Date Indicator */}
                    {isActiveLoan && req.returnDueDate && (
                      <div className={`bb-due-date-pill ${daysRemaining !== null && daysRemaining <= 3 ? 'bb-due-soon' : ''}`}>
                        <span>📅 Due Date: {formatDate(req.returnDueDate)}</span>
                        {daysRemaining !== null && (
                          <small>
                            {daysRemaining > 0
                              ? `(${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining)`
                              : daysRemaining === 0
                              ? '(Due today!)'
                              : `(Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) > 1 ? 's' : ''})`}
                          </small>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="bb-req-actions">
                      {/* Incoming Pending Actions (Owner) */}
                      {activeTab === 'incoming' && isPending && (
                        <div className="bb-btn-group">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleOpenActionModal('accept', req)}
                          >
                            ✓ Accept Request
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenActionModal('reject', req)}
                          >
                            ✕ Reject
                          </Button>
                        </div>
                      )}

                      {/* Outgoing Pending Actions (Requester) */}
                      {activeTab === 'outgoing' && isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenActionModal('cancel', req)}
                        >
                          Cancel Proposal
                        </Button>
                      )}

                      {/* Active Loan Return Action (Both Owner & Requester) */}
                      {isActiveLoan && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenActionModal('return', req)}
                        >
                          ✓ Mark as Returned
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 1. Modal: Accept Confirmation */}
      <Modal
        isOpen={activeModal === 'accept'}
        onClose={handleCloseModal}
        title="Accept Borrow / Exchange Request"
        footer={
          <>
            <Button variant="outline" disabled={actionLoading} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={actionLoading}
              disabled={actionLoading}
              onClick={handleConfirmAccept}
            >
              Confirm & Lend Volume
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div>
            <p>
              Are you sure you want to accept the {selectedRequest.type === 'exchange' ? 'exchange proposal' : 'borrow request'} from{' '}
              <strong>{selectedRequest.requester?.name}</strong> for:
            </p>
            <div className="bb-modal-book-box">
              <h4>{selectedRequest.book?.title}</h4>
              <p className="text-small text-muted" style={{ margin: 0 }}>
                {selectedRequest.type === 'borrow'
                  ? `Loan Duration: ${selectedRequest.durationDays || 14} days`
                  : `Barter Trade with: ${selectedRequest.offeredBook?.title || 'Proposed Book'}`}
              </p>
            </div>
            <p className="text-small text-muted" style={{ marginTop: '1rem' }}>
              ℹ️ Accepting this will update the book's status to <strong>Active Loan</strong> and automatically notify the requester.
            </p>
          </div>
        )}
      </Modal>

      {/* 2. Modal: Reject Confirmation */}
      <Modal
        isOpen={activeModal === 'reject'}
        onClose={handleCloseModal}
        title="Decline Request"
        footer={
          <>
            <Button variant="outline" disabled={actionLoading} onClick={handleCloseModal}>
              Back
            </Button>
            <Button
              variant="danger"
              isLoading={actionLoading}
              disabled={actionLoading}
              onClick={handleConfirmReject}
            >
              Decline Request
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div>
            <p>
              You are declining the request from <strong>{selectedRequest.requester?.name}</strong> for{' '}
              <strong>{selectedRequest.book?.title}</strong>.
            </p>
            <Input
              label="Optional Note to Student"
              type="textarea"
              placeholder="e.g. Currently studying for exams, will be available next month..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>

      {/* 3. Modal: Cancel Confirmation */}
      <Modal
        isOpen={activeModal === 'cancel'}
        onClose={handleCloseModal}
        title="Cancel Your Submitted Request"
        footer={
          <>
            <Button variant="outline" disabled={actionLoading} onClick={handleCloseModal}>
              Keep Request
            </Button>
            <Button
              variant="danger"
              isLoading={actionLoading}
              disabled={actionLoading}
              onClick={handleConfirmCancel}
            >
              Cancel Request
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div>
            <p>
              Are you sure you want to withdraw your request for{' '}
              <strong>{selectedRequest.book?.title}</strong>?
            </p>
            <p className="text-small text-muted">
              This action will remove the request from the owner's pending queue.
            </p>
          </div>
        )}
      </Modal>

      {/* 4. Modal: Mark as Returned Confirmation */}
      <Modal
        isOpen={activeModal === 'return'}
        onClose={handleCloseModal}
        title="Confirm Volume Return"
        footer={
          <>
            <Button variant="outline" disabled={actionLoading} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={actionLoading}
              disabled={actionLoading}
              onClick={handleConfirmReturn}
            >
              Confirm Returned
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div>
            <p>
              Confirm that the physical volume <strong>"{selectedRequest.book?.title}"</strong> has been safely handed back and returned.
            </p>
            <div className="bb-modal-book-box">
              <span className="text-small" style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                ✓ Availability Restoration:
              </span>
              <p className="text-small text-muted" style={{ margin: '4px 0 0 0' }}>
                Confirming will mark this transaction as <strong>Returned & Completed</strong>, and restore this book's availability on campus shelves so other students can discover and borrow it.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyRequestsPage;
