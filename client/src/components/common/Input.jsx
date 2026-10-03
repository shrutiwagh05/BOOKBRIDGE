import React from 'react';
import './Input.css';

/**
 * Reusable Input component styled with the Paper & Ink theme
 * Supports standard text/number inputs, textareas, and select elements
 */
const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  rows = 4,
  options = [],
  className = '',
  ...props
}) => {
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  return (
    <div className={`bb-input-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="bb-input-label">
          {label} {required && <span className="bb-input-required">*</span>}
        </label>
      )}

      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className="bb-input-field bb-textarea"
          {...props}
        />
      ) : isSelect ? (
        <div className="bb-select-wrapper">
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="bb-input-field bb-select"
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value !== undefined ? opt.value : opt}>
                {opt.label !== undefined ? opt.label : opt}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="bb-input-field"
          {...props}
        />
      )}

      {error ? (
        <span className="bb-input-error-msg">{error}</span>
      ) : helperText ? (
        <span className="bb-input-helper-msg">{helperText}</span>
      ) : null}
    </div>
  );
};

export default Input;
