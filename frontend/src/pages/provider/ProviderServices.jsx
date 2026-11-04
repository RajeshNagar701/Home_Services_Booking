import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProviderServices = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    discountPrice: '',
    durationMinutes: 60,
    coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
    includedFeatures: '',
    excludedFeatures: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [srvRes, catRes] = await Promise.all([
        api.get('/services/my-services'),
        api.get('/categories')
      ]);
      if (srvRes.success) setServices(srvRes.data);
      if (catRes.success) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !formData.category) {
          setFormData((prev) => ({ ...prev, category: catRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.warn('Error loading provider services:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : 0,
        durationMinutes: Number(formData.durationMinutes),
        coverImage: formData.coverImage,
        includedFeatures: formData.includedFeatures.split('\n').filter(Boolean),
        excludedFeatures: formData.excludedFeatures.split('\n').filter(Boolean)
      };

      const res = await api.post('/services', payload);
      if (res.success) {
        showToast('Service published successfully!', 'success');
        setIsModalOpen(false);
        setFormData({
          title: '',
          category: categories[0]?._id || '',
          description: '',
          price: '',
          discountPrice: '',
          durationMinutes: 60,
          coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
          includedFeatures: '',
          excludedFeatures: ''
        });
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Error publishing service', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await api.delete(`/services/${id}`);
      if (res.success) {
        showToast('Service deleted', 'info');
        fetchData();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting service', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Service Catalog</h3>
          <p className="text-muted small mb-0">Create and update your published service offerings and prices.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={() => setIsModalOpen(true)}>
          <i className="bi bi-plus-lg me-1"></i> Add New Service
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your catalog..." />
      ) : services.length === 0 ? (
        <div className="hs-card p-5 text-center bg-white">
          <i className="bi bi-briefcase text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No services published yet</h5>
          <p className="text-muted small mb-3">Add your first electrical, plumbing, HVAC, or cleaning offering.</p>
          <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => setIsModalOpen(true)}>
            Add Service
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {services.map((srv) => (
            <div key={srv._id} className="col-md-6 col-lg-4">
              <div className="hs-card p-0 bg-white overflow-hidden h-100 d-flex flex-column">
                <img
                  src={srv.coverImage}
                  alt={srv.title}
                  style={{ height: '180px', objectFit: 'cover' }}
                  className="w-100"
                />
                <div className="p-3 d-flex flex-column flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary small">
                      {srv.category?.name}
                    </span>
                    <span className="badge bg-light text-muted border small">
                      {srv.durationMinutes} mins
                    </span>
                  </div>

                  <h6 className="fw-bold text-dark mb-1 line-clamp-1">{srv.title}</h6>
                  <p className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '0.8rem' }}>
                    {srv.description?.slice(0, 80)}...
                  </p>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-auto">
                    <div>
                      <span className="fw-bold fs-5 text-dark">₹{srv.discountPrice || srv.price}</span>
                      {srv.discountPrice > 0 && (
                        <span className="text-muted text-decoration-line-through small ms-2">₹{srv.price}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle p-1"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => handleDelete(srv._id)}
                      title="Delete Service"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SERVICE MODAL */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Publish New Service</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-8">
                    <label className="form-label small fw-semibold text-dark">Service Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Inverter AC Jet Servicing & Coil Wash"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Description *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe what customers can expect..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">Standard Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">Discounted Price (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="849 (optional)"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Banner Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  />
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-success">Included Items (1 per line)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Indoor power jet wash&#10;Outdoor condenser flush&#10;Gas pressure testing"
                      value={formData.includedFeatures}
                      onChange={(e) => setFormData({ ...formData, includedFeatures: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-danger">Excluded Items (1 per line)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Compressor replacement&#10;Copper pipe extension"
                      value={formData.excludedFeatures}
                      onChange={(e) => setFormData({ ...formData, excludedFeatures: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Service'}
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

export default ProviderServices;
