import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ProviderBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [currentTab, setCurrentTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [rejectModal, setRejectModal] = useState({ isOpen: false, bookingId: null, reason: '' });
  const [assignModal, setAssignModal] = useState({ isOpen: false, bookingId: null, technicianId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/bookings/provider-bookings?status=${currentTab}`);
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.warn('Error fetching bookings:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/providers/technicians');
      if (res.success) {
        setTechnicians(res.data);
      }
    } catch (err) {
      console.warn('Error fetching technicians:', err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchTechnicians();
  }, [currentTab]);

  const handleAccept = async (bookingId) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/accept`);
      if (res.success) {
        showToast('Booking accepted! You can now assign a field technician.', 'success');
        fetchBookings();
      }
    } catch (err) {
      showToast(err.message || 'Error accepting booking', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/bookings/${rejectModal.bookingId}/reject`, {
        rejectionReason: rejectModal.reason
      });
      if (res.success) {
        showToast('Booking rejected', 'info');
        setRejectModal({ isOpen: false, bookingId: null, reason: '' });
        fetchBookings();
      }
    } catch (err) {
      showToast(err.message || 'Error rejecting booking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModal.technicianId) {
      showToast('Please select a technician', 'warning');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.put(`/bookings/${assignModal.bookingId}/assign-technician`, {
        technicianId: assignModal.technicianId
      });
      if (res.success) {
        showToast('Technician assigned successfully!', 'success');
        setAssignModal({ isOpen: false, bookingId: null, technicianId: '' });
        fetchBookings();
      }
    } catch (err) {
      showToast(err.message || 'Error assigning technician', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Booking Requests & Dispatch</h3>
          <p className="text-muted small mb-0">Accept incoming customer bookings and dispatch certified technicians.</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="hs-card bg-white p-2 mb-4">
        <ul className="nav nav-pills">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: 'Pending Acceptance' },
            { id: 'accepted', label: 'Needs Technician' },
            { id: 'technician_assigned', label: 'Assigned' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <li className="nav-item" key={tab.id}>
              <button
                className={`nav-link rounded-pill fw-semibold py-2 px-3 small ${currentTab === tab.id ? 'active' : 'text-secondary'}`}
                onClick={() => setCurrentTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <LoadingSpinner message="Loading provider bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="bi-inbox"
          title="No bookings in this tab"
          message="No active or pending customer service requests matching this view."
        />
      ) : (
        <div className="hs-card bg-white p-4">
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer Info</th>
                  <th>Service</th>
                  <th>Appointment Time</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-bold text-primary small">{b.bookingReference}</td>
                    <td>
                      <div className="fw-semibold text-dark small">{b.customer?.firstName} {b.customer?.lastName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.customer?.phone}</div>
                    </td>
                    <td className="small text-dark fw-medium text-truncate" style={{ maxWidth: '180px' }}>
                      {b.service?.title}
                    </td>
                    <td className="small text-secondary">
                      {b.bookingDate} <br />
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{b.timeSlot}</span>
                    </td>
                    <td className="fw-bold text-dark small">₹{b.pricing?.totalAmount}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {b.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-success btn-sm rounded-pill px-3 fw-semibold small"
                              onClick={() => handleAccept(b._id)}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm rounded-pill px-2 small"
                              onClick={() => setRejectModal({ isOpen: true, bookingId: b._id, reason: '' })}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {b.status === 'accepted' && (
                          <button
                            className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold small"
                            onClick={() => setAssignModal({ isOpen: true, bookingId: b._id, technicianId: '' })}
                          >
                            <i className="bi bi-person-plus me-1"></i> Assign Tech
                          </button>
                        )}

                        {b.technician && (
                          <span className="badge bg-light text-muted border small d-inline-flex align-items-center py-2 px-2">
                            <i className="bi bi-person-badge text-primary me-1"></i>
                            {b.technician.user?.firstName}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. REJECT REASON MODAL */}
      {rejectModal.isOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-danger mb-0">Reject Service Request</h5>
                <button type="button" className="btn-close" onClick={() => setRejectModal({ isOpen: false, bookingId: null, reason: '' })}></button>
              </div>

              <form onSubmit={handleRejectSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Reason for Rejection *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Schedule fully booked for this time window, outside standard service perimeter..."
                    value={rejectModal.reason}
                    onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setRejectModal({ isOpen: false, bookingId: null, reason: '' })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASSIGN TECHNICIAN MODAL */}
      {assignModal.isOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Dispatch Field Technician</h5>
                <button type="button" className="btn-close" onClick={() => setAssignModal({ isOpen: false, bookingId: null, technicianId: '' })}></button>
              </div>

              <form onSubmit={handleAssignSubmit}>
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark">Select Technician Staff *</label>
                  {technicians.length === 0 ? (
                    <div className="alert alert-warning small">
                      You haven't added any technicians to your team yet. Please add a technician from the Technician Staff tab first.
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={assignModal.technicianId}
                      onChange={(e) => setAssignModal({ ...assignModal, technicianId: e.target.value })}
                      required
                    >
                      <option value="">-- Choose Field Pro --</option>
                      {technicians.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.user?.firstName} {t.user?.lastName} ({t.specializations?.join(', ') || 'Specialist'}) - {t.experienceYears || 5} yrs exp
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setAssignModal({ isOpen: false, bookingId: null, technicianId: '' })}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={isSubmitting || technicians.length === 0}
                  >
                    {isSubmitting ? 'Dispatching...' : 'Dispatch Technician'}
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

export default ProviderBookings;
