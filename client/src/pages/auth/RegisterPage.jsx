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
    college: '',
    department: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="bb-auth-page container">
      <div className="bb-auth-card paper-card">
        <div className="bb-auth-header">
          <span className="bb-auth-quill">📜</span>
          <h2>Register for BookBridge</h2>
          <p className="text-muted">Join your college community to exchange books</p>
        </div>

        <ErrorAlert message={errorMsg} onClose={() => setErrorMsg('')} />

        <form onSubmit={handleSubmit} className="bb-auth-form">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Shruti Wagh"
            required
          />

          <Input
            label="College Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="student@college.edu"
            required
          />

          <div className="grid-2">
            <Input
              label="College Name"
              name="college"
              value={formData.college}
              onChange={handleChange}
              placeholder="e.g. Engineering College"
            />
            <Input
              label="Department / Major"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
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
