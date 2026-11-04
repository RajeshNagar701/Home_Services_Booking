import React from 'react';
import { useAuth } from '../../context/AuthContext';

const TechnicianProfile = () => {
  const { user } = useAuth();

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="mb-4">
          <h3 className="fw-bold text-dark mb-1">Technician Profile</h3>
          <p className="text-muted small mb-0">Your verified credentials, contact details, and certifications.</p>
        </div>

        <div className="hs-card p-4 p-md-5 bg-white shadow-sm">
          <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'}
              alt="Avatar"
              className="rounded-circle border border-info"
              style={{ width: '70px', height: '70px', objectFit: 'cover' }}
            />
            <div>
              <h5 className="fw-bold text-dark mb-0">{user?.firstName} {user?.lastName}</h5>
              <div className="badge bg-info-subtle text-info text-uppercase small">Field Technician</div>
            </div>
          </div>

          <div className="row g-3 small">
            <div className="col-md-6">
              <label className="text-muted d-block">Full Name</label>
              <div className="fw-semibold text-dark">{user?.firstName} {user?.lastName}</div>
            </div>
            <div className="col-md-6">
              <label className="text-muted d-block">Phone Number</label>
              <div className="fw-semibold text-dark">{user?.phone || '+91 9866778899'}</div>
            </div>
            <div className="col-md-6">
              <label className="text-muted d-block">Email Address</label>
              <div className="fw-semibold text-dark">{user?.email}</div>
            </div>
            <div className="col-md-6">
              <label className="text-muted d-block">Specializations</label>
              <div className="fw-semibold text-dark">Electrician, HVAC & Cooling Specialist</div>
            </div>
            <div className="col-12 mt-4 pt-3 border-top">
              <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-2 text-muted">
                <i className="bi bi-shield-check text-success fs-5"></i>
                <span>Your profile has been verified by HomeServe Technologies safety audit.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfile;
