import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/bookings/my-bookings?limit=5');
        if (res.success) {
          setBookings(res.data);
        }
      } catch (err) {
        console.warn('Error fetching bookings:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const activeBooking = bookings.find((b) =>
    ['pending', 'accepted', 'technician_assigned', 'on_the_way', 'arrived', 'in_progress'].includes(b.status)
  );

  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <div>
      {/* Welcome Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Welcome back, {user?.firstName}!</h3>
          <p className="text-muted small mb-0">Here is a summary of your appointments and home service requests.</p>
        </div>
        <Link to="/services" className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm">
          <i className="bi bi-plus-lg me-1"></i> Book New Service
        </Link>
      </div>

      {/* Live Active Booking Alert Banner */}
      {activeBooking && (
        <div className="hs-card p-4 mb-4 bg-primary text-white position-relative overflow-hidden shadow">
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-white text-primary fw-bold px-3 py-1 rounded-pill mb-2">
                ACTIVE SERVICE IN PROGRESS
              </span>
              <h5 className="fw-bold mb-1">{activeBooking.service?.title}</h5>
              <p className="text-white-50 small mb-0">
                Scheduled for <strong>{activeBooking.bookingDate} ({activeBooking.timeSlot})</strong>. Current status:{' '}
                <span className="text-warning text-uppercase fw-bold">{activeBooking.status.replace(/_/g, ' ')}</span>
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <Link
                to={`/customer/bookings/${activeBooking._id}`}
                className="btn btn-light text-primary fw-bold rounded-pill px-4"
              >
                Track Live Progress &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard
            title="Total Bookings"
            value={bookings.length || 0}
            icon="bi-calendar-check"
            color="primary"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Active Services"
            value={activeBooking ? 1 : 0}
            icon="bi-hourglass-split"
            color="warning"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Completed"
            value={completedCount}
            icon="bi-check2-circle"
            color="success"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Loyalty Rewards"
            value="₹250 OFF"
            icon="bi-ticket-perforated"
            color="info"
          />
        </div>
      </div>

      {/* Recent Bookings Table Card */}
      <div className="hs-card bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">Recent Bookings</h5>
          <Link to="/customer/bookings" className="btn btn-link text-primary small text-decoration-none fw-semibold">
            View All ({bookings.length}) &rarr;
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading your appointments..." />
        ) : bookings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x text-muted fs-1 mb-2 d-block"></i>
            <h6 className="fw-bold text-dark">No appointments yet</h6>
            <p className="text-muted small">You haven't placed any service bookings yet.</p>
            <Link to="/services" className="btn btn-primary btn-sm rounded-pill px-3">
              Explore Services Catalog
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Service</th>
                  <th>Provider</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold text-primary small">{b.bookingReference}</td>
                    <td className="fw-semibold text-dark small text-truncate" style={{ maxWidth: '200px' }}>
                      {b.service?.title}
                    </td>
                    <td className="text-secondary small">{b.provider?.businessName}</td>
                    <td className="text-secondary small">
                      {b.bookingDate} <br />
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{b.timeSlot}</span>
                    </td>
                    <td className="fw-bold text-dark small">₹{b.pricing?.totalAmount}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <Link
                        to={`/customer/bookings/${b._id}`}
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 small fw-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
