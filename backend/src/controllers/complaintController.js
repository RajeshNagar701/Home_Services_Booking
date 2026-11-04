const { Complaint, Booking, Provider, Notification } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { COMPLAINT_STATUS } = require('../config/constants');

/**
 * @desc    Customer: Raise a complaint for a booking
 * @route   POST /api/complaints
 * @access  Private (Customer)
 */
const createComplaint = async (req, res, next) => {
  try {
    const { bookingId, subject, description, priority } = req.body;

    if (!bookingId || !subject || !description) {
      return next(new AppError('Please provide booking ID, subject, and detailed description.', 400));
    }

    const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    const complaint = await Complaint.create({
      booking: booking._id,
      raisedBy: req.user._id,
      provider: booking.provider,
      subject,
      description,
      priority: priority || 'medium',
      status: COMPLAINT_STATUS.OPEN
    });

    return successResponse(
      res,
      `Complaint registered with ticket #${complaint.complaintTicket}. Our support team will review it shortly.`,
      complaint,
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Customer: Get my complaints
 * @route   GET /api/complaints/my-complaints
 * @access  Private (Customer)
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ raisedBy: req.user._id })
      .populate('booking', 'bookingReference bookingDate timeSlot')
      .populate('provider', 'businessName')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Customer complaints fetched.', complaints);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin: Get all complaints
 * @route   GET /api/complaints/admin
 * @access  Private (Admin)
 */
const getAdminComplaints = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('raisedBy', 'firstName lastName email phone')
        .populate('provider', 'businessName rating')
        .populate('booking', 'bookingReference bookingDate pricing')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Complaint.countDocuments(query)
    ]);

    return paginatedResponse(res, 'Admin complaints fetched.', complaints, total, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin: Resolve / update complaint
 * @route   PUT /api/complaints/:id/resolve
 * @access  Private (Admin)
 */
const resolveComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminResolutionRemarks } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return next(new AppError('Complaint not found.', 404));
    }

    if (status) complaint.status = status;
    if (adminResolutionRemarks) complaint.adminResolutionRemarks = adminResolutionRemarks;
    if (status === COMPLAINT_STATUS.RESOLVED || status === COMPLAINT_STATUS.CLOSED) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Notify customer
    await Notification.create({
      recipient: complaint.raisedBy,
      title: `Complaint Ticket ${complaint.complaintTicket} Update`,
      message: `Status updated to ${complaint.status}. Remarks: ${complaint.adminResolutionRemarks || 'Under review'}`,
      type: 'complaint_update',
      data: { complaintId: complaint._id }
    });

    return successResponse(res, 'Complaint updated successfully.', complaint);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAdminComplaints,
  resolveComplaint
};
