import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completeModal, setCompleteModal] = useState({ isOpen: false, jobId: null, remarks: '', image: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/bookings/technician-jobs');
      if (res.success) {
        setJobs(res.data);
      }
    } catch (err) {
      console.warn('Error fetching technician jobs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusUpdate = async (jobId, newStatus, remarks) => {
    setIsUpdating(true);
    try {
      const res = await api.put(`/bookings/${jobId}/technician-status`, {
        status: newStatus,
        remarks
      });
      if (res.success) {
        showToast(`Status updated to ${newStatus.replace(/_/g, ' ')}`, 'success');
        fetchJobs();
      }
    } catch (err) {
      showToast(err.message || 'Error updating status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.post(`/bookings/${completeModal.jobId}/complete`, {
        technicianRemarks: completeModal.remarks,
        completionImages: completeModal.image ? [completeModal.image] : []
      });
      if (res.success) {
        showToast('Job completed successfully! Commission and payout recorded.', 'success');
        setCompleteModal({ isOpen: false, jobId: null, remarks: '', image: '' });
        fetchJobs();
      }
    } catch (err) {
      showToast(err.message || 'Error completing job', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading technician mobility dashboard..." />;
  }

  const activeJob = jobs.find((j) =>
    ['technician_assigned', 'on_the_way', 'arrived', 'in_progress'].includes(j.status)
  );

  const completedCount = jobs.filter((j) => j.status === 'completed').length;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Technician Mobility Dashboard</h3>
          <p className="text-muted small mb-0">Welcome {user?.firstName}. Access your assigned field jobs and live status buttons.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 g-md-4 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            title="Total Assigned"
            value={jobs.length}
            icon="bi-wrench"
            color="primary"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Current Job"
            value={activeJob ? 'In Action' : 'Idle'}
            icon="bi-broadcast"
            color={activeJob ? 'warning' : 'secondary'}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Completed"
            value={completedCount}
            icon="bi-check-circle-fill"
            color="success"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            title="Technician Rating"
            value="4.9 ★"
            icon="bi-star-fill"
            color="warning"
          />
        </div>
      </div>

      {/* ACTIVE JOB SPOTLIGHT CARD */}
      {activeJob ? (
        <div className="hs-card p-4 mb-4 bg-white border border-primary border-2 shadow-md">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="badge bg-danger text-white py-1 px-3 rounded-pill fw-bold">
              <i className="bi bi-geo-fill me-1"></i> ACTIVE SERVICE JOB
            </span>
            <StatusBadge status={activeJob.status} />
          </div>

          <div className="row g-4">
            <div className="col-md-7">
              <h4 className="fw-bold text-dark mb-1">{activeJob.service?.title}</h4>
              <p className="text-muted small mb-3">
                Booking Reference: <strong>{activeJob.bookingReference}</strong> &bull; Scheduled: {activeJob.bookingDate} ({activeJob.timeSlot})
              </p>

              {/* Customer Contact Box */}
              <div className="p-3 bg-light rounded-3 border mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-bold text-dark">
                    <i className="bi bi-person me-1"></i> {activeJob.customer?.firstName} {activeJob.customer?.lastName}
                  </div>
                  <a
                    href={`tel:${activeJob.serviceAddress?.contactPhone || '+919899001122'}`}
                    className="btn btn-success btn-sm rounded-pill px-3 fw-semibold"
                  >
                    <i className="bi bi-telephone-fill me-1"></i> Call Customer
                  </a>
                </div>
                <div className="text-secondary small">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {activeJob.serviceAddress?.streetAddress}, {activeJob.serviceAddress?.city} - {activeJob.serviceAddress?.pincode}
                </div>
                {activeJob.problemDescription && (
                  <div className="mt-2 text-muted small pt-2 border-top">
                    <strong>Issue Note:</strong> {activeJob.problemDescription}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Status Progression Controls */}
            <div className="col-md-5 d-flex flex-column justify-content-center border-start-md ps-md-4">
              <h6 className="fw-bold text-dark mb-3">Update Service Progress</h6>

              {activeJob.status === 'technician_assigned' && (
                <button
                  className="btn btn-primary py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-2"
                  onClick={() => handleStatusUpdate(activeJob._id, 'on_the_way', 'Technician is en route to customer')}
                  disabled={isUpdating}
                >
                  <i className="bi bi-truck fs-5"></i>
                  <span>1. Mark "On The Way"</span>
                </button>
              )}

              {activeJob.status === 'on_the_way' && (
                <button
                  className="btn btn-info text-white py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-2"
                  onClick={() => handleStatusUpdate(activeJob._id, 'arrived', 'Technician arrived at doorstep')}
                  disabled={isUpdating}
                >
                  <i className="bi bi-geo-alt-fill fs-5"></i>
                  <span>2. Mark "Arrived At Location"</span>
                </button>
              )}

              {activeJob.status === 'arrived' && (
                <button
                  className="btn btn-warning text-dark py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-2"
                  onClick={() => handleStatusUpdate(activeJob._id, 'in_progress', 'Service diagnostics & work initiated')}
                  disabled={isUpdating}
                >
                  <i className="bi bi-tools fs-5"></i>
                  <span>3. Mark "Work In Progress"</span>
                </button>
              )}

              {activeJob.status === 'in_progress' && (
                <button
                  className="btn btn-success py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-2"
                  onClick={() => setCompleteModal({
                    isOpen: true,
                    jobId: activeJob._id,
                    remarks: 'Repairs completed and tested to customer satisfaction.',
                    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'
                  })}
                  disabled={isUpdating}
                >
                  <i className="bi bi-check2-circle fs-5"></i>
                  <span>4. Complete Job & Upload Evidence</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hs-card p-4 mb-4 bg-white text-center py-5">
          <i className="bi bi-cup-hot text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No job actively in-progress</h5>
          <p className="text-muted small mb-0">You are all caught up! New assigned appointments will appear here automatically.</p>
        </div>
      )}

      {/* Assigned Jobs Queue Table */}
      <div className="hs-card p-4 bg-white shadow-sm">
        <h5 className="fw-bold text-dark mb-3">All Assigned Jobs</h5>
        <div className="table-responsive">
          <table className="table table-custom">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Scheduled Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id}>
                  <td className="fw-bold text-primary small">{j.bookingReference}</td>
                  <td className="small text-dark fw-semibold">{j.customer?.firstName} {j.customer?.lastName}</td>
                  <td className="small text-muted">{j.service?.title}</td>
                  <td className="small text-secondary">{j.bookingDate} ({j.timeSlot})</td>
                  <td><StatusBadge status={j.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JOB COMPLETION MODAL */}
      {completeModal.isOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-success mb-0">
                  <i className="bi bi-check-circle-fill me-1"></i> Finalize & Complete Job
                </h5>
                <button type="button" className="btn-close" onClick={() => setCompleteModal({ ...completeModal, isOpen: false })}></button>
              </div>

              <form onSubmit={handleCompleteSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Work Remarks / Diagnostic Notes *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={completeModal.remarks}
                    onChange={(e) => setCompleteModal({ ...completeModal, remarks: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark">Proof of Work / Completion Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={completeModal.image}
                    onChange={(e) => setCompleteModal({ ...completeModal, image: e.target.value })}
                  />
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Photo evidence of replaced components or sanitized AC coils
                  </span>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setCompleteModal({ ...completeModal, isOpen: false })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold" disabled={isUpdating}>
                    {isUpdating ? 'Finishing...' : 'Submit & Complete Job'}
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

export default TechnicianDashboard;
