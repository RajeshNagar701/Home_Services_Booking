import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminComplaints = () => {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Resolution Modal
  const [resolveModal, setResolveModal] = useState({
    isOpen: false,
    complaint: null,
    status: 'resolved',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/complaints/admin');
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.warn('Error fetching complaints:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/complaints/${resolveModal.complaint._id}/resolve`, {
        status: resolveModal.status,
        adminResolutionRemarks: resolveModal.remarks
      });
      if (res.success) {
        showToast('Complaint status updated and customer notified!', 'success');
        setResolveModal({ isOpen: false, complaint: null, status: 'resolved', remarks: '' });
        fetchComplaints();
      }
    } catch (err) {
      showToast(err.message || 'Error resolving complaint', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Customer Complaints Desk</h3>
        <p className="text-muted small mb-0">Investigate customer disputes, enforce platform rework policies, and issue official resolutions.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading customer support tickets..." />
      ) : complaints.length === 0 ? (
        <div className="hs-card p-5 text-center bg-white shadow-sm">
          <i className="bi bi-shield-check text-success fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">Zero Open Complaints</h5>
          <p className="text-muted small">All customer appointments are fully fulfilled and compliant.</p>
        </div>
      ) : (
        <div className="hs-card bg-white p-4 shadow-sm">
          <div className="table-responsive">
            <table className="table table-custom">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Issue Summary</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td className="fw-bold text-primary small">#{c.complaintTicket}</td>
                    <td className="small text-dark fw-semibold">{c.raisedBy?.firstName} {c.raisedBy?.lastName}</td>
                    <td className="small text-muted">{c.provider?.businessName}</td>
                    <td className="small text-dark text-truncate" style={{ maxWidth: '200px' }}>
                      {c.subject}
                    </td>
                    <td>
                      <span className={`badge ${c.priority === 'high' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'} text-uppercase small`}>
                        {c.priority}
                      </span>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-end">
                      <button
                        className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold small"
                        onClick={() =>
                          setResolveModal({
                            isOpen: true,
                            complaint: c,
                            status: c.status === 'open' ? 'under_investigation' : c.status,
                            remarks: c.adminResolutionRemarks || ''
                          })
                        }
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {resolveModal.isOpen && resolveModal.complaint && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Complaint Ticket #{resolveModal.complaint.complaintTicket}</h5>
                <button type="button" className="btn-close" onClick={() => setResolveModal({ ...resolveModal, isOpen: false })}></button>
              </div>

              <div className="p-3 bg-light rounded-3 border mb-3 small">
                <div className="fw-bold text-dark mb-1">{resolveModal.complaint.subject}</div>
                <div className="text-secondary">{resolveModal.complaint.description}</div>
              </div>

              <form onSubmit={handleResolveSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Update Ticket Status *</label>
                  <select
                    className="form-select"
                    value={resolveModal.status}
                    onChange={(e) => setResolveModal({ ...resolveModal, status: e.target.value })}
                  >
                    <option value="under_investigation">Under Investigation</option>
                    <option value="resolved">Resolved (Rework / Agreement Reached)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark">Admin Resolution Notes *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter official resolution notes visible to customer..."
                    value={resolveModal.remarks}
                    onChange={(e) => setResolveModal({ ...resolveModal, remarks: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setResolveModal({ ...resolveModal, isOpen: false })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Resolution'}
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

export default AdminComplaints;
