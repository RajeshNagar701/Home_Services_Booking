import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill">SUPER ADMIN</span>;
      case 'provider':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill">SERVICE PROVIDER</span>;
      case 'technician':
        return <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1 rounded-pill">FIELD TECHNICIAN</span>;
      case 'customer':
      default:
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">CUSTOMER</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Role-Specific Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Header Bar */}
        <header className="dashboard-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light d-lg-none p-1 px-2 border"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Navigation"
            >
              <i className="bi bi-list fs-5"></i>
            </button>
            <div className="d-none d-sm-flex align-items-center gap-2">
              <span className="text-muted small fw-medium">Active Workspace:</span>
              {getRoleBadge()}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/services" className="btn btn-outline-primary btn-sm rounded-pill d-none d-md-flex align-items-center gap-1 fw-semibold px-3">
              <i className="bi bi-search"></i>
              <span>Find Services</span>
            </Link>

            {/* Notification Bell */}
            <div className="dropdown">
              <button
                className="btn btn-light rounded-circle p-2 position-relative border"
                style={{ width: '38px', height: '38px' }}
                type="button"
                id="notifDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-bell text-secondary"></i>
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                  <span className="visually-hidden">Alerts</span>
                </span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-2" aria-labelledby="notifDropdown" style={{ width: '300px', borderRadius: '12px' }}>
                <li className="dropdown-header d-flex justify-content-between align-items-center fw-bold">
                  <span>Notifications</span>
                  <span className="badge bg-primary-subtle text-primary">Live</span>
                </li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li className="p-2 small text-muted">
                  <div className="fw-semibold text-dark">System Ready</div>
                  <div>Welcome to HomeServe Technologies. All services & tracking features are operational.</div>
                </li>
              </ul>
            </div>

            {/* User Mini Avatar & Name */}
            <div className="d-flex align-items-center gap-2 ps-2 border-start">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="Avatar"
                className="rounded-circle border"
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              />
              <div className="d-none d-md-block text-start" style={{ lineHeight: '1.2' }}>
                <div className="fw-bold text-dark small">{user?.firstName}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="dashboard-content animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
