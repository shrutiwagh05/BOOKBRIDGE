import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Reusable Modal component for forms, previews, and confirmations
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal heading title
 * @param {React.ReactNode} children - Modal content body
 * @param {React.ReactNode} footer - Optional custom footer actions
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="bb-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`bb-modal-container bb-modal--${size} ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        {/* Header */}
        <div className="bb-modal-header">
          <h3 className="bb-modal-title">{title}</h3>
          <button
            type="button"
            className="bb-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div className="bb-modal-body">{children}</div>

        {/* Footer (if provided) */}
        {footer && <div className="bb-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
