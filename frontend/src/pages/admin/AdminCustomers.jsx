import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/admin/customers');
        if (res.success) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.warn('Error fetching customers:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Customer Management</h3>
        <p className="text-muted small mb-0">Platform registered customers, contact information, and lifetime booking volume.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading customer records..." />
      ) : (
        <div className="hs-card bg-white p-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>Total Bookings</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={c.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt="Avatar"
                          className="rounded-circle border"
                          style={{ width: '32px', height: '32px' }}
                        />
                        <span className="fw-bold text-dark small">
                          {c.user?.firstName} {c.user?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="small text-secondary">
                      {c.user?.email} <br />
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{c.user?.phone}</span>
                    </td>
                    <td className="fw-semibold text-primary small">{c.totalBookings || 1} Orders</td>
                    <td className="small text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge bg-success-subtle text-success rounded-pill px-2">Active</span></td>
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

export default AdminCustomers;
