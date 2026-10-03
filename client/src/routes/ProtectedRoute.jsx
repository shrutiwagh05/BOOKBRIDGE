import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

/**
 * Route wrapper that redirects unauthenticated users to /login
 * @param {string} requireRole - Optional role check (e.g. 'admin')
 */
const ProtectedRoute = ({ children, requireRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader fullPage text="Checking library credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
