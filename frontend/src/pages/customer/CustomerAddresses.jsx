import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CustomerAddresses = () => {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    streetAddress: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    contactPhone: '',
    type: 'home',
    isDefault: false
  });

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/customers/addresses');
      if (res.success) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.warn('Error fetching addresses:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/customers/addresses', formData);
      if (res.success) {
        showToast('Address added successfully', 'success');
        setIsModalOpen(false);
        setFormData({
          streetAddress: '',
          landmark: '',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          contactPhone: '',
          type: 'home',
          isDefault: false
        });
        fetchAddresses();
      }
    } catch (err) {
      showToast(err.message || 'Error saving address', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await api.delete(`/customers/addresses/${id}`);
      if (res.success) {
        showToast('Address deleted', 'info');
        fetchAddresses();
      }
    } catch (err) {
      showToast('Error deleting address', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Saved Addresses</h3>
          <p className="text-muted small mb-0">Manage service locations for fast one-click booking.</p>
        </div>
        <button
          className="btn btn-primary rounded-pill px-4 fw-semibold"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="bi bi-plus-lg me-1"></i> Add New Address
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your addresses..." />
      ) : addresses.length === 0 ? (
        <div className="hs-card p-5 text-center bg-white">
          <i className="bi bi-geo-alt text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No saved addresses</h5>
          <p className="text-muted small mb-3">Add your home or office address to book services seamlessly.</p>
          <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => setIsModalOpen(true)}>
            Add Address
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {addresses.map((addr) => (
            <div key={addr._id} className="col-md-6">
              <div className="hs-card p-4 bg-white h-100 position-relative">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-light text-dark border text-uppercase small px-2 py-1">
                    <i className={`bi bi-${addr.type === 'home' ? 'house' : addr.type === 'office' ? 'briefcase' : 'geo'} me-1`}></i>
                    {addr.type}
                  </span>
                  {addr.isDefault && (
                    <span className="badge bg-success-subtle text-success border border-success-subtle small px-2 py-1 rounded-pill">
                      Default
                    </span>
                  )}
                </div>

                <h6 className="fw-bold text-dark mb-1">{addr.streetAddress}</h6>
                {addr.landmark && <div className="text-muted small mb-1">Landmark: {addr.landmark}</div>}
                <div className="text-secondary small mb-2">
                  {addr.city}, {addr.state} - {addr.pincode}
                </div>
                <div className="text-muted small mb-3">
                  <i className="bi bi-telephone me-1"></i> {addr.contactPhone}
                </div>

                <div className="border-top pt-2 d-flex justify-content-end">
                  <button
                    className="btn btn-link text-danger btn-sm text-decoration-none p-0"
                    onClick={() => handleDeleteAddress(addr._id)}
                  >
                    <i className="bi bi-trash me-1"></i> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Add Service Address</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleAddAddress}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Address Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="home">Home</option>
                    <option value="office">Office / Workplace</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Street Address *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Flat 402, Green Valley Apartments"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Landmark (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Opposite City Mall"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">PIN Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Contact Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="defaultCheck"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  <label className="form-check-label small text-secondary" htmlFor="defaultCheck">
                    Set as default service address
                  </label>
                </div>

                <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving Address...' : 'Save Address'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAddresses;
