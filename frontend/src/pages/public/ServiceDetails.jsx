import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('11:00 - 13:00');
  const [address, setAddress] = useState({
    streetAddress: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    contactPhone: '',
    type: 'home'
  });
  const [problemDescription, setProblemDescription] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isCouponValidating, setIsCouponValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Load saved address if customer is logged in
  useEffect(() => {
    if (user && user.phone) {
      setAddress((prev) => ({
        ...prev,
        contactPhone: user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        if (res.success && res.data) {
          setService(res.data.service);
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.warn('Error fetching service:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  // Set default minimum date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCouponValidating(true);
    try {
      const basePrice = service.discountPrice > 0 ? service.discountPrice : service.price;
      const res = await api.post('/coupons/validate', {
        code: couponCode.trim(),
        amount: basePrice
      });
      if (res.success && res.data) {
        setAppliedDiscount(res.data.calculatedDiscount);
        showToast(`Coupon '${res.data.code}' applied! Saved ₹${res.data.calculatedDiscount}`, 'success');
      }
    } catch (err) {
      setAppliedDiscount(0);
      showToast(err.message || 'Invalid coupon code', 'error');
    } finally {
      setIsCouponValidating(false);
    }
  };

  const handleBookingSubmit = async () => {
    if (!isAuthenticated) {
      showToast('Please log in as a customer to complete booking', 'warning');
      navigate('/login');
      return;
    }

    if (!address.streetAddress || !address.contactPhone) {
      showToast('Please provide your street address and contact phone', 'error');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      // 1. Create booking on backend
      const bookingPayload = {
        serviceId: service._id,
        bookingDate,
        timeSlot,
        serviceAddress: address,
        problemDescription,
        couponCode: appliedDiscount > 0 ? couponCode : '',
        paymentMethod
      };

      const res = await api.post('/bookings', bookingPayload);
      if (res.success && res.data) {
        const newBooking = res.data;

        // 2. If Razorpay selected, process online payment simulation
        if (paymentMethod === 'razorpay') {
          const orderRes = await api.post('/payments/create-order', {
            bookingId: newBooking._id
          });

          if (orderRes.success) {
            // Verify payment
            await api.post('/payments/verify', {
              bookingId: newBooking._id,
              razorpayOrderId: orderRes.data.orderId,
              razorpayPaymentId: `pay_test_${Date.now()}`,
              razorpaySignature: 'sig_mock_verified'
            });
          }
        }

        setCreatedBooking(newBooking);
        setBookingStep(3); // Success step
        showToast('Booking successfully confirmed!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Booking submission failed', 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading service details..." />;
  }

  if (!service) {
    return (
      <div className="container py-5 text-center">
        <h4>Service not found</h4>
        <Link to="/services" className="btn btn-primary mt-3">Back to Services</Link>
      </div>
    );
  }

  const basePrice = service.discountPrice > 0 ? service.discountPrice : service.price;
  const platformFee = 49;
  const totalAmount = Math.max(0, basePrice - appliedDiscount + platformFee);

  return (
    <div className="bg-light py-4 py-lg-5 min-vh-100">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small text-muted">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/services" className="text-decoration-none">Services</Link></li>
            <li className="breadcrumb-item active text-truncate" style={{ maxWidth: '300px' }}>{service.title}</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Main Service Content */}
          <div className="col-lg-8">
            <div className="hs-card p-4 mb-4 bg-white">
              <div className="position-relative mb-4 overflow-hidden rounded-4">
                <img
                  src={service.coverImage}
                  alt={service.title}
                  className="w-100"
                  style={{ maxHeight: '380px', objectFit: 'cover' }}
                />
                <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 rounded-pill px-3 py-2">
                  <i className="bi bi-clock me-1"></i> {service.durationMinutes} Minutes Service
                </span>
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-semibold">
                  {service.category?.name || 'Home Maintenance'}
                </span>
                <StarRating rating={service.rating || 4.8} totalReviews={reviews.length || 24} />
              </div>

              <h3 className="fw-bold text-dark mb-3">{service.title}</h3>

              <p className="text-secondary lead" style={{ fontSize: '1rem', lineHeight: '1.7' }}>
                {service.description}
              </p>

              {/* Verified Provider Badge */}
              <div className="p-3 rounded-3 bg-light border d-flex align-items-center justify-content-between mt-4">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-white text-primary border d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}
                  >
                    <i className="bi bi-shield-check text-success"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{service.provider?.businessName || 'Certified Service Partner'}</div>
                    <div className="text-muted small">
                      <i className="bi bi-patch-check-fill text-primary me-1"></i> Verified Business &bull; {service.provider?.serviceAreas?.[0]?.city || 'Mumbai, Pune'}
                    </div>
                  </div>
                </div>
                <div className="text-end d-none d-sm-block">
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill">
                    100% Guaranteed
                  </span>
                </div>
              </div>
            </div>

            {/* Included / Excluded Features Card */}
            <div className="hs-card p-4 mb-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Service Scope & Checklist</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="fw-semibold text-success d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-check-circle-fill"></i> What is Included
                  </h6>
                  <ul className="list-unstyled mb-0">
                    {service.includedFeatures && service.includedFeatures.length > 0 ? (
                      service.includedFeatures.map((item, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 mb-2 text-secondary small">
                          <i className="bi bi-check text-success fs-5 mt-n1"></i>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted small">Standard full diagnosis & genuine repairs.</li>
                    )}
                  </ul>
                </div>
                <div className="col-md-6 border-start-md">
                  <h6 className="fw-semibold text-danger d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-x-circle-fill"></i> What is Excluded
                  </h6>
                  <ul className="list-unstyled mb-0">
                    {service.excludedFeatures && service.excludedFeatures.length > 0 ? (
                      service.excludedFeatures.map((item, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 mb-2 text-secondary small">
                          <i className="bi bi-x text-danger fs-5 mt-n1"></i>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted small">Major civil reconstruction or replacement hardware beyond standard scope.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="hs-card p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark mb-0">Verified Customer Reviews</h5>
                <StarRating rating={service.rating || 4.8} totalReviews={reviews.length} />
              </div>

              {reviews.length === 0 ? (
                <div className="text-muted small text-center py-3">No reviews submitted yet for this service.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-3 border rounded-3 bg-light bg-opacity-50">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt="Customer"
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px' }}
                          />
                          <span className="fw-bold small text-dark">
                            {rev.customer?.firstName} {rev.customer?.lastName}
                          </span>
                        </div>
                        <StarRating rating={rev.rating} />
                      </div>
                      <p className="text-secondary small mb-1">{rev.comment}</p>
                      {rev.replyFromProvider && (
                        <div className="mt-2 p-2 bg-white rounded border small text-muted">
                          <strong className="text-primary">Response from Provider:</strong> {rev.replyFromProvider}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Sticky Card */}
          <div className="col-lg-4">
            <div className="hs-card p-4 bg-white sticky-top shadow-md" style={{ top: '80px', zIndex: 10 }}>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill small mb-2">
                Instant Confirmation
              </span>
              <div className="d-flex align-items-baseline gap-2 mb-3">
                <h2 className="fw-bold text-dark mb-0">₹{basePrice}</h2>
                {service.discountPrice > 0 && (
                  <span className="text-muted text-decoration-line-through">₹{service.price}</span>
                )}
                <span className="text-muted small">/ service</span>
              </div>

              <div className="p-3 rounded-3 bg-light border mb-3 small">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Estimated Duration:</span>
                  <span className="fw-semibold text-dark">{service.durationMinutes} mins</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Platform Safety Fee:</span>
                  <span className="fw-semibold text-dark">₹49</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Cancellation:</span>
                  <span className="text-success fw-semibold">Free before dispatch</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm mb-3"
                onClick={() => {
                  setBookingStep(1);
                  setIsBookingOpen(true);
                }}
              >
                Book This Service Now
              </button>

              <div className="d-flex flex-column gap-2 text-secondary small border-top pt-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-success fs-5"></i>
                  <span>Zero-cost warranty on rework within 30 days</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge text-primary fs-5"></i>
                  <span>Background verified, vaccinated technician</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-credit-card text-info fs-5"></i>
                  <span>Safe checkout via Razorpay or Pay On Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-STEP BOOKING MODAL */}
      {isBookingOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              {/* Modal Header */}
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <div>
                  <span className="badge bg-primary-subtle text-primary small px-2 py-1 rounded-pill mb-1">
                    Step {bookingStep} of 3
                  </span>
                  <h5 className="modal-title fw-bold text-dark">
                    {bookingStep === 1 && 'Select Date & Arrival Time Slot'}
                    {bookingStep === 2 && 'Service Address & Payment Method'}
                    {bookingStep === 3 && 'Booking Confirmed!'}
                  </h5>
                </div>
                {bookingStep !== 3 && (
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsBookingOpen(false)}
                    aria-label="Close"
                  ></button>
                )}
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                {/* STEP 1: DATE & TIME SLOT */}
                {bookingStep === 1 && (
                  <div>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-dark">Appointment Date *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={bookingDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setBookingDate(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold small text-dark">Arrival Time Window *</label>
                        <select
                          className="form-select"
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                        >
                          <option value="09:00 - 11:00">09:00 AM - 11:00 AM (Morning)</option>
                          <option value="11:00 - 13:00">11:00 AM - 01:00 PM (Noon)</option>
                          <option value="14:00 - 16:00">02:00 PM - 04:00 PM (Afternoon)</option>
                          <option value="16:00 - 18:00">04:00 PM - 06:00 PM (Evening)</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small text-dark">
                        Describe the problem or instructions (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="e.g. AC is dripping water, breaker trips when geyser is turned on, focus on kitchen grease..."
                        value={problemDescription}
                        onChange={(e) => setProblemDescription(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-2 text-muted small">
                      <i className="bi bi-info-circle text-primary fs-5"></i>
                      <span>
                        Our atomic reservation engine verifies slot capacity in real-time to guarantee zero double-bookings.
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 2: ADDRESS & PAYMENT METHOD */}
                {bookingStep === 2 && (
                  <div>
                    <h6 className="fw-bold text-dark mb-2">Service Location</h6>
                    <div className="row g-2 mb-3">
                      <div className="col-12">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Flat / House / Building / Street Address *"
                          value={address.streetAddress}
                          onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Landmark (Optional)"
                          value={address.landmark}
                          onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="City *"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="PIN Code *"
                          value={address.pincode}
                          onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Contact Phone Number *"
                          value={address.contactPhone}
                          onChange={(e) => setAddress({ ...address, contactPhone: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Coupon Box */}
                    <h6 className="fw-bold text-dark mb-2">Have a Promotional Code?</h6>
                    <div className="input-group mb-3">
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        placeholder="Try FESTIVE100 or WELCOME50"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button
                        className="btn btn-outline-primary fw-semibold"
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isCouponValidating}
                      >
                        {isCouponValidating ? 'Checking...' : 'Apply Coupon'}
                      </button>
                    </div>

                    {/* Payment Method Selector */}
                    <h6 className="fw-bold text-dark mb-2">Payment Method</h6>
                    <div className="row g-2 mb-4">
                      <div className="col-6">
                        <div
                          className={`p-3 border rounded-3 text-center cursor-pointer ${paymentMethod === 'razorpay' ? 'border-primary bg-primary-subtle' : 'bg-light'}`}
                          onClick={() => setPaymentMethod('razorpay')}
                          style={{ cursor: 'pointer' }}
                        >
                          <i className="bi bi-credit-card-2-front fs-4 text-primary d-block mb-1"></i>
                          <span className="fw-bold small d-block">Online (Razorpay)</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Card, UPI, Netbanking</span>
                        </div>
                      </div>
                      <div className="col-6">
                        <div
                          className={`p-3 border rounded-3 text-center cursor-pointer ${paymentMethod === 'cash_on_delivery' ? 'border-primary bg-primary-subtle' : 'bg-light'}`}
                          onClick={() => setPaymentMethod('cash_on_delivery')}
                          style={{ cursor: 'pointer' }}
                        >
                          <i className="bi bi-cash-stack fs-4 text-success d-block mb-1"></i>
                          <span className="fw-bold small d-block">Pay on Completion</span>
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>Cash or UPI to Pro</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="p-3 bg-light rounded-3 border small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Base Service Charge:</span>
                        <span className="fw-semibold">₹{basePrice}</span>
                      </div>
                      {appliedDiscount > 0 && (
                        <div className="d-flex justify-content-between mb-1 text-success fw-semibold">
                          <span>Coupon Discount ({couponCode}):</span>
                          <span>-₹{appliedDiscount}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Platform Safety & Insurance Fee:</span>
                        <span className="fw-semibold">₹{platformFee}</span>
                      </div>
                      <div className="d-flex justify-content-between pt-2 border-top fw-bold fs-6 text-dark">
                        <span>Total Payable:</span>
                        <span className="text-primary">₹{totalAmount}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: SUCCESS CONFIRMATION */}
                {bookingStep === 3 && createdBooking && (
                  <div className="text-center py-4">
                    <div
                      className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3 shadow"
                      style={{ width: '70px', height: '70px', fontSize: '2.2rem' }}
                    >
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <h4 className="fw-bold text-dark mb-1">Booking Confirmed!</h4>
                    <p className="text-muted small mb-3">
                      Your booking reference is <strong className="text-primary">{createdBooking.bookingReference}</strong>
                    </p>

                    <div className="p-3 bg-light rounded-3 border text-start small mb-4 mx-auto" style={{ maxWidth: '440px' }}>
                      <div className="mb-2"><strong>Service:</strong> {service.title}</div>
                      <div className="mb-2"><strong>Date & Slot:</strong> {bookingDate} ({timeSlot})</div>
                      <div className="mb-2"><strong>Address:</strong> {address.streetAddress}, {address.city}</div>
                      <div><strong>Total Amount:</strong> ₹{totalAmount} ({paymentMethod === 'razorpay' ? 'Paid Online' : 'Pay on Completion'})</div>
                    </div>

                    <div className="d-flex justify-content-center gap-2">
                      <Link to="/customer/bookings" className="btn btn-primary px-4 rounded-pill fw-semibold">
                        View Live Tracking
                      </Link>
                      <button
                        className="btn btn-outline-secondary px-4 rounded-pill"
                        onClick={() => setIsBookingOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              {bookingStep !== 3 && (
                <div className="modal-footer border-0 px-4 pb-4 pt-0">
                  {bookingStep === 2 && (
                    <button
                      type="button"
                      className="btn btn-light px-4 rounded-pill fw-semibold me-auto"
                      onClick={() => setBookingStep(1)}
                      disabled={isSubmittingBooking}
                    >
                      &larr; Back
                    </button>
                  )}
                  {bookingStep === 1 && (
                    <button
                      type="button"
                      className="btn btn-primary px-4 rounded-pill fw-semibold ms-auto"
                      onClick={() => setBookingStep(2)}
                    >
                      Continue to Address &rarr;
                    </button>
                  )}
                  {bookingStep === 2 && (
                    <button
                      type="button"
                      className="btn btn-success px-4 rounded-pill fw-bold ms-auto"
                      onClick={handleBookingSubmit}
                      disabled={isSubmittingBooking}
                    >
                      {isSubmittingBooking ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Confirming...
                        </>
                      ) : (
                        `Confirm Booking (₹${totalAmount})`
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;
