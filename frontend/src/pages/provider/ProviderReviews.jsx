import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProviderReviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyModal, setReplyModal] = useState({ isOpen: false, reviewId: null, text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews/provider');
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      console.warn('Error fetching reviews:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.put(`/reviews/${replyModal.reviewId}/reply`, {
        reply: replyModal.text
      });
      if (res.success) {
        showToast('Reply published successfully!', 'success');
        setReplyModal({ isOpen: false, reviewId: null, text: '' });
        fetchReviews();
      }
    } catch (err) {
      showToast(err.message || 'Error submitting reply', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Customer Reviews & Ratings</h3>
        <p className="text-muted small mb-0">Monitor verified customer feedback and publish official business replies.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading customer reviews..." />
      ) : reviews.length === 0 ? (
        <div className="hs-card p-5 text-center bg-white">
          <i className="bi bi-star text-muted fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark">No customer reviews yet</h5>
          <p className="text-muted small">Reviews submitted by customers upon job completion will show up here.</p>
        </div>
      ) : (
        <div className="row g-3">
          {reviews.map((rev) => (
            <div key={rev._id} className="col-12">
              <div className="hs-card p-4 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt="Customer"
                      className="rounded-circle"
                      style={{ width: '36px', height: '36px' }}
                    />
                    <div>
                      <h6 className="fw-bold text-dark mb-0">{rev.customer?.firstName} {rev.customer?.lastName}</h6>
                      <div className="text-muted small">{rev.service?.title}</div>
                    </div>
                  </div>
                  <StarRating rating={rev.rating} />
                </div>

                <p className="text-secondary small mb-3">{rev.comment}</p>

                {rev.replyFromProvider ? (
                  <div className="p-3 bg-light rounded-3 border small">
                    <strong className="text-primary d-block mb-1">Your Published Reply:</strong>
                    <div className="text-muted">{rev.replyFromProvider}</div>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
                    onClick={() => setReplyModal({ isOpen: true, reviewId: rev._id, text: '' })}
                  >
                    <i className="bi bi-reply me-1"></i> Reply to Customer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPLY MODAL */}
      {replyModal.isOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Reply to Review</h5>
                <button type="button" className="btn-close" onClick={() => setReplyModal({ isOpen: false, reviewId: null, text: '' })}></button>
              </div>

              <form onSubmit={handleReplySubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Your Response *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Thank the customer for their patronage and highlight your service commitments..."
                    value={replyModal.text}
                    onChange={(e) => setReplyModal({ ...replyModal, text: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setReplyModal({ isOpen: false, reviewId: null, text: '' })}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
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

export default ProviderReviews;
