import React from 'react';
import './ErrorAlert.css';

/**
 * Reusable Alert banner for warnings, errors, and system notices
 * @param {string} type - 'error' | 'warning' | 'info' | 'success'
 * @param {string} message - Alert text content
 * @param {function} onClose - Optional dismiss callback
 */
const ErrorAlert = ({ type = 'error', message, onClose, className = '' }) => {
  if (!message) return null;

  const icons = {
    error: '⚠️',
    warning: '📜',
    info: 'ℹ️',
    success: '✓',
  };

  return (
    <div className={`bb-alert bb-alert--${type} ${className}`} role="alert">
      <span className="bb-alert-icon">{icons[type] || '•'}</span>
      <div className="bb-alert-message">{message}</div>
      {onClose && (
        <button
          type="button"
          className="bb-alert-close"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
