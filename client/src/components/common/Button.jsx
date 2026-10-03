import React from 'react';
import './Button.css';

/**
 * Reusable Button component for Paper & Ink theme
 * @param {string} variant - 'primary' (terracotta), 'secondary' (deep brown), 'outline', 'ghost', 'danger'
 * @param {string} size - 'sm', 'md', 'lg'
 * @param {boolean} isLoading - show loading spinner inside button
 * @param {React.ReactNode} children - Button label/content
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`bb-btn bb-btn--${variant} bb-btn--${size} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="bb-btn-loader">
          <span className="bb-btn-spinner"></span>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
