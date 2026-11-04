import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminProviders = () => {
  const { showToast } = useToast();
  const [providers, setProviders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Verification Audit Modal
  const [verifyModal, setVerifyModal] = useState({
    isOpen: false,
    provider: null,
    status: 'approved',
    rejectionReason: '',
    commissionRate: 15
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/providers?status=${statusFilter}`);
      if (res.success) {
        setProviders(res.data);
      }
    } catch (err) {
      console.warn('Error fetching providers:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [statusFilter]);

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/admin/providers/${verifyModal.provider._id}/verify`, {
        status: verifyModal.status,
        rejectionReason: verifyModal.rejectionReason,
        commissionRate: Number(verifyModal.commissionRate)
      });
      if (res.success) {
        showToast(`Provider account has been marked as ${verifyModal.status}!`, 'success');
        setVerifyModal({ isOpen: false, provider: null, status: 'approved', rejectionReason: '', commissionRate: 15 });
        fetchProviders();
      }
    } catch (err) {
      showToast(err.message || 'Error updating provider status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Service Provider Management & KYC</h3>
          <p className="text-muted small mb-0">Approve new vendor onboarding, review legal documentation, and audit performance.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="hs-card bg-white p-2 mb-4">
        <ul className="nav nav-pills">
          {[
            { id: 'all', label: 'All Providers' },
            { id: 'pending', label: 'Pending Verification' },
            { id: 'approved', label: 'Approved & Active' },
            { id: 'rejected', label: 'Rejected' }
          ].map((tab) => (
            <li className="nav-item" key={tab.id}>
              <button
                className={`nav-link rounded-pill fw-semibold py-2 px-3 small ${statusFilter === tab.id ? 'active' : 'text-secondary'}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading providers..." />
      ) : providers.length === 0 ? (
        <div className="hs-card p-5 text-center bg-white">
          <i className="bi bi-patch-check text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No providers in this category</h5>
          <p className="text-muted small">No agency accounts matching the selected verification filter.</p>
        </div>
      ) : (
        <div className="hs-card bg-white p-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Business Name</th>
                  <th>Primary Owner</th>
                  <th>Operating Cities</th>
                  <th>Commission</th>
                  <th>Rating</th>
                  <th>KYC Status</th>
                  <th className="text-end">Verification Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="fw-bold text-dark small">{p.businessName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{p.user?.email}</div>
                    </td>
                    <td className="small text-secondary">
                      {p.user?.firstName} {p.user?.lastName} <br />
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{p.user?.phone}</span>
                    </td>
                    <td className="small text-dark">
                      {p.serviceAreas?.map((a) => a.city).join(', ') || 'Mumbai'}
                    </td>
                    <td className="fw-bold text-primary small">{p.commissionRate || 15}%</td>
                    <td><StarRating rating={p.rating || 5.0} totalReviews={p.totalReviews} /></td>
                    <td><StatusBadge status={p.verificationStatus} /></td>
                    <td className="text-end">
                      <button
                        className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold small"
                        onClick={() =>
                          setVerifyModal({
                            isOpen: true,
                            provider: p,
                            status: p.verificationStatus === 'pending' ? 'approved' : p.verificationStatus,
                            rejectionReason: p.rejectionReason || '',
                            commissionRate: p.commissionRate || 15
                          })
                        }
                      >
                        Audit / Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KYC AUDIT & VERIFICATION MODAL */}
      {verifyModal.isOpen && verifyModal.provider && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Audit Provider KYC: {verifyModal.provider.businessName}</h5>
                <button type="button" className="btn-close" onClick={() => setVerifyModal({ ...verifyModal, isOpen: false })}></button>
              </div>

              <div className="p-3 bg-light rounded-3 border mb-3 small">
                <div className="row g-2">
                  <div className="col-md-6">
                    <strong>Owner:</strong> {verifyModal.provider.user?.firstName} {verifyModal.provider.user?.lastName}
                  </div>
                  <div className="col-md-6">
                    <strong>Email:</strong> {verifyModal.provider.user?.email}
                  </div>
                  <div className="col-md-6">
                    <strong>Phone:</strong> {verifyModal.provider.user?.phone}
                  </div>
                  <div className="col-md-6">
                    <strong>Current Status:</strong> <StatusBadge status={verifyModal.provider.verificationStatus} />
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifySubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Decision Status *</label>
                    <select
                      className="form-select"
                      value={verifyModal.status}
                      onChange={(e) => setVerifyModal({ ...verifyModal, status: e.target.value })}
                    >
                      <option value="approved">Approve Provider (Active)</option>
                      <option value="rejected">Reject Verification</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Platform Commission Rate (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={verifyModal.commissionRate}
                      onChange={(e) => setVerifyModal({ ...verifyModal, commissionRate: e.target.value })}
                      min="0"
                      max="50"
                      required
                    />
                  </div>
                </div>

                {verifyModal.status === 'rejected' && (
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-danger">Rejection Reason Feedback *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="e.g. GSTIN proof blurry or expired trade license..."
                      value={verifyModal.rejectionReason}
                      onChange={(e) => setVerifyModal({ ...verifyModal, rejectionReason: e.target.value })}
                      required
                    ></textarea>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setVerifyModal({ ...verifyModal, isOpen: false })}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-${verifyModal.status === 'approved' ? 'success' : 'danger'} rounded-pill px-4 fw-bold`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : `Confirm ${verifyModal.status.toUpperCase()}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
