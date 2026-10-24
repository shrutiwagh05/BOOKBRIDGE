import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const RequestManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (status) params.status = status;
      if (type) params.type = type;
      if (search.trim()) params.search = search.trim();

      const response = await adminService.getRequests(params);
      setRequests(response.data?.data ?? response.data ?? []);
    } catch (err) {
      setError('Unable to load requests and transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFilter = (event) => {
    event.preventDefault();
    fetchRequests();
  };

  const getStatusVariant = (requestStatus) => {
    if (
      requestStatus === 'completed' ||
      requestStatus === 'returned' ||
      requestStatus === 'accepted' ||
      requestStatus === 'approved'
    ) {
      return 'success';
    }

    if (
      requestStatus === 'rejected' ||
      requestStatus === 'cancelled'
    ) {
      return 'outline';
    }

    return 'terracotta';
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <section className="paper-card" style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin" className="text-small text-terracotta">
          &larr; Back to Dashboard
        </Link>

        <div style={{ marginTop: '0.5rem' }}>
          

          <h1>Requests & Transactions</h1>

          <p className="text-muted">
            Monitor borrowing, exchange, purchase requests and transaction
            progress across the platform.
          </p>
        </div>
      </section>

      <section className="paper-card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleFilter}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              alignItems: 'end',
            }}
          >
            <div>
              <label htmlFor="request-search">Search</label>
              <input
                id="request-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Book, requester, or owner"
              />
            </div>
            <div>
              <label>Status</label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="returned">Returned</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label>Request Type</label>

              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="">All Types</option>
                <option value="borrow">Borrow</option>
                <option value="exchange">Exchange</option>
                <option value="purchase">Purchase</option>
              </select>
            </div>

            <Button type="submit">
              Apply Filters
            </Button>
          </div>
        </form>
      </section>

      {error && (
        <div
          className="paper-card"
          style={{
            marginBottom: '1.5rem',
            borderLeft: '4px solid var(--color-terracotta)',
          }}
        >
          {error}
        </div>
      )}

      <section className="paper-card">
        <div style={{ marginBottom: '1rem' }}>
          <h2>Requests & Transactions</h2>

          <p className="text-muted">
            {loading
              ? 'Loading...'
              : `${requests.length} request(s) found`}
          </p>
        </div>

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ padding: '2rem 0' }}>
            <h3>No requests found</h3>

            <p className="text-muted">
              There are currently no requests or transactions matching your
              filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Requester</th>
                  <th>Owner</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <strong>
                        {request.book?.title || 'Unknown Book'}
                      </strong>

                      {request.book?.author && (
                        <>
                          <br />
                          <span className="text-small text-muted">
                            {request.book.author}
                          </span>
                        </>
                      )}
                    </td>

                    <td>
                      {request.requester?.name || 'Unknown'}
                      <br />
                      <span className="text-small text-muted">
                        {request.requester?.email || ''}
                      </span>
                    </td>

                    <td>
                      {request.owner?.name || 'Unknown'}
                      <br />
                      <span className="text-small text-muted">
                        {request.owner?.email || ''}
                      </span>
                    </td>

                    <td>
                      {request.type || '—'}
                    </td>

                    <td>
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status || 'unknown'}
                      </Badge>
                    </td>

                    <td>
                      {request.durationDays
                        ? `${request.durationDays} days`
                        : '—'}
                    </td>

                    <td>
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default RequestManagementPage;