import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const STEP_ORDER = [
  'pending',
  'accepted',
  'technician_assigned',
  'on_the_way',
  'arrived',
  'in_progress',
  'completed'
];

const BookingDetails = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [complaintData, setComplaintData] = useState({ subject: '', description: '', priority: 'medium' });
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.success) {
        setBooking(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Error fetching booking details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/bookings/${id}/invoice`);
      if (res.success) {
        setInvoice(res.data);
        setIsInvoiceOpen(true);
      }
    } catch (err) {
      showToast('Could not generate invoice', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        bookingId: booking._id,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      if (res.success) {
        showToast('Review submitted successfully. Thank you!', 'success');
        setIsReviewOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Error submitting review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        bookingId: booking._id,
        subject: complaintData.subject,
        description: complaintData.description,
        priority: complaintData.priority
      });
      if (res.success) {
        showToast(`Complaint registered (#${res.data.complaintTicket})`, 'success');
        setIsComplaintOpen(false);
      }
    } catch (err) {
      showToast(err.message || 'Error lodging complaint', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.post(`/bookings/${id}/cancel`, {
        cancellationReason: cancelReason
      });
      if (res.success) {
        showToast('Booking cancelled successfully', 'info');
        setIsCancelOpen(false);
        fetchDetails();
      }
    } catch (err) {
      showToast(err.message || 'Cancellation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading live booking details..." />;
  }

  if (!booking) {
    return (
      <div className="text-center py-5">
        <h4>Booking not found</h4>
        <Link to="/customer/bookings" className="btn btn-primary mt-3">Back to Bookings</Link>
      </div>
    );
  }

  const currentStepIdx = STEP_ORDER.indexOf(booking.status);
  const isCancelled = ['cancelled', 'rejected'].includes(booking.status);
  const isCancellable = ['pending', 'accepted'].includes(booking.status);

  return (
    <div>
      {/* Top Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small text-muted">
          <li className="breadcrumb-item"><Link to="/customer/dashboard" className="text-decoration-none">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link to="/customer/bookings" className="text-decoration-none">My Bookings</Link></li>
          <li className="breadcrumb-item active text-primary fw-bold">{booking.bookingReference}</li>
        </ol>
      </nav>

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bold text-dark mb-0">{booking.service?.title}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-muted small mb-0">
            Booking Reference: <strong className="text-dark">{booking.bookingReference}</strong> &bull; Placed on {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-2">
          <button onClick={fetchInvoice} className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold">
            <i className="bi bi-file-earmark-text me-1"></i> Tax Invoice
          </button>
          {booking.status === 'completed' && (
            <button onClick={() => setIsReviewOpen(true)} className="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark">
              <i className="bi bi-star-fill me-1"></i> Rate Service
            </button>
          )}
          <button onClick={() => setIsComplaintOpen(true)} className="btn btn-outline-danger btn-sm rounded-pill px-3">
            <i className="bi bi-shield-exclamation me-1"></i> Need Help?
          </button>
          {isCancellable && (
            <button onClick={() => setIsCancelOpen(true)} className="btn btn-light text-danger btn-sm rounded-pill px-3 border">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* LIVE TRACKING TIMELINE STEPPER */}
      <div className="hs-card p-4 p-md-5 bg-white mb-4 shadow-sm">
        <h5 className="fw-bold text-dark mb-4">Live Service Journey</h5>

        {isCancelled ? (
          <div className="alert alert-danger d-flex align-items-center gap-3 rounded-3 mb-0">
            <i className="bi bi-x-circle-fill fs-3"></i>
            <div>
              <h6 className="fw-bold mb-1">Booking {booking.status === 'cancelled' ? 'Cancelled' : 'Rejected'}</h6>
              <p className="small mb-0">Reason: {booking.cancellationReason || 'No specific reason provided.'}</p>
            </div>
          </div>
        ) : (
          <div className="position-relative">
            {/* Progress line */}
            <div className="d-none d-md-block position-absolute top-50 start-0 translate-middle-y w-100 bg-light" style={{ height: '4px', zIndex: 1 }}>
              <div
                className="bg-primary h-100 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, (currentStepIdx / (STEP_ORDER.length - 1)) * 100))}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="row text-center position-relative g-2" style={{ zIndex: 2 }}>
              {[
                { key: 'pending', label: 'Placed', icon: 'bi-check-lg' },
                { key: 'accepted', label: 'Confirmed', icon: 'bi-patch-check' },
                { key: 'technician_assigned', label: 'Tech Assigned', icon: 'bi-person-badge' },
                { key: 'on_the_way', label: 'On The Way', icon: 'bi-truck' },
                { key: 'arrived', label: 'Arrived', icon: 'bi-geo-alt' },
                { key: 'in_progress', label: 'In Progress', icon: 'bi-tools' },
                { key: 'completed', label: 'Completed', icon: 'bi-check-all' }
              ].map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step.key} className="col">
                    <div
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm ${isCurrent ? 'bg-primary text-white ring-4' : isPassed ? 'bg-success text-white' : 'bg-light text-muted border'}`}
                      style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}
                    >
                      <i className={`bi ${step.icon}`}></i>
                    </div>
                    <div className={`small fw-bold ${isCurrent ? 'text-primary' : isPassed ? 'text-dark' : 'text-muted'}`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Left Col: Service & Location Details */}
        <div className="col-lg-8">
          {/* Assigned Technician Card */}
          {booking.technician ? (
            <div className="hs-card p-4 bg-white mb-4 border border-primary border-opacity-25 shadow-sm">
              <span className="badge bg-primary-subtle text-primary small px-2 py-1 rounded-pill mb-2">
                YOUR ASSIGNED FIELD PRO
              </span>
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={booking.technician.user?.avatar || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120'}
                    alt="Technician"
                    className="rounded-circle border border-primary"
                    style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 className="fw-bold text-dark mb-0">
                      {booking.technician.user?.firstName} {booking.technician.user?.lastName}
                    </h5>
                    <div className="text-muted small">
                      {booking.technician.specializations?.join(', ') || 'Certified Master Technician'} &bull; {booking.technician.experienceYears || 5} yrs exp
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${booking.technician.user?.phone || '+919866778899'}`}
                  className="btn btn-success btn-sm rounded-pill px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="bi bi-telephone-fill"></i>
                  <span>Call Technician</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="hs-card p-4 bg-white mb-4 text-center">
              <i className="bi bi-person-clock text-warning fs-3 mb-2 d-block"></i>
              <h6 className="fw-bold text-dark mb-1">Technician Dispatch in Progress</h6>
              <p className="text-muted small mb-0">
                {booking.provider?.businessName} is assigning the nearest certified field specialist to your appointment.
              </p>
            </div>
          )}

          {/* Service & Problem Details */}
          <div className="hs-card p-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">Service & Address Snapshot</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="text-muted small d-block">Appointment Window</label>
                <div className="fw-semibold text-dark">
                  <i className="bi bi-calendar3 me-1 text-primary"></i> {booking.bookingDate} ({booking.timeSlot})
                </div>
              </div>
              <div className="col-md-6">
                <label className="text-muted small d-block">Service Provider</label>
                <div className="fw-semibold text-dark">
                  <i className="bi bi-building me-1 text-primary"></i> {booking.provider?.businessName}
                </div>
              </div>
              <div className="col-12">
                <label className="text-muted small d-block">Service Location Address</label>
                <div className="fw-semibold text-dark">
                  <i className="bi bi-geo-alt me-1 text-danger"></i>
                  {booking.serviceAddress?.streetAddress}, {booking.serviceAddress?.landmark && `${booking.serviceAddress.landmark}, `}
                  {booking.serviceAddress?.city}, {booking.serviceAddress?.state} - {booking.serviceAddress?.pincode}
                </div>
                <div className="text-muted small mt-1">
                  Contact Phone: {booking.serviceAddress?.contactPhone}
                </div>
              </div>
              {booking.problemDescription && (
                <div className="col-12">
                  <label className="text-muted small d-block">Customer Problem Notes</label>
                  <div className="p-3 bg-light rounded-3 text-secondary small">
                    {booking.problemDescription}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Technician Remarks & Work Proof (If Completed) */}
          {booking.status === 'completed' && (
            <div className="hs-card p-4 bg-white border border-success border-opacity-25">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-check-circle-fill text-success fs-4"></i>
                <h5 className="fw-bold text-dark mb-0">Job Completion Evidence</h5>
              </div>
              <p className="text-secondary small mb-3">
                <strong>Technician Remarks:</strong> {booking.technicianRemarks || 'Work completed to customer satisfaction.'}
              </p>
              {booking.completionImages && booking.completionImages.length > 0 && (
                <div>
                  <label className="text-muted small d-block mb-2">Work Photos Uploaded</label>
                  <div className="d-flex gap-2">
                    {booking.completionImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt="Completion evidence"
                        className="rounded-3 border"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Price Breakdown & Payment Card */}
        <div className="col-lg-4">
          <div className="hs-card p-4 bg-white shadow-sm">
            <h5 className="fw-bold text-dark mb-3">Payment Summary</h5>

            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Base Service Charge:</span>
              <span className="fw-semibold">₹{booking.pricing?.basePrice}</span>
            </div>

            {booking.pricing?.discount > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success small fw-semibold">
                <span>Coupon Savings ({booking.pricing.couponCode}):</span>
                <span>-₹{booking.pricing.discount}</span>
              </div>
            )}

            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Platform Safety Fee:</span>
              <span className="fw-semibold">₹{booking.pricing?.platformFee}</span>
            </div>

            <hr className="my-2" />

            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <span className="fw-bold text-dark">Total Amount:</span>
              <span className="fw-bold fs-4 text-primary">₹{booking.pricing?.totalAmount}</span>
            </div>

            <div className="p-3 bg-light rounded-3 border small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Payment Status:</span>
                <span className={`fw-bold text-uppercase ${booking.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                  {booking.paymentStatus}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Payment Method:</span>
                <span className="fw-semibold text-dark text-uppercase">{booking.paymentMethod.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. TAX INVOICE MODAL */}
      {isInvoiceOpen && invoice && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded-3 bg-primary text-white p-2" style={{ fontSize: '1.2rem' }}>
                    <i className="bi bi-tools"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">HomeServe Technologies</h5>
                    <span className="text-muted small">Official Tax Invoice #{invoice.invoiceNumber}</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setIsInvoiceOpen(false)}></button>
              </div>

              <div className="row g-3 small mb-4">
                <div className="col-6">
                  <strong className="text-muted d-block">Billed To:</strong>
                  <div className="fw-bold text-dark">{invoice.customer?.name}</div>
                  <div className="text-muted">{invoice.customer?.email}</div>
                  <div className="text-muted">{invoice.customer?.phone}</div>
                </div>
                <div className="col-6 text-end">
                  <strong className="text-muted d-block">Fulfilled By:</strong>
                  <div className="fw-bold text-dark">{invoice.provider?.businessName}</div>
                  <div className="text-muted">Booking Ref: {invoice.bookingReference}</div>
                  <div className="text-muted">Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
                </div>
              </div>

              <table className="table table-bordered small mb-3">
                <thead className="table-light">
                  <tr>
                    <th>Service Item</th>
                    <th className="text-center">Duration</th>
                    <th className="text-end">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.description}</td>
                      <td className="text-center">{item.duration}</td>
                      <td className="text-end fw-semibold">₹{item.amount}</td>
                    </tr>
                  ))}
                  {invoice.breakdown?.discount > 0 && (
                    <tr className="text-success">
                      <td colSpan="2">Promotional Discount ({invoice.breakdown.couponCode})</td>
                      <td className="text-end">-₹{invoice.breakdown.discount}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="2">Platform Facilitation & Insurance Fee</td>
                    <td className="text-end">₹{invoice.breakdown?.platformFee}</td>
                  </tr>
                  <tr className="table-light fw-bold fs-6">
                    <td colSpan="2">Total Paid Amount</td>
                    <td className="text-end text-primary">₹{invoice.breakdown?.totalAmount}</td>
                  </tr>
                </tbody>
              </table>

              <div className="d-flex justify-content-between align-items-center pt-2">
                <span className="badge bg-success-subtle text-success py-2 px-3 rounded-pill fw-bold">
                  STATUS: {invoice.paymentStatus?.toUpperCase()} ({invoice.paymentMethod?.toUpperCase()})
                </span>
                <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => window.print()}>
                  <i className="bi bi-printer me-1"></i> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. RATING & REVIEW MODAL */}
      {isReviewOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Rate Your Service Experience</h5>
                <button type="button" className="btn-close" onClick={() => setIsReviewOpen(false)}></button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="text-center my-3">
                  <label className="form-label d-block text-muted small mb-2">Select Your Rating</label>
                  <StarRating
                    rating={reviewData.rating}
                    interactive={true}
                    onRatingChange={(r) => setReviewData({ ...reviewData, rating: r })}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">Your Review Feedback *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Tell us what you loved about the service, technician punctuality, and work quality..."
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill text-dark" disabled={isSubmitting}>
                  {isSubmitting ? 'Posting Review...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. LODGE COMPLAINT MODAL */}
      {isComplaintOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Raise a Service Issue / Complaint</h5>
                <button type="button" className="btn-close" onClick={() => setIsComplaintOpen(false)}></button>
              </div>

              <form onSubmit={handleComplaintSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">Subject / Issue Summary *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Minor drip recurred, Technician arrived late"
                    value={complaintData.subject}
                    onChange={(e) => setComplaintData({ ...complaintData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">Priority Level</label>
                  <select
                    className="form-select"
                    value={complaintData.priority}
                    onChange={(e) => setComplaintData({ ...complaintData, priority: e.target.value })}
                  >
                    <option value="low">Low (General inquiry)</option>
                    <option value="medium">Medium (Service issue)</option>
                    <option value="high">High (Urgent rework required)</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small text-dark">Detailed Description *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Please provide full details so our platform admin can investigate and resolve immediately..."
                    value={complaintData.description}
                    onChange={(e) => setComplaintData({ ...complaintData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-danger w-100 fw-bold rounded-pill" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering Ticket...' : 'Submit Complaint Ticket'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. CANCEL BOOKING MODAL */}
      {isCancelOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-danger mb-0">Cancel Service Booking</h5>
                <button type="button" className="btn-close" onClick={() => setIsCancelOpen(false)}></button>
              </div>

              <p className="text-muted small mb-3">
                Are you sure you want to cancel booking <strong>{booking.bookingReference}</strong>? Cancellation is free before technician dispatch.
              </p>

              <div className="mb-4">
                <label className="form-label fw-semibold small text-dark">Reason for Cancellation</label>
                <select
                  className="form-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="Change of plans">Change of plans / rescheduled</option>
                  <option value="Found alternative service">Found alternative service</option>
                  <option value="Booked by mistake">Booked by mistake</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-light rounded-pill px-4" onClick={() => setIsCancelOpen(false)}>
                  Keep Booking
                </button>
                <button className="btn btn-danger rounded-pill px-4 fw-bold" onClick={handleCancelBooking} disabled={isSubmitting}>
                  {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
