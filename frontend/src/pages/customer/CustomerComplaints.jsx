import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const CustomerComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints/my-complaints');
        if (res.success) {
          setComplaints(res.data);
        }
      } catch (err) {
        console.warn('Error fetching complaints:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Support & Complaints</h3>
        <p className="text-muted small mb-0">Track all your raised service issues and platform resolutions.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your support tickets..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon="bi-shield-check"
          title="No open issues"
          message="You have not raised any service complaints. All your appointments are in good standing."
        />
      ) : (
        <div className="row g-3">
          {complaints.map((c) => (
            <div key={c._id} className="col-12">
              <div className="hs-card p-4 bg-white">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                  <div>
                    <span className="badge bg-light text-primary border fw-bold small me-2">
                      #{c.complaintTicket}
                    </span>
                    <span className={`badge ${c.priority === 'high' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'} text-uppercase small`}>
                      {c.priority} Priority
                    </span>
                    <h5 className="fw-bold text-dark mt-2 mb-0">{c.subject}</h5>
                  </div>
                  <div>
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <p className="text-secondary small mb-3">{c.description}</p>

                {c.adminResolutionRemarks ? (
                  <div className="p-3 bg-success-subtle border border-success-subtle rounded-3 small">
                    <strong className="text-success d-block mb-1">
                      <i className="bi bi-patch-check-fill me-1"></i> Admin Resolution Update:
                    </strong>
                    <div className="text-dark">{c.adminResolutionRemarks}</div>
                  </div>
                ) : (
                  <div className="p-2 px-3 bg-light rounded-3 text-muted small d-inline-flex align-items-center gap-2">
                    <i className="bi bi-clock-history"></i>
                    <span>Super Admin investigation is currently underway. Expected turnaround: 24h.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerComplaints;
