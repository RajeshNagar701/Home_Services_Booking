import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Platform Analytics' },
          { to: '/admin/providers', icon: 'bi-patch-check', label: 'Provider Verification' },
          { to: '/admin/customers', icon: 'bi-people', label: 'Customers' },
          { to: '/admin/categories', icon: 'bi-tags', label: 'Categories' },
          { to: '/admin/services', icon: 'bi-briefcase', label: 'Services Catalog' },
          { to: '/admin/bookings', icon: 'bi-calendar-check', label: 'Bookings Ledger' },
          { to: '/admin/commissions', icon: 'bi-cash-coin', label: 'Commissions & Payouts' },
          { to: '/admin/complaints', icon: 'bi-exclamation-octagon', label: 'Customer Complaints' },
          { to: '/admin/coupons', icon: 'bi-percent', label: 'Promotions & Coupons' }
        ];
      case 'provider':
        return [
          { to: '/provider/dashboard', icon: 'bi-grid-1x2', label: 'Overview' },
          { to: '/provider/bookings', icon: 'bi-inbox', label: 'Booking Requests' },
          { to: '/provider/services', icon: 'bi-briefcase', label: 'My Services' },
          { to: '/provider/availability', icon: 'bi-clock-history', label: 'Working Hours' },
          { to: '/provider/technicians', icon: 'bi-people', label: 'Technician Staff' },
          { to: '/provider/earnings', icon: 'bi-wallet2', label: 'Earnings & Statements' },
          { to: '/provider/kyc', icon: 'bi-file-earmark-check', label: 'KYC Documents' },
          { to: '/provider/reviews', icon: 'bi-star', label: 'Customer Reviews' },
          { to: '/provider/profile', icon: 'bi-building', label: 'Business Profile' }
        ];
      case 'technician':
        return [
          { to: '/technician/dashboard', icon: 'bi-speedometer2', label: 'Field Dashboard' },
          { to: '/technician/jobs', icon: 'bi-wrench-adjustable', label: 'Assigned Jobs' },
          { to: '/technician/profile', icon: 'bi-person-badge', label: 'My Profile' }
        ];
      case 'customer':
      default:
        return [
          { to: '/customer/dashboard', icon: 'bi-grid-1x2', label: 'My Dashboard' },
          { to: '/customer/bookings', icon: 'bi-calendar-check', label: 'My Bookings' },
          { to: '/customer/addresses', icon: 'bi-geo-alt', label: 'Saved Addresses' },
          { to: '/customer/complaints', icon: 'bi-shield-exclamation', label: 'Complaints' },
          { to: '/customer/profile', icon: 'bi-person-gear', label: 'Profile Settings' },
          { to: '/services', icon: 'bi-plus-circle', label: 'Book New Service' }
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'show' : ''}`}>
      {/* Sidebar Header */}
      <div className="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', fontSize: '1.1rem' }}
          >
            <i className="bi bi-tools"></i>
          </div>
          <div>
            <span className="fw-bolder fs-6 text-white tracking-tight">HomeServe</span>
            <span className="badge bg-primary ms-1 py-0 px-1" style={{ fontSize: '0.65rem' }}>
              {role?.toUpperCase()}
            </span>
          </div>
        </Link>
        <button
          className="btn btn-sm text-secondary d-lg-none"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* User Mini Profile */}
      <div className="p-3 mx-2 my-2 rounded-3 bg-white bg-opacity-10 d-flex align-items-center gap-3">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
          alt="Avatar"
          className="rounded-circle border border-primary"
          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
        />
        <div className="overflow-hidden">
          <div className="fw-bold text-white text-truncate small">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-secondary small text-truncate" style={{ fontSize: '0.75rem' }}>
            {user?.email}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-2 flex-grow-1 overflow-y-auto">
        <div className="text-uppercase text-secondary px-4 mb-2 fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
          Menu
        </div>
        <nav className="nav flex-column">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${link.icon} fs-5`}></i>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-top border-secondary border-opacity-25">
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 btn-sm rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold py-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
