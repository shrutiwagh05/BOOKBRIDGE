
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import adminService from '../../services/adminService';

const StudentNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      setError('');
      const res = await adminService.getNotifications();
      setNotifications(res.data || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      setError(
        err.message ||
        'Unable to load notifications. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await adminService.markAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(
        err.message ||
        'Unable to mark notification as read.'
      );
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div className="paper-card" style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" className="text-terracotta text-small">
          &larr; Back to Dashboard
        </Link>

        <div className="flex-between" style={{ marginTop: '1rem' }}>
          <div>
            <h2>Notifications</h2>
            <p className="text-muted">
              View updates and messages about your BookBridge activity.
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

      <div className="paper-card">
        <h3>Notification Feed</h3>

        {loading ? (
          <p className="text-muted">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-muted">No notifications available yet.</p>
        ) : (
          notifications.map((notification) => (
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
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotificationsPage;
