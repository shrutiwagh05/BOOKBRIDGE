import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useAuth } from '../../context/AuthContext';

const TransactionHistoryPage = () => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/exchanges');

      setTransactions(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching transaction history:', err);

      setError(
        err.response?.data?.message ||
          'Unable to load transaction history. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getId = (value) => {
    if (!value) return '';

    if (typeof value === 'string') return value;

    return value._id || value.id || '';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType =
        typeFilter === 'all' ||
        transaction.type?.toLowerCase() === typeFilter.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' ||
        transaction.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesType && matchesStatus;
    });
  }, [transactions, typeFilter, statusFilter]);

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      approved: 'Approved',
      active: 'Active',
      returned: 'Returned',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
    };

    return labels[status?.toLowerCase()] || status || 'Unknown';
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      approved: 'badge-success',
      active: 'badge-success',
      returned: 'badge-info',
      rejected: 'badge-danger',
      cancelled: 'badge-danger',
    };

    return statusClasses[status?.toLowerCase()] || 'badge-secondary';
  };

  const getTypeLabel = (type) => {
    if (type?.toLowerCase() === 'borrow') {
      return 'Borrow';
    }

    if (type?.toLowerCase() === 'exchange') {
      return 'Exchange';
    }

    return type || 'Transaction';
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '—';
    }

    return parsedDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserRole = (transaction) => {
    const currentUserId = getId(user);

    const requesterId = getId(transaction.requester);
    const ownerId = getId(transaction.owner);

    if (currentUserId && requesterId === currentUserId) {
      return 'Requester';
    }

    if (currentUserId && ownerId === currentUserId) {
      return 'Owner';
    }

    return 'Participant';
  };

  const getOtherParticipant = (transaction) => {
    const currentUserId = getId(user);

    const requesterId = getId(transaction.requester);
    const ownerId = getId(transaction.owner);

    if (requesterId === currentUserId) {
      return transaction.owner;
    }

    if (ownerId === currentUserId) {
      return transaction.requester;
    }

    return transaction.requester || transaction.owner;
  };

  const getParticipantName = (participant) => {
    if (!participant) return 'Unknown user';

    return participant.name || participant.email || 'Unknown user';
  };

  const getBookImage = (book) => {
    if (!book?.images) return null;

    if (Array.isArray(book.images) && book.images.length > 0) {
      return book.images[0];
    }

    if (typeof book.images === 'string') {
      return book.images;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="container page-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container page-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="text-deep-brown">Transaction History</h1>

          <p className="text-muted">
            View your borrow and exchange transaction history
          </p>
        </div>

        <Link to="/dashboard">
          <Button variant="ghost">Back to Dashboard</Button>
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginBottom: '1rem' }}>
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Filters */}
      <div
        className="paper-card"
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <label
            htmlFor="transaction-type"
            className="text-small text-muted"
            style={{ display: 'block', marginBottom: '0.35rem' }}
          >
            Transaction Type
          </label>

          <select
            id="transaction-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="form-control"
          >
            <option value="all">All Types</option>
            <option value="borrow">Borrow</option>
            <option value="exchange">Exchange</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="transaction-status"
            className="text-small text-muted"
            style={{ display: 'block', marginBottom: '0.35rem' }}
          >
            Status
          </label>

          <select
            id="transaction-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div
          style={{
            marginLeft: 'auto',
            alignSelf: 'flex-end',
          }}
        >
          <strong>{filteredTransactions.length}</strong>{' '}
          <span className="text-muted">
            transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 ? (
        <div className="paper-card">
          <EmptyState
            title={
              transactions.length === 0
                ? 'No Transactions Yet'
                : 'No Matching Transactions'
            }
            message={
              transactions.length === 0
                ? 'Your borrow and exchange activity will appear here.'
                : 'Try changing the filters to view other transactions.'
            }
          />

          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link to="/books">
                <Button>Browse Books</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1rem',
          }}
        >
          {filteredTransactions.map((transaction) => {
            const book = transaction.book;
            const otherParticipant = getOtherParticipant(transaction);
            const bookImage = getBookImage(book);

            return (
              <div
                key={transaction._id}
                className="paper-card"
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Book Image */}
                <div
                  style={{
                    width: '100px',
                    height: '135px',
                    flexShrink: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#f1eadf',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {bookImage ? (
                    <img
                      src={bookImage}
                      alt={book?.title || 'Book'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span
                      className="text-muted"
                      style={{
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        padding: '0.5rem',
                      }}
                    >
                      No Cover
                    </span>
                  )}
                </div>

                {/* Transaction Details */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <h3
                        className="text-deep-brown"
                        style={{ marginBottom: '0.25rem' }}
                      >
                        {book?.title || 'Book unavailable'}
                      </h3>

                      <p className="text-muted">
                        {book?.author || 'Unknown author'}
                      </p>
                    </div>

                    <span className={getStatusClass(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '1rem',
                    }}
                  >
                    <div>
                      <span className="text-small text-muted">
                        Transaction Type
                      </span>

                      <div>
                        <strong>{getTypeLabel(transaction.type)}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-small text-muted">
                        Your Role
                      </span>

                      <div>
                        <strong>{getUserRole(transaction)}</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-small text-muted">
                        Other Participant
                      </span>

                      <div>
                        <strong>
                          {getParticipantName(otherParticipant)}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-small text-muted">
                        Request Date
                      </span>

                      <div>
                        <strong>
                          {formatDateTime(transaction.createdAt)}
                        </strong>
                      </div>
                    </div>

                    {transaction.returnDueDate && (
                      <div>
                        <span className="text-small text-muted">
                          Due Date
                        </span>

                        <div>
                          <strong>
                            {formatDate(transaction.returnDueDate)}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exchange Details */}
                  {transaction.type?.toLowerCase() === 'exchange' &&
                    transaction.offeredBook && (
                      <div
                        style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          background: '#f8f4ed',
                        }}
                      >
                        <span className="text-small text-muted">
                          Book Offered in Exchange
                        </span>

                        <div>
                          <strong>
                            {transaction.offeredBook.title ||
                              'Offered book'}
                          </strong>

                          {transaction.offeredBook.author && (
                            <span className="text-muted">
                              {' '}
                              by {transaction.offeredBook.author}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  {/* View Book */}
                  {book?._id && (
                    <div style={{ marginTop: '1rem' }}>
                      <Link to={`/books/${book._id}`}>
                        <Button variant="ghost" size="sm">
                          View Book
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryPage;