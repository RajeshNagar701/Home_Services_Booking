import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
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

  // Quick Switcher for instant evaluator demo
  const quickLoginAs = async (email, password, roleName) => {
    setIsLoggingIn(true);
    const res = await login(email, password);
    setIsLoggingIn(false);
    if (res.success) {
      showToast(`Logged in as ${roleName}`, 'success');
      switch (res.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'provider':
          navigate('/provider/dashboard');
          break;
        case 'technician':
          navigate('/technician/dashboard');
          break;
        case 'customer':
          navigate('/customer/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      showToast(res.message || 'Quick login failed', 'error');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2 py-lg-3 shadow-sm">
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '38px', height: '38px', fontSize: '1.25rem' }}
          >
            <i className="bi bi-tools"></i>
          </div>
          <div>
            <span className="fw-bolder fs-5 text-dark tracking-tight">HomeServe</span>
            <span className="text-primary fw-bold ms-1" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              TECH
            </span>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold">
            <li className="nav-item">
              <Link to="/" className="nav-link text-secondary px-3">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/services" className="nav-link text-secondary px-3">
                Explore Services
              </Link>
            </li>
            <li className="nav-item">
              <a href="/#how-it-works" className="nav-link text-secondary px-3">
                How It Works
              </a>
            </li>
            <li className="nav-item">
              <a href="/#verified-pros" className="nav-link text-secondary px-3">
                Verified Pros
              </a>
            </li>
          </ul>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {/* Quick Demo Switcher Dropdown */}
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm dropdown-toggle fw-semibold rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                type="button"
                id="demoRolesDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                disabled={isLoggingIn}
              >
                <i className="bi bi-lightning-charge-fill text-warning"></i>
                <span className="d-none d-sm-inline">Demo Roles</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2" aria-labelledby="demoRolesDropdown" style={{ borderRadius: '12px', minWidth: '240px' }}>
                <li className="dropdown-header text-uppercase text-muted fw-bold" style={{ fontSize: '0.7rem' }}>
                  1-Click Role Switcher
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 rounded-2 d-flex align-items-center gap-2"
                    onClick={() => quickLoginAs('admin@homeserve.tech', 'AdminPassword123!', 'Super Admin')}
                  >
                    <span className="badge bg-danger-subtle text-danger rounded-pill px-2">Admin</span>
                    <span className="fw-medium">Platform Admin</span>
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 rounded-2 d-flex align-items-center gap-2"
                    onClick={() => quickLoginAs('apex.homes@homeserve.tech', 'ProviderPassword123!', 'Apex Provider')}
                  >
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2">Provider</span>
                    <span className="fw-medium">Apex Home Solutions</span>
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 rounded-2 d-flex align-items-center gap-2"
                    onClick={() => quickLoginAs('rahul.tech@homeserve.tech', 'TechPassword123!', 'Field Technician')}
                  >
                    <span className="badge bg-info-subtle text-info rounded-pill px-2">Technician</span>
                    <span className="fw-medium">Rahul Sharma</span>
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item py-2 rounded-2 d-flex align-items-center gap-2"
                    onClick={() => quickLoginAs('john.doe@gmail.com', 'CustomerPassword123!', 'Customer')}
                  >
                    <span className="badge bg-success-subtle text-success rounded-pill px-2">Customer</span>
                    <span className="fw-medium">John Doe</span>
                  </button>
                </li>
              </ul>
            </div>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  className="btn btn-primary btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: '22px', height: '22px', objectFit: 'cover' }}
                  />
                  <span>Dashboard ({user.role})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center text-muted"
                  style={{ width: '36px', height: '36px' }}
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-semibold">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3 py-2 fw-semibold">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
