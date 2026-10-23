import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorAlert from '../../components/common/ErrorAlert';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const result = await api.post('/auth/forgot-password', { email });
      setMessage(result.message || 'If an account exists for that email, a reset link will be sent.');
    } catch (err) {
      setError(err.message || 'Password reset is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bb-auth-page container">
      <div className="bb-auth-card paper-card">
        <div className="bb-auth-header">
          <span className="bb-auth-quill">✒️</span>
          <h2>Reset your password</h2>
          <p className="text-muted">Enter the email linked to your BookBridge account.</p>
        </div>
        <ErrorAlert message={error} onClose={() => setError('')} />
        {message && <p role="status">{message}</p>}
        <form onSubmit={handleSubmit} className="bb-auth-form">
          <Input label="Email Address" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="bb-auth-submit">Send reset link</Button>
        </form>
        <div className="bb-auth-footer"><Link to="/login" className="bb-auth-link">Back to sign in</Link></div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
