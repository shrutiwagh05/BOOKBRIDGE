import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorAlert from '../../components/common/ErrorAlert';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMsg(result.error || 'Unable to sign in. Please verify your credentials.');
    }
  };

  return (
    <div className="bb-auth-page container">
      <div className="bb-auth-card paper-card">
        <div className="bb-auth-header">
          <span className="bb-auth-quill">✒️</span>
          <h2>Sign In to BookBridge</h2>
          <p className="text-muted">Enter your campus library credentials</p>
        </div>

        <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />

        <form onSubmit={handleSubmit} className="bb-auth-form">
          <Input
            label="College Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@college.edu"
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="bb-auth-submit"
          >
            Access My Library Shelf
          </Button>
        </form>

        <div className="bb-auth-footer">
          <p className="text-small text-muted">
            New to the campus library?{' '}
            <Link to="/register" className="bb-auth-link">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
