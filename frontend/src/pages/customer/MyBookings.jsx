import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MyBookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/bookings/my-bookings?status=${currentTab}`);
        if (res.success) {
          setBookings(res.data);
        }
      } catch (err) {
        console.warn('Error fetching bookings:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [currentTab]);

  const setTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Bookings</h3>
          <p className="text-muted small mb-0">Track live statuses, download invoices, and submit service ratings.</p>
        </div>
        <Link to="/services" className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm">
          <i className="bi bi-plus-lg me-1"></i> Book New Service
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="hs-card bg-white p-2 mb-4">
        <ul className="nav nav-pills nav-fill">
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'active', label: 'Active / In-Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <li className="nav-item" key={tab.id}>
              <button
                className={`nav-link rounded-pill fw-semibold py-2 small ${currentTab === tab.id ? 'active' : 'text-secondary'}`}
                onClick={() => setTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <LoadingSpinner message="Loading your bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="bi-calendar-check"
          title={`No ${currentTab !== 'all' ? currentTab : ''} bookings found`}
          message="You do not have any services matching this status tab right now."
          actionText="Explore Services Catalog"
          onAction={() => window.location.href = '/services'}
        />
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => (
            <div key={booking._id} className="col-12">
              <div className="hs-card p-4 bg-white hs-card-interactive">
                <div className="row align-items-center g-3">
                  {/* Service Image & Details */}
                  <div className="col-md-5 d-flex align-items-center gap-3">
                    <img
                      src={booking.service?.coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200'}
                      alt="Service"
                      className="rounded-3"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                    <div>
                      <span className="badge bg-light text-muted border small mb-1">
                        {booking.bookingReference}
                      </span>
                      <h6 className="fw-bold text-dark mb-1">{booking.service?.title}</h6>
                      <div className="text-muted small">
                        <i className="bi bi-building me-1"></i> {booking.provider?.businessName}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Date & Location */}
                  <div className="col-md-3">
                    <div className="text-secondary small">
                      <div className="fw-bold text-dark mb-1">
                        <i className="bi bi-calendar3 me-1 text-primary"></i> {booking.bookingDate}
                      </div>
                      <div className="text-muted">
                        <i className="bi bi-clock me-1"></i> {booking.timeSlot}
                      </div>
                      <div className="text-truncate text-muted mt-1" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-geo-alt me-1"></i> {booking.serviceAddress?.streetAddress}, {booking.serviceAddress?.city}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div className="col-md-2 text-md-center">
                    <div className="fw-bold text-dark fs-5 mb-1">₹{booking.pricing?.totalAmount}</div>
                    <StatusBadge status={booking.status} />
                  </div>

                  {/* Action Button */}
                  <div className="col-md-2 text-md-end">
                    <Link
                      to={`/customer/bookings/${booking._id}`}
                      className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-semibold w-100 w-md-auto"
                    >
                      Track & Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
