import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <p className="mt-3 text-muted fw-medium mb-0">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-white bg-opacity-75 position-fixed top-0 start-0 w-100 h-100"
        style={{ zIndex: 9999 }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
