import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const ProfilePage = () => {
  const { user: authUser, setUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState({
    listingsCount: 0,
    borrowedCount: 0,
    lentCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await userService.getProfile();
        const profileData = response.data;

        setProfile(profileData.user);

        setActivity({
          listingsCount: profileData.listingsCount || 0,
          borrowedCount: profileData.borrowedCount || 0,
          lentCount: profileData.lentCount || 0,
        });

        if (profileData.user) {
          setUser(profileData.user);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to load profile'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [setUser]);

  const displayUser = profile || authUser;

  const getInitials = (name) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="paper-card">
          <p className="text-muted">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <div className="paper-card">
          <h3>Unable to load profile</h3>

          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            {error}
          </p>

          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Page Heading */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Badge variant="terracotta">My Account</Badge>

        <h2 style={{ marginTop: '0.5rem', marginBottom: '0.35rem' }}>
          My Profile
        </h2>

        <p className="text-muted">
          View your BookBridge account information and activity.
        </p>
      </div>

      {/* Profile Header */}
      <div
        className="paper-card"
        style={{
          marginBottom: '1.5rem',
          padding: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar */}
          {displayUser?.avatar ? (
            <img
              src={displayUser.avatar}
              alt={displayUser.name || 'User'}
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--color-terracotta)',
              }}
            />
          ) : (
            <div
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-terracotta)',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: '700',
              }}
            >
              {getInitials(displayUser?.name)}
            </div>
          )}

          {/* User Information */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <h2 style={{ marginBottom: '0.35rem' }}>
              {displayUser?.name || 'BookBridge User'}
            </h2>

            <p className="text-muted" style={{ marginBottom: '0.5rem' }}>
              {displayUser?.email || 'No email available'}
            </p>

            <Badge variant="success">
              {displayUser?.role === 'admin'
                ? 'Administrator'
                : 'BookBridge Member'}
            </Badge>
          </div>

          {/* Edit Profile */}
          <Link to="/profile/edit">
            <Button variant="primary">Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Activity */}
      <div
        className="grid-3"
        style={{
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="paper-card">
          <p className="text-muted text-small">Books Listed</p>

          <h2
            className="text-terracotta"
            style={{ marginTop: '0.35rem' }}
          >
            {activity.listingsCount}
          </h2>

          <p className="text-muted text-small">
            Books currently associated with your account
          </p>
        </div>

        <div className="paper-card">
          <p className="text-muted text-small">Books Borrowed</p>

          <h2
            className="text-deep-brown"
            style={{ marginTop: '0.35rem' }}
          >
            {activity.borrowedCount}
          </h2>

          <p className="text-muted text-small">
            Currently active borrowed books
          </p>
        </div>

        <div className="paper-card">
          <p className="text-muted text-small">Books Lent</p>

          <h2
            style={{
              marginTop: '0.35rem',
              color: 'var(--color-success)',
            }}
          >
            {activity.lentCount}
          </h2>

          <p className="text-muted text-small">
            Currently lent to other users
          </p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="paper-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>
          Personal Information
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div>
            <p className="text-muted text-small">Full Name</p>

            <p style={{ marginTop: '0.25rem', fontWeight: '600' }}>
              {displayUser?.name || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-muted text-small">Email</p>

            <p style={{ marginTop: '0.25rem', fontWeight: '600' }}>
              {displayUser?.email || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-muted text-small">Phone</p>

            <p style={{ marginTop: '0.25rem', fontWeight: '600' }}>
              {displayUser?.phone || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-muted text-small">College</p>

            <p style={{ marginTop: '0.25rem', fontWeight: '600' }}>
              {displayUser?.college || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-muted text-small">Department</p>

            <p style={{ marginTop: '0.25rem', fontWeight: '600' }}>
              {displayUser?.department || 'Not provided'}
            </p>
          </div>

          <div>
            <p className="text-muted text-small">Rating</p>

            <p style={{ marginTop: '0.25rem', fontWeight: '600' }}>
              {displayUser?.rating
                ? `${displayUser.rating} ★`
                : 'Not rated yet'}
            </p>
          </div>
        </div>
      </div>

      {/* About Me */}
      <div className="paper-card">
        <h3 style={{ marginBottom: '1rem' }}>
          About Me
        </h3>

        <p
          className={displayUser?.bio ? '' : 'text-muted'}
          style={{
            lineHeight: '1.7',
            whiteSpace: 'pre-wrap',
          }}
        >
          {displayUser?.bio ||
            'You have not added a bio yet. You can add one from Edit Profile.'}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;