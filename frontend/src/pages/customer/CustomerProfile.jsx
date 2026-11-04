import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CustomerProfile = () => {
  const { user, updateProfileState } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put('/auth/profile', formData);
      if (res.success) {
        updateProfileState(res.data.user);
        showToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="mb-4">
          <h3 className="fw-bold text-dark mb-1">Profile Settings</h3>
          <p className="text-muted small mb-0">Update your account details and contact information.</p>
        </div>

        <div className="hs-card p-4 p-md-5 bg-white shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <img
              src={formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt="Avatar"
              className="rounded-circle border"
              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
            />
            <div>
              <h5 className="fw-bold text-dark mb-0">{user?.firstName} {user?.lastName}</h5>
              <div className="badge bg-success-subtle text-success text-uppercase small">Customer</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-dark">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-dark">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-dark">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-dark">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-dark">Avatar URL</label>
              <input
                type="url"
                className="form-control"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary px-4 rounded-pill fw-semibold" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
