import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProviderTechnicians = () => {
  const { showToast } = useToast();
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specializations: '',
    experienceYears: 3
  });

  const fetchTechs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/providers/technicians');
      if (res.success) {
        setTechnicians(res.data);
      }
    } catch (err) {
      console.warn('Error fetching technicians:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || 'TechPassword123!',
        specializations: formData.specializations.split(',').map((s) => s.trim()),
        experienceYears: Number(formData.experienceYears)
      };

      const res = await api.post('/providers/technicians', payload);
      if (res.success) {
        showToast('Technician added successfully!', 'success');
        setIsModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          specializations: '',
          experienceYears: 3
        });
        fetchTechs();
      }
    } catch (err) {
      showToast(err.message || 'Error adding technician', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Field Technician Staff</h3>
          <p className="text-muted small mb-0">Manage certified technicians dispatched for customer appointments.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={() => setIsModalOpen(true)}>
          <i className="bi bi-person-plus me-1"></i> Add Technician
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading technicians..." />
      ) : technicians.length === 0 ? (
        <div className="hs-card p-5 text-center bg-white">
          <i className="bi bi-people text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No technicians added yet</h5>
          <p className="text-muted small mb-3">Add your service crew so you can assign them to incoming customer jobs.</p>
          <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => setIsModalOpen(true)}>
            Add Technician
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {technicians.map((tech) => (
            <div key={tech._id} className="col-md-6 col-lg-4">
              <div className="hs-card p-4 bg-white h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img
                    src={tech.user?.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100'}
                    alt="Technician"
                    className="rounded-circle border"
                    style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold text-dark mb-0">{tech.user?.firstName} {tech.user?.lastName}</h6>
                    <div className="text-muted small">{tech.experienceYears} Years Experience</div>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 small mb-3">
                  <div className="mb-1 text-truncate">
                    <i className="bi bi-envelope me-1 text-primary"></i> {tech.user?.email}
                  </div>
                  <div className="mb-1">
                    <i className="bi bi-telephone me-1 text-success"></i> {tech.user?.phone}
                  </div>
                  <div>
                    <i className="bi bi-check2-circle me-1 text-info"></i> {tech.completedJobsCount || 0} Completed Jobs
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-1">
                  {tech.specializations?.map((spec, i) => (
                    <span key={i} className="badge bg-primary-subtle text-primary border border-primary-subtle small">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD TECHNICIAN MODAL */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Add Field Technician</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Specializations (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Electrician, HVAC, Inverter Repair"
                    value={formData.specializations}
                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  />
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Experience (Years)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Login Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="TechPassword123!"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Technician'}
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

export default ProviderTechnicians;
