import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'provider':
        return '/provider/dashboard';
      case 'technician':
        return '/technician/dashboard';
      case 'customer':
      default:
        return '/customer/dashboard';
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
      <div className="hs-card p-5 text-center bg-white shadow-lg" style={{ maxWidth: '500px' }}>
        <div
          className="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '80px', height: '80px', fontSize: '2.5rem' }}
        >
          <i className="bi bi-shield-lock-fill"></i>
        </div>
        <h3 className="fw-bold text-dark mb-2">Access Denied (403)</h3>
        <p className="text-muted small mb-4">
          You do not have the required role permissions to access this page. Please sign in with an authorized account or return to your designated workspace.
        </p>
        <div className="d-flex justify-content-center gap-2">
          <Link to={getHomePath()} className="btn btn-primary rounded-pill px-4 fw-semibold">
            Return to My Dashboard
          </Link>
          <Link to="/" className="btn btn-outline-secondary rounded-pill px-4">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
