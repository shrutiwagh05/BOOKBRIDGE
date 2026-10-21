import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorAlert from '../../components/common/ErrorAlert';
import './AuthPages.css';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!token) return setError('This reset link is missing its token. Request a new link.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const result = await api.post('/auth/reset-password', { token, password });
      setMessage(result.message || 'Password reset successfully.');
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err.message || 'This reset link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bb-auth-page container">
      <div className="bb-auth-card paper-card">
        <div className="bb-auth-header">
          <span className="bb-auth-quill">✒️</span>
          <h2>Choose a new password</h2>
          <p className="text-muted">Reset links expire after 15 minutes.</p>
        </div>
        <ErrorAlert message={error} onClose={() => setError('')} />
        {message && <p role="status">{message}</p>}
        <form onSubmit={handleSubmit} className="bb-auth-form">
          <Input label="New password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          <Input label="Confirm new password" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required />
          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="bb-auth-submit">Update password</Button>
        </form>
        <div className="bb-auth-footer"><Link to="/login" className="bb-auth-link">Back to sign in</Link></div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
