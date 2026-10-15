import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      const res = await adminService.getUsers(params);

      setUsers(res.data?.data ?? res.data ?? []);
    } catch (err) {
      setError('Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [status]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (user) => {
    const newStatus = !user.isActive;

    try {
      setUpdatingUserId(user._id);
      setError('');

      const res = await adminService.updateUserStatus(
        user._id,
        newStatus
      );

      const updatedUser = res.data?.data ?? res.data;

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser._id === updatedUser._id
            ? updatedUser
            : currentUser
        )
      );
    } catch (err) {
      setError('Unable to update user status.');
    } finally {
      setUpdatingUserId('');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Header */}
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
            

            <h2 style={{ marginTop: '0.5rem' }}>
              User Management
            </h2>

            <p className="text-muted">
              View registered users and manage account status.
            </p>
          </div>

          <Link to="/admin">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="paper-card" style={{ marginBottom: '1.5rem' }}>
        <form
          onSubmit={handleSearch}
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'end',
          }}
        >
          <div style={{ flex: '1 1 280px' }}>
            <label
              htmlFor="user-search"
              className="text-small"
              style={{ display: 'block', marginBottom: '0.4rem' }}
            >
              Search Users
            </label>

            <input
              id="user-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-muted-taupe)',
                borderRadius: '6px',
                background: 'var(--color-warm-ivory)',
              }}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <label
              htmlFor="user-status"
              className="text-small"
              style={{ display: 'block', marginBottom: '0.4rem' }}
            >
              Status
            </label>

            <select
              id="user-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-muted-taupe)',
                borderRadius: '6px',
                background: 'var(--color-warm-ivory)',
              }}
            >
              <option value="">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div
          className="paper-card"
          style={{
            marginBottom: '1.5rem',
            borderLeft: '4px solid var(--color-terracotta)',
          }}
        >
          <p className="text-muted">{error}</p>
        </div>
      )}

      {/* Users */}
      <div className="paper-card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div>
            <h3>Registered Users</h3>
            <p className="text-muted text-small">
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-muted">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-muted">
            No users found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '850px',
              }}
            >
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Name</th>
                  <th style={tableHeaderStyle}>Email</th>
                  <th style={tableHeaderStyle}>College</th>
                  <th style={tableHeaderStyle}>Department</th>
                  <th style={tableHeaderStyle}>Role</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td style={tableCellStyle}>
                      <strong>{user.name}</strong>
                    </td>

                    <td style={tableCellStyle}>
                      {user.email}
                    </td>

                    <td style={tableCellStyle}>
                      {user.college || '—'}
                    </td>

                    <td style={tableCellStyle}>
                      {user.department || '—'}
                    </td>

                    <td style={tableCellStyle}>
                      {user.role || 'student'}
                    </td>

                    <td style={tableCellStyle}>
                      <Badge
                        variant={
                          user.isActive
                            ? 'success'
                            : 'terracotta'
                        }
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>

                    <td style={tableCellStyle}>
                      <Button
                        variant="outline"
                        disabled={updatingUserId === user._id}
                        onClick={() => handleStatusChange(user)}
                      >
                        {updatingUserId === user._id
                          ? 'Updating...'
                          : user.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  textAlign: 'left',
  padding: '0.9rem',
  borderBottom: '2px solid var(--color-muted-taupe)',
  color: 'var(--color-deep-brown)',
  fontWeight: '600',
};

const tableCellStyle = {
  padding: '0.9rem',
  borderBottom: '1px solid var(--color-muted-taupe)',
  verticalAlign: 'middle',
};

export default UserManagementPage;