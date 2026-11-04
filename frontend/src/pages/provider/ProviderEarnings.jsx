import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProviderEarnings = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await api.get('/providers/dashboard-stats');
        if (res.success) {
          setDashboardStats(res.data);
        }
      } catch (err) {
        console.warn('Error loading earnings:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading earnings statements..." />;
  }

  const gross = dashboardStats?.totalGrossRevenue || 4500;
  const platformCut = dashboardStats?.totalPlatformCommission || 675;
  const net = dashboardStats?.totalNetEarnings || 3825;

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Earnings & Commission Statements</h3>
        <p className="text-muted small mb-0">Detailed financial breakdown of completed appointments and platform payouts.</p>
      </div>

      {/* Financial KPI Cards */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-md-4">
          <StatCard
            title="Total Gross Revenue"
            value={`₹${gross.toLocaleString()}`}
            icon="bi-cash-stack"
            color="primary"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Platform Commission (15%)"
            value={`-₹${platformCut.toLocaleString()}`}
            icon="bi-pie-chart"
            color="danger"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Net Provider Payout"
            value={`₹${net.toLocaleString()}`}
            icon="bi-wallet-fill"
            color="success"
          />
        </div>
      </div>

      {/* Settlement Info Card */}
      <div className="hs-card p-4 bg-white mb-4">
        <h5 className="fw-bold text-dark mb-3">Bank Settlement Account</h5>
        <div className="row g-3 small">
          <div className="col-md-3">
            <span className="text-muted d-block">Account Holder</span>
            <span className="fw-semibold text-dark">Apex Home Solutions LLP</span>
          </div>
          <div className="col-md-3">
            <span className="text-muted d-block">Account Number</span>
            <span className="fw-semibold text-dark">•••• •••• 5544</span>
          </div>
          <div className="col-md-3">
            <span className="text-muted d-block">IFSC Code</span>
            <span className="fw-semibold text-dark">HDFC0001234</span>
          </div>
          <div className="col-md-3">
            <span className="text-muted d-block">Settlement Cycle</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
              T+1 Daily Auto-Settlement
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Statement Mock / Recent Settlements */}
      <div className="hs-card p-4 bg-white">
        <h5 className="fw-bold text-dark mb-3">Settled Booking Ledger</h5>
        <div className="table-responsive">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Service Title</th>
                <th>Gross Total</th>
                <th>Platform Commission (15%)</th>
                <th>Net Credited</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="fw-bold text-primary small">HSB-20261101-AC01</td>
                <td className="small text-dark">Split & Window AC Deep Jet Servicing</td>
                <td className="fw-semibold small">₹849</td>
                <td className="text-danger small">-₹127</td>
                <td className="fw-bold text-success small">₹722</td>
                <td><span className="badge bg-success-subtle text-success rounded-pill px-2">Settled</span></td>
              </tr>
              <tr>
                <td className="fw-bold text-primary small">HSB-20261028-PL04</td>
                <td className="small text-dark">Precision Bathroom Leakage Detection</td>
                <td className="fw-semibold small">₹499</td>
                <td className="text-danger small">-₹75</td>
                <td className="fw-bold text-success small">₹424</td>
                <td><span className="badge bg-success-subtle text-success rounded-pill px-2">Settled</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProviderEarnings;
