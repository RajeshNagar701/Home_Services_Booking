import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProviderKYC = () => {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    documentType: 'business_license',
    documentNumber: '',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'
  });

  const fetchDocs = async () => {
    try {
      const res = await api.get('/providers/documents');
      if (res.success) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.warn('Error fetching KYC docs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const res = await api.post('/providers/documents', formData);
      if (res.success) {
        showToast('Document submitted for Super Admin review!', 'success');
        setFormData({
          documentType: 'business_license',
          documentNumber: '',
          documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'
        });
        fetchDocs();
      }
    } catch (err) {
      showToast(err.message || 'Error uploading document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Provider KYC & Verification</h3>
        <p className="text-muted small mb-0">Upload official business registration, trade certificates, and ID proofs for verification.</p>
      </div>

      <div className="row g-4">
        {/* Upload New Document Card */}
        <div className="col-lg-5">
          <div className="hs-card p-4 bg-white shadow-sm">
            <h5 className="fw-bold text-dark mb-3">Submit New KYC Document</h5>

            <form onSubmit={handleUpload}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Document Type *</label>
                <select
                  className="form-select"
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                >
                  <option value="business_license">Business License / GSTIN</option>
                  <option value="id_proof">Government ID / PAN Card</option>
                  <option value="trade_certificate">Trade Skill Certificate</option>
                  <option value="address_proof">Electricity / Utility Bill</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Document / Registration Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. GSTIN27AABCA1234F1ZP"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Document Image / Scan URL *</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.documentUrl}
                  onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill" disabled={isUploading}>
                {isUploading ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        </div>

        {/* Uploaded Documents Ledger */}
        <div className="col-lg-7">
          <div className="hs-card p-4 bg-white shadow-sm">
            <h5 className="fw-bold text-dark mb-3">Verification History & Status</h5>

            {isLoading ? (
              <LoadingSpinner message="Checking verification status..." />
            ) : documents.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                No verification documents submitted yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-custom">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Identifier</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id}>
                        <td className="fw-bold text-dark small text-capitalize">
                          {doc.documentType.replace(/_/g, ' ')}
                        </td>
                        <td className="small text-muted">{doc.documentNumber || 'N/A'}</td>
                        <td><StatusBadge status={doc.status} /></td>
                        <td className="small text-secondary">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderKYC;
