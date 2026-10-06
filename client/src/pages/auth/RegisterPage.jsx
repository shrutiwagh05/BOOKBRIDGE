import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ErrorAlert from '../../components/common/ErrorAlert';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    department: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMsg) {
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Required field validation
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    // Name validation
    if (name.length < 2) {
      setErrorMsg('Please enter a valid name.');
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const result = await register({
        name,
        email,
        password,
        college: formData.college.trim(),
        department: formData.department.trim(),
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bb-auth-page container">
      <div className="bb-auth-card paper-card">
        <div className="bb-auth-header">
          <span className="bb-auth-quill">📜</span>

          <h2>Register for BookBridge</h2>

          <p className="text-muted">
            Join your college community to exchange books
          </p>
        </div>

        <ErrorAlert
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />

        <form onSubmit={handleSubmit} className="bb-auth-form">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@example.com"
            required
          />

          <div className="grid-2">
            <Input
              label="College Name"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="Your college"
            />

            <Input
              label="Department / Major"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Engineering"
            />
          </div>

          <Input
            label="Create Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Enter password again"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="bb-auth-submit"
          >
            Create Student Account
          </Button>
        </form>

        <div className="bb-auth-footer">
          <p className="text-small text-muted">
            Already registered?{' '}
            <Link to="/login" className="bb-auth-link">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;