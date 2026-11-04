import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/admin/all');
        if (res.success) {
          setBookings(res.data);
        }
      } catch (err) {
        console.warn('Error fetching all bookings:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Global Bookings Ledger</h3>
        <p className="text-muted small mb-0">Platform-wide audit of all service appointments across customers, providers, and technicians.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading global booking ledger..." />
      ) : (
        <div className="hs-card bg-white p-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Service</th>
                  <th>Appointment</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold text-primary small">{b.bookingReference}</td>
                    <td className="small text-dark fw-semibold">{b.customer?.firstName} {b.customer?.lastName}</td>
                    <td className="small text-muted">{b.provider?.businessName}</td>
                    <td className="small text-dark text-truncate" style={{ maxWidth: '160px' }}>{b.service?.title}</td>
                    <td className="small text-secondary">{b.bookingDate} ({b.timeSlot})</td>
                    <td className="fw-bold text-dark small">₹{b.pricing?.totalAmount}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
