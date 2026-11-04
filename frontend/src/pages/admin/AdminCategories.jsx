import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    icon: 'bi-gear',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    description: '',
    sortOrder: 1
  });

  const fetchCats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.warn('Error fetching categories:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/categories', formData);
      if (res.success) {
        showToast('Category created successfully!', 'success');
        setIsModalOpen(false);
        setFormData({
          name: '',
          icon: 'bi-gear',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
          description: '',
          sortOrder: 1
        });
        fetchCats();
      }
    } catch (err) {
      showToast(err.message || 'Error creating category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category? Ensure no active services are assigned.')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.success) {
        showToast('Category deleted', 'info');
        fetchCats();
      }
    } catch (err) {
      showToast(err.message || 'Error deleting category', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Service Categories Taxonomy</h3>
          <p className="text-muted small mb-0">Organize and manage platform service classifications and banners.</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={() => setIsModalOpen(true)}>
          <i className="bi bi-plus-lg me-1"></i> Add Category
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading categories..." />
      ) : (
        <div className="row g-4">
          {categories.map((cat) => (
            <div key={cat._id} className="col-md-6 col-lg-3">
              <div className="hs-card bg-white p-3 text-center h-100 position-relative">
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}
                >
                  <i className={`bi ${cat.icon || 'bi-gear'}`}></i>
                </div>
                <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                <div className="text-muted small mb-2">{cat.servicesCount || 0} Active Services</div>
                <button
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 small"
                  onClick={() => handleDelete(cat._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Add Service Category</h5>
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Category Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Solar Panel Servicing"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Bootstrap Icon Class</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="bi-sun"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-dark">Sort Priority</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Banner Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2 pt-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Category'}
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

export default AdminCategories;
