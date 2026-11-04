import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const TechnicianJobs = () => {
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/bookings/technician-jobs?filter=${filter}`);
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
  }, [filter]);

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Assigned Field Jobs</h3>
        <p className="text-muted small mb-0">Review all your scheduled appointments, customer addresses, and job statuses.</p>
      </div>

      {/* Filter Tabs */}
      <div className="hs-card bg-white p-2 mb-4">
        <ul className="nav nav-pills">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'active', label: 'Active / Scheduled' },
            { id: 'completed', label: 'Completed' }
          ].map((tab) => (
            <li className="nav-item" key={tab.id}>
              <button
                className={`nav-link rounded-pill fw-semibold py-2 px-4 small ${filter === tab.id ? 'active' : 'text-secondary'}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading jobs..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="bi-wrench"
          title="No jobs found"
          message="No service appointments matching this view."
        />
      ) : (
        <div className="row g-3">
          {jobs.map((job) => (
            <div key={job._id} className="col-12">
              <div className="hs-card p-4 bg-white">
                <div className="row align-items-center g-3">
                  <div className="col-md-5">
                    <span className="badge bg-light text-primary border small mb-1">
                      {job.bookingReference}
                    </span>
                    <h6 className="fw-bold text-dark mb-1">{job.service?.title}</h6>
                    <div className="text-muted small">
                      <i className="bi bi-clock me-1"></i> {job.bookingDate} ({job.timeSlot})
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="small">
                      <div className="fw-bold text-dark">
                        <i className="bi bi-person me-1"></i> {job.customer?.firstName} {job.customer?.lastName}
                      </div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '250px' }}>
                        <i className="bi bi-geo-alt me-1 text-danger"></i> {job.serviceAddress?.streetAddress}, {job.serviceAddress?.city}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-3 text-md-end">
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianJobs;
