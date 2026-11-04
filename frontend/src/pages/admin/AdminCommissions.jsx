import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const res = await api.get('/admin/commissions');
        if (res.success) {
          setCommissions(res.data);
        }
      } catch (err) {
        console.warn('Error fetching commissions:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Platform Commissions & Financial Settlements</h3>
        <p className="text-muted small mb-0">Auditing marketplace revenues, 15% platform cuts, and provider payout disbursements.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading financial records..." />
      ) : (
        <div className="hs-card bg-white p-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Service Provider</th>
                  <th>Total Order Amount</th>
                  <th>Commission %</th>
                  <th>Platform Net Revenue</th>
                  <th>Provider Net Payout</th>
                  <th>Disbursement Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c._id}>
                    <td className="fw-bold text-primary small">{c.booking?.bookingReference || 'HSB-20261101-AC01'}</td>
                    <td className="small text-dark fw-semibold">{c.provider?.businessName}</td>
                    <td className="fw-semibold text-dark small">₹{c.totalBookingAmount}</td>
                    <td className="small text-muted">{c.commissionPercentage}%</td>
                    <td className="fw-bold text-success small">+₹{c.platformCommissionAmount}</td>
                    <td className="fw-bold text-primary small">₹{c.providerPayoutAmount}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2">
                        Settled
                      </span>
                    </td>
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

export default AdminCommissions;
