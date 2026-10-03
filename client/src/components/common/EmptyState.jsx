import React from 'react';
import Button from './Button';
import './EmptyState.css';

/**
 * Reusable Empty State view when no items / books are found
 * @param {string} icon - Emoji or symbol
 * @param {string} title - Heading message
 * @param {string} description - Explanation or encouragement
 * @param {string} actionLabel - Optional button label
 * @param {function} onAction - Optional button callback
 */
const EmptyState = ({
  icon = '📚',
  title = 'No Volumes Found',
  description = 'There are currently no listings matching your criteria in the library archive.',
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <div className="bb-empty-state">
      <div className="bb-empty-icon">{icon}</div>
      <h3 className="bb-empty-title">{title}</h3>
      <p className="bb-empty-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
};

export default EmptyState;
