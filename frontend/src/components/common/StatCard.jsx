import React from 'react';

const StatCard = ({ title, value, icon, change, isPositive = true, color = 'primary' }) => {
  return (
    <div className="hs-card p-3 p-md-4 h-100 position-relative overflow-hidden">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <h3 className="fw-bold mt-1 mb-0 text-dark">{value}</h3>
        </div>
        <div
          className={`rounded-3 d-flex align-items-center justify-content-center bg-${color}-subtle text-${color}`}
          style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}
        >
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      {change && (
        <div className="mt-2 d-flex align-items-center" style={{ fontSize: '0.8rem' }}>
          <span className={`fw-semibold ${isPositive ? 'text-success' : 'text-danger'} me-1`}>
            <i className={`bi bi-arrow-${isPositive ? 'up' : 'down'}-short`}></i>
            {change}
          </span>
          <span className="text-muted">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
