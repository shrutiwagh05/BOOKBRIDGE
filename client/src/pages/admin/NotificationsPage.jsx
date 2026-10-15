import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
const [selectedUser, setSelectedUser] = useState('');
const [messageTitle, setMessageTitle] = useState('');
const [messageText, setMessageText] = useState('');
const [sending, setSending] = useState(false);
const [sendSuccess, setSendSuccess] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await adminService.getNotifications();

      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchNotifications();

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data?.data ?? res.data ?? []);
    } catch (err) {
      setError(err.message || 'Unable to load users.');
    }
  };

  fetchUsers();
}, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await adminService.markAsRead(notificationId);

      
const updatedNotification = res.data?.data ?? res.data;

const previousNotification = notifications.find(
  (notification) => notification._id === updatedNotification._id
);

setNotifications((current) =>
  current.map((notification) =>
    notification._id === updatedNotification._id
      ? updatedNotification
      : notification
  )
);

if (previousNotification && !previousNotification.isRead && updatedNotification.isRead) {
  setUnreadCount((current) => Math.max(0, current - 1));
}

    } catch (err) {
      setError(err.message || 'Unable to mark notification as read.');
    }
  };
  const handleSendNotification = async (event) => {
  event.preventDefault();

  if (!selectedUser || !messageTitle.trim() || !messageText.trim()) {
    setError('Please select a user and enter both title and message.');
    return;
  }

  try {
    setSending(true);
    setError('');
    setSendSuccess('');

    await adminService.sendNotification(selectedUser, {
      title: messageTitle.trim(),
      message: messageText.trim(),
    });

    setMessageTitle('');
    setMessageText('');
    setSelectedUser('');
    setSendSuccess('Notification sent successfully.');
  } catch (err) {
    setError(err.message || 'Unable to send notification.');
  } finally {
    setSending(false);
  }
};

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Link to="/admin" className="text-terracotta text-small">
          &larr; Back to Admin Overview
        </Link>

        <div style={{ marginTop: '0.75rem' }}>
          
        </div>

        <div className="flex-between" style={{ marginTop: '0.5rem' }}>
          <div>
            <h2>Campus System Notifications</h2>
            <p className="text-muted">
              Monitor system notifications and user activity alerts.
            </p>
          </div>

          <div className="paper-card" style={{ padding: '0.75rem 1rem' }}>
            <strong>{unreadCount}</strong>
            <span className="text-muted text-small"> unread</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="paper-card" style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      <div className="paper-card" style={{ marginBottom: '2rem' }}>
  <h3>Send Admin Message</h3>

  <p className="text-muted">
    Send a system notification directly to a registered student.
  </p>

  <form onSubmit={handleSendNotification}>
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="notification-user">
        Select User
      </label>

      <select
        id="notification-user"
        value={selectedUser}
        onChange={(event) => setSelectedUser(event.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginTop: '0.5rem',
        }}
      >
        <option value="">Select a user</option>

        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.name} — {user.email}
          </option>
        ))}
      </select>
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="notification-title">
        Title
      </label>

      <input
        id="notification-title"
        type="text"
        value={messageTitle}
        onChange={(event) => setMessageTitle(event.target.value)}
        placeholder="Notification title"
        style={{
          width: '100%',
          padding: '0.75rem',
          marginTop: '0.5rem',
        }}
      />
    </div>

    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="notification-message">
        Message
      </label>

      <textarea
        id="notification-message"
        value={messageText}
        onChange={(event) => setMessageText(event.target.value)}
        placeholder="Write your message..."
        rows="4"
        style={{
          width: '100%',
          padding: '0.75rem',
          marginTop: '0.5rem',
        }}
      />
    </div>

    <Button type="submit" disabled={sending}>
      {sending ? 'Sending...' : 'Send Notification'}
    </Button>

    {sendSuccess && (
      <p className="text-muted" style={{ marginTop: '1rem' }}>
        {sendSuccess}
      </p>
    )}
  </form>
</div>

      <div className="paper-card">
        <h3>Notification Feed</h3>


        {loading ? (
          <p className="text-muted">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-muted">
            No notifications available yet.
          </p>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  padding: '1rem 0',
                  borderBottom: '1px solid var(--color-muted-taupe)',
                  opacity: notification.isRead ? 0.7 : 1,
                }}
              >
                <div className="flex-between">
                  <div>
                    <h4 style={{ marginBottom: '0.35rem' }}>
                      {notification.title}
                    </h4>

                    <p style={{ marginBottom: '0.35rem' }}>
                      {notification.message}
                    </p>

                    <span className="text-muted text-small">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
