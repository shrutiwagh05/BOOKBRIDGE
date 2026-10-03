import React from 'react';
import './Badge.css';

/**
 * Reusable Badge component for listing types, book conditions, and transaction statuses
 * @param {string} variant - 'sell', 'borrow', 'exchange', 'condition', 'success', 'warning', 'danger', 'info'
 * @param {string} size - 'sm', 'md'
 */
const Badge = ({ children, variant = 'info', size = 'sm', className = '' }) => {
  // Normalize variant strings to handle lowercase/uppercase inputs
  const normalizedVariant = variant.toLowerCase().replace(/\s+/g, '-');

  return (
    <span className={`bb-badge bb-badge--${normalizedVariant} bb-badge--${size} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
