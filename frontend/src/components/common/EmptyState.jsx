import React from 'react';

const EmptyState = ({
  icon = 'bi-inbox',
  title = 'No items found',
  message = 'There are currently no records to display.',
  actionText = null,
  onAction = null
}) => {
  return (
    <div className="hs-card p-5 text-center my-4 animate-fade-in">
      <div
        className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3 text-muted"
        style={{ width: '70px', height: '70px', fontSize: '2rem' }}
      >
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted mx-auto mb-3" style={{ maxWidth: '400px', fontSize: '0.9rem' }}>
        {message}
      </p>
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm px-4" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
