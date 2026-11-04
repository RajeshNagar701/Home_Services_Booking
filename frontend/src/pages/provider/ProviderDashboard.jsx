import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProviderDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/providers/dashboard-stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Error fetching provider stats:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading provider dashboard..." />;
  }

  const isApproved = stats?.verificationStatus === 'approved';
  const isPending = stats?.verificationStatus === 'pending';

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">{stats?.businessName || 'Provider Dashboard'}</h3>
          <p className="text-muted small mb-0">Manage incoming booking requests, technician dispatches, and payouts.</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/provider/services" className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold">
            <i className="bi bi-briefcase me-1"></i> Manage Services
          </Link>
          <Link to="/provider/bookings" className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold">
            <i className="bi bi-inbox me-1"></i> Booking Requests ({stats?.pendingBookingsCount || 0})
          </Link>
        </div>
      </div>

      {/* KYC Verification Banner */}
      {!isApproved && (
        <div className={`hs-card p-4 mb-4 border ${isPending ? 'bg-warning-subtle border-warning' : 'bg-danger-subtle border-danger'}`}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <i className={`bi ${isPending ? 'bi-hourglass-split text-warning' : 'bi-shield-x text-danger'} fs-2`}></i>
              <div>
                <h6 className="fw-bold mb-1 text-dark">
                  Account Verification Status: <span className="text-uppercase">{stats?.verificationStatus}</span>
                </h6>
                <p className="small text-muted mb-0">
                  {isPending
                    ? 'Your KYC documents are currently being audited by Super Admin. You can publish services once approved.'
                    : 'Your KYC documents require revision. Please check your verification documents page.'}
                </p>
              </div>
            </div>
            <Link to="/provider/kyc" className="btn btn-dark btn-sm rounded-pill px-4 fw-semibold">
              View KYC Documents &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard
            title="Net Earnings"
            value={`₹${stats?.totalNetEarnings?.toLocaleString() || 0}`}
            icon="bi-wallet2"
            color="success"
            change="+18%"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Pending Requests"
            value={stats?.pendingBookingsCount || 0}
            icon="bi-inbox"
            color="warning"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Active Jobs"
            value={stats?.activeBookingsCount || 0}
            icon="bi-tools"
            color="primary"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Average Rating"
            value={`${stats?.rating || 4.9} ★`}
            icon="bi-star-fill"
            color="warning"
          />
        </div>
      </div>

      {/* Recent Bookings Queue */}
      <div className="hs-card bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Recent Customer Requests</h5>
            <span className="text-muted small">Real-time appointments dispatched to your agency</span>
          </div>
          <Link to="/provider/bookings" className="btn btn-link text-primary small text-decoration-none fw-semibold">
            View All Requests &rarr;
          </Link>
        </div>

        {stats?.recentBookings && stats.recentBookings.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & Window</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold text-primary small">{b.bookingReference}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={b.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt="Customer"
                          className="rounded-circle"
                          style={{ width: '28px', height: '28px' }}
                        />
                        <span className="small fw-semibold text-dark">
                          {b.customer?.firstName} {b.customer?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="small text-dark text-truncate" style={{ maxWidth: '180px' }}>
                      {b.service?.title}
                    </td>
                    <td className="small text-secondary">
                      {b.bookingDate} ({b.timeSlot})
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <Link
                        to="/provider/bookings"
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 small fw-semibold"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted small">
            No active booking requests in queue right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
