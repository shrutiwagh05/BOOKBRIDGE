import React from 'react';
import './Loader.css';

/**
 * Reusable loading indicator styled as a turning book page / spinning quill
 * @param {string} text - Optional status message
 * @param {boolean} fullPage - Center inside entire viewport
 */
const Loader = ({ text = 'Retrieving records...', fullPage = false }) => {
  return (
    <div className={`bb-loader-container ${fullPage ? 'bb-loader--fullscreen' : ''}`}>
      <div className="bb-quill-spinner">
        <div className="bb-spinner-ring"></div>
        <span className="bb-spinner-symbol">✦</span>
      </div>
      {text && <p className="bb-loader-text">{text}</p>}
    </div>
  );
};

export default Loader;
