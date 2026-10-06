import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    bio: '',
    avatar: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await userService.getProfile();
        const profileUser = response.data.user;

        setFormData({
          name: profileUser?.name || '',
          email: profileUser?.email || '',
          phone: profileUser?.phone || '',
          college: profileUser?.college || '',
          department: profileUser?.department || '',
          bio: profileUser?.bio || '',
          avatar: profileUser?.avatar || '',
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Unable to load your profile'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (formData.name.trim().length < 2) {
      setError('Name must contain at least 2 characters.');
      return;
    }

    try {
      setIsSaving(true);

      const updatedData = {
        name: formData.name.trim(),
        college: formData.college.trim(),
        department: formData.department.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar.trim(),
      };

      const response = await userService.updateProfile(updatedData);

      const updatedUser = response.data.data;

      if (updatedUser) {
        setUser(updatedUser);
      }

      setSuccess('Profile updated successfully.');

      // Give the success message time to appear,
      // then go directly to the correct profile URL.
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to update your profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/profile';
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

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Badge variant="terracotta">My Account</Badge>

        <h2 style={{ marginTop: '0.5rem', marginBottom: '0.35rem' }}>
          Edit Profile
        </h2>

        <p className="text-muted">
          Update your BookBridge account information.
        </p>
      </div>

      <div
        className="paper-card"
        style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: '0.9rem 1rem',
                marginBottom: '1.25rem',
                borderRadius: '8px',
                background: '#fdecec',
                color: '#a33a3a',
                border: '1px solid #f2c2c2',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: '0.9rem 1rem',
                marginBottom: '1.25rem',
                borderRadius: '8px',
                background: '#eaf7ed',
                color: '#2f7d3f',
                border: '1px solid #bfe3c6',
              }}
            >
              {success}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              disabled
            />

            <p
              className="text-muted text-small"
              style={{ marginTop: '0.35rem' }}
            >
              Email cannot be changed from your profile.
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <Input
              label="College"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="Enter your college"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter your department"
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <Input
              label="Profile Photo URL"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="Paste an image URL"
            />

            <p
              className="text-muted text-small"
              style={{ marginTop: '0.35rem' }}
            >
              Optional. You can add an image URL later.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="bio"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
              }}
            >
              About Me
            </label>

            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell other BookBridge users a little about yourself..."
              rows="5"
              style={{
                width: '100%',
                padding: '0.8rem',
                border: '1px solid #d8cfc5',
                borderRadius: '8px',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '1rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;