import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCoupons = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 499,
    maxDiscountAmount: 200,
    validTill: '2028-12-31',
    usageLimit: 200
  });

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/coupons');
      if (res.success) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.warn('Error fetching coupons:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/coupons', formData);
      if (res.success) {
        showToast(`Coupon '${res.data.code}' created successfully!`, 'success');
        setIsModalOpen(false);
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: 20,
          minOrderAmount: 499,
          maxDiscountAmount: 200,
          validTill: '2028-12-31',
          usageLimit: 200
        });
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.message || 'Error creating coupon', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.put(`/coupons/${id}/toggle`);
      if (res.success) {
        showToast(res.message, 'info');
        fetchCoupons();
      }
    } catch (err) {
      showToast('Error toggling coupon', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete coupon campaign?')) return;
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.success) {
        showToast('Coupon deleted', 'info');
        fetchCoupons();
      }
    } catch (err) {
      showToast('Error deleting coupon', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Promotional Coupons & Campaigns</h3>
          <p className="text-muted small mb-0">Manage customer acquisition discount codes and usage thresholds.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={() => setIsModalOpen(true)}>
          <i className="bi bi-plus-lg me-1"></i> Create Coupon
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading discount campaigns..." />
      ) : (
        <div className="row g-4">
          {coupons.map((c) => (
            <div key={c._id} className="col-md-6 col-lg-4">
              <div className="hs-card p-4 bg-white shadow-sm h-100 position-relative">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-bold fs-6">
                    {c.code}
                  </span>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={c.isActive}
                      onChange={() => handleToggle(c._id)}
                    />
                  </div>
                </div>

                <h5 className="fw-bold text-dark mt-2 mb-1">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                </h5>
                <p className="text-muted small mb-3">
                  Min Order: ₹{c.minOrderAmount} &bull; Max Discount: ₹{c.maxDiscountAmount}
                </p>

                <div className="p-2 bg-light rounded-3 small text-muted d-flex justify-content-between mb-3">
                  <span>Usage: {c.usedCount} / {c.usageLimit}</span>
                  <span>Expires: {new Date(c.validTill).toLocaleDateString()}</span>
                </div>

                <div className="border-top pt-2 d-flex justify-content-end">
                  <button
                    className="btn btn-link text-danger btn-sm text-decoration-none p-0"
                    onClick={() => handleDelete(c._id)}
                  >
                    <i className="bi bi-trash me-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Create Promotional Coupon</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Coupon Code *</label>
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    placeholder="e.g. SUMMER30"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Discount Type</label>
                    <select
                      className="form-select"
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Value *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Min Order (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Usage Limit</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Expiry Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.validTill}
                      onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Coupon'}
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

export default AdminCoupons;
