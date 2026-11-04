const {
  Booking,
  Service,
  Provider,
  Technician,
  Customer,
  Availability,
  Coupon,
  Payment,
  Transaction,
  Commission,
  Notification,
  User,
  SlotAllocation
} = require('../models');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS, ROLES, PROVIDER_STATUS } = require('../config/constants');
const { sendBookingConfirmation } = require('../services/emailService');

/**
 * @desc    Customer: Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Customer)
 */
const createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      bookingDate,
      timeSlot,
      serviceAddress,
      problemDescription,
      problemImages,
      couponCode,
      paymentMethod = PAYMENT_METHODS.RAZORPAY
    } = req.body;

    if (!serviceId || !bookingDate || !timeSlot || !serviceAddress) {
      return next(new AppError('Please provide service, booking date, time slot, and address.', 400));
    }

    const service = await Service.findById(serviceId).populate('provider');
    if (!service || !service.isActive) {
      return next(new AppError('Service not found or currently unavailable.', 404));
    }

    const provider = service.provider;
    if (!provider || provider.verificationStatus !== PROVIDER_STATUS.APPROVED) {
      return next(new AppError('Service provider is not currently verified or accepting bookings.', 400));
    }

    // 1. BUSINESS RULE: Check Day of week availability & double-booking prevention
    const dateObj = new Date(bookingDate);
    const dayOfWeek = dateObj.getDay();

    const providerAvailability = await Availability.findOne({
      provider: provider._id,
      dayOfWeek
    });

    let maxBookingsPerSlot = 2; // Default limit
    if (providerAvailability) {
      if (providerAvailability.isOffDay) {
        return next(new AppError(`The service provider does not operate on this day of the week.`, 400));
      }
      if (providerAvailability.customBlockedDates && providerAvailability.customBlockedDates.includes(bookingDate)) {
        return next(new AppError(`The service provider is unavailable on ${bookingDate}.`, 400));
      }
      maxBookingsPerSlot = providerAvailability.maxBookingsPerSlot || 2;
    }

    // Atomic slot reservation to prevent race conditions and double booking
    const slotKey = `${provider._id}_${bookingDate}_${timeSlot}`;

    const currentActiveCount = await Booking.countDocuments({
      provider: provider._id,
      bookingDate,
      timeSlot,
      status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED] }
    });

    await SlotAllocation.updateOne(
      { slotKey },
      {
        $setOnInsert: {
          provider: provider._id,
          bookingDate,
          timeSlot,
          activeBookings: currentActiveCount
        }
      },
      { upsert: true }
    );

    // Atomically increment activeBookings ONLY IF activeBookings < maxBookingsPerSlot
    const slotReserved = await SlotAllocation.findOneAndUpdate(
      {
        slotKey,
        activeBookings: { $lt: maxBookingsPerSlot }
      },
      { $inc: { activeBookings: 1 } },
      { new: true }
    );

    if (!slotReserved) {
      return next(
        new AppError(
          `The selected time slot '${timeSlot}' on ${bookingDate} is fully booked. Please choose another slot.`,
          409
        )
      );
    }

    // 2. Pricing and coupon calculation
    const basePrice = service.discountPrice > 0 ? service.discountPrice : service.price;
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validTill: { $gte: new Date() }
      });

      if (appliedCoupon) {
        if (basePrice >= appliedCoupon.minOrderAmount) {
          if (appliedCoupon.discountType === 'percentage') {
            discount = Math.round((basePrice * appliedCoupon.discountValue) / 100);
            if (discount > appliedCoupon.maxDiscountAmount) {
              discount = appliedCoupon.maxDiscountAmount;
            }
          } else {
            discount = appliedCoupon.discountValue;
          }
          appliedCoupon.usedCount += 1;
          await appliedCoupon.save();
        }
      }
    }

    const platformFee = 49;
    const tax = 0;
    const totalAmount = Math.max(0, basePrice - discount + platformFee + tax);

    // 3. Create Booking record
    const booking = await Booking.create({
      customer: req.user._id,
      provider: provider._id,
      service: service._id,
      bookingDate,
      timeSlot,
      serviceAddress,
      problemDescription: problemDescription || '',
      problemImages: Array.isArray(problemImages) ? problemImages : [],
      status: BOOKING_STATUS.PENDING,
      statusHistory: [
        {
          status: BOOKING_STATUS.PENDING,
          timestamp: new Date(),
          updatedBy: req.user._id,
          remarks: 'Booking request placed by customer'
        }
      ],
      pricing: {
        basePrice,
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        platformFee,
        tax,
        totalAmount
      },
      paymentStatus: PAYMENT_STATUS.PENDING,
      paymentMethod
    });

    // Increment service booking counter
    service.totalBookings += 1;
    await service.save();

    // Increment customer booking counter
    await Customer.findOneAndUpdate({ user: req.user._id }, { $inc: { totalBookings: 1 } });

    // Send notifications
    await Notification.create({
      recipient: provider.user,
      title: 'New Service Booking Request',
      message: `New booking ${booking.bookingReference} received for ${service.title} on ${bookingDate}.`,
      type: 'booking_update',
      data: { bookingId: booking._id, reference: booking.bookingReference }
    });

    // Send email confirmation
    sendBookingConfirmation(req.user.email, {
      bookingReference: booking.bookingReference,
      serviceTitle: service.title,
      bookingDate,
      timeSlot,
      totalAmount
    });

    return successResponse(res, 'Booking created successfully.', booking, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Customer: Get my bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private (Customer)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customer: req.user._id };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = {
          $in: [
            BOOKING_STATUS.PENDING,
            BOOKING_STATUS.ACCEPTED,
            BOOKING_STATUS.TECHNICIAN_ASSIGNED,
            BOOKING_STATUS.ON_THE_WAY,
            BOOKING_STATUS.ARRIVED,
            BOOKING_STATUS.IN_PROGRESS
          ]
        };
      } else if (status === 'completed') {
        query.status = BOOKING_STATUS.COMPLETED;
      } else if (status === 'cancelled') {
        query.status = { $in: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED] };
      } else {
        query.status = status;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('service', 'title coverImage price durationMinutes')
        .populate('provider', 'businessName rating totalReviews')
        .populate({
          path: 'technician',
          populate: { path: 'user', select: 'firstName lastName phone avatar' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query)
    ]);

    return paginatedResponse(res, 'Customer bookings fetched.', bookings, total, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single booking details
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('customer', 'firstName lastName email phone avatar')
      .populate('provider', 'businessName description rating totalReviews serviceAreas bankDetails')
      .populate('service')
      .populate({
        path: 'technician',
        populate: { path: 'user', select: 'firstName lastName phone avatar' }
      });

    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Authorization: User must be customer, provider, assigned technician, or admin
    const isAdmin = req.user.role === ROLES.ADMIN;
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isProvider = booking.provider.user && booking.provider.user.toString() === req.user._id.toString();
    const isTech = booking.technician && booking.technician.user && booking.technician.user._id.toString() === req.user._id.toString();

    if (!isAdmin && !isCustomer && !isProvider && !isTech) {
      return next(new AppError('You are not authorized to view this booking.', 403));
    }

    return successResponse(res, 'Booking details fetched.', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Customer: Cancel a booking
 * @route   POST /api/bookings/:id/cancel
 * @access  Private (Customer)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const booking = await Booking.findOne({ _id: id, customer: req.user._id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Can only cancel before technician is en-route
    const nonCancellableStates = [
      BOOKING_STATUS.ON_THE_WAY,
      BOOKING_STATUS.ARRIVED,
      BOOKING_STATUS.IN_PROGRESS,
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CANCELLED
    ];

    if (nonCancellableStates.includes(booking.status)) {
      return next(
        new AppError(
          `Cannot cancel booking in '${booking.status}' status. Please contact support or the provider directly.`,
          400
        )
      );
    }

    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancellationReason = cancellationReason || 'Cancelled by customer';
    booking.cancelledBy = req.user._id;

    booking.statusHistory.push({
      status: BOOKING_STATUS.CANCELLED,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: booking.cancellationReason
    });

    await booking.save();

    // Release slot allocation
    const slotKey = `${booking.provider}_${booking.bookingDate}_${booking.timeSlot}`;
    await SlotAllocation.updateOne({ slotKey, activeBookings: { $gt: 0 } }, { $inc: { activeBookings: -1 } });

    return successResponse(res, 'Booking cancelled successfully.', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Customer / Provider: Reschedule a booking to a new date/slot
 * @route   PUT /api/bookings/:id/reschedule
 * @access  Private (Customer, Provider, Admin)
 */
const rescheduleBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newTimeSlot, reason } = req.body;

    if (!newDate || !newTimeSlot) {
      return next(new AppError('Please provide a new booking date and time slot.', 400));
    }

    const booking = await Booking.findById(id).populate('provider');
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Check authorization: customer, provider, or admin
    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider && booking.provider.user && booking.provider.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isCustomer && !isProvider && !isAdmin) {
      return next(new AppError('You are not authorized to reschedule this booking.', 403));
    }

    const nonReschedulableStates = [
      BOOKING_STATUS.ON_THE_WAY,
      BOOKING_STATUS.ARRIVED,
      BOOKING_STATUS.IN_PROGRESS,
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CANCELLED,
      BOOKING_STATUS.REJECTED
    ];

    if (nonReschedulableStates.includes(booking.status)) {
      return next(
        new AppError(`Cannot reschedule booking in '${booking.status}' status.`, 400)
      );
    }

    // Check provider day-of-week availability and blocked dates
    const dateObj = new Date(newDate);
    const dayOfWeek = dateObj.getDay();

    const providerAvailability = await Availability.findOne({
      provider: booking.provider._id,
      dayOfWeek
    });

    let maxBookingsPerSlot = 2;
    if (providerAvailability) {
      if (providerAvailability.isOffDay) {
        return next(new AppError('The service provider does not operate on this day of the week.', 400));
      }
      if (providerAvailability.customBlockedDates && providerAvailability.customBlockedDates.includes(newDate)) {
        return next(new AppError(`The service provider is unavailable on ${newDate}.`, 400));
      }
      maxBookingsPerSlot = providerAvailability.maxBookingsPerSlot || 2;
    }

    // Prevent double booking on new slot with atomic reservation
    const oldSlotKey = `${booking.provider._id || booking.provider}_${booking.bookingDate}_${booking.timeSlot}`;
    const newSlotKey = `${booking.provider._id || booking.provider}_${newDate}_${newTimeSlot}`;

    const newSlotCurrentCount = await Booking.countDocuments({
      _id: { $ne: booking._id },
      provider: booking.provider._id,
      bookingDate: newDate,
      timeSlot: newTimeSlot,
      status: { $nin: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.REJECTED] }
    });

    await SlotAllocation.updateOne(
      { slotKey: newSlotKey },
      {
        $setOnInsert: {
          provider: booking.provider._id,
          bookingDate: newDate,
          timeSlot: newTimeSlot,
          activeBookings: newSlotCurrentCount
        }
      },
      { upsert: true }
    );

    const newSlotReserved = await SlotAllocation.findOneAndUpdate(
      {
        slotKey: newSlotKey,
        activeBookings: { $lt: maxBookingsPerSlot }
      },
      { $inc: { activeBookings: 1 } },
      { new: true }
    );

    if (!newSlotReserved) {
      return next(
        new AppError(`The selected time slot '${newTimeSlot}' on ${newDate} is fully booked. Please choose another slot.`, 409)
      );
    }

    // Release old slot
    await SlotAllocation.updateOne(
      { slotKey: oldSlotKey, activeBookings: { $gt: 0 } },
      { $inc: { activeBookings: -1 } }
    );

    const oldDate = booking.bookingDate;
    const oldSlot = booking.timeSlot;

    booking.bookingDate = newDate;
    booking.timeSlot = newTimeSlot;
    booking.statusHistory.push({
      status: booking.status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: `Rescheduled from ${oldDate} (${oldSlot}) to ${newDate} (${newTimeSlot}). Reason: ${reason || 'Requested by user'}`
    });

    await booking.save();

    return successResponse(res, `Booking successfully rescheduled to ${newDate} (${newTimeSlot}).`, booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Get incoming & active bookings
 * @route   GET /api/bookings/provider-bookings
 * @access  Private (Provider)
 */
const getProviderBookings = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return next(new AppError('Provider profile not found.', 404));
    }

    const { status, page = 1, limit = 15 } = req.query;
    const query = { provider: provider._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customer', 'firstName lastName email phone avatar')
        .populate('service', 'title price')
        .populate({
          path: 'technician',
          populate: { path: 'user', select: 'firstName lastName phone' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query)
    ]);

    return paginatedResponse(res, 'Provider bookings fetched.', bookings, total, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Accept a booking request
 * @route   PUT /api/bookings/:id/accept
 * @access  Private (Provider)
 */
const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await Provider.findOne({ user: req.user._id });

    const booking = await Booking.findOne({ _id: id, provider: provider._id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      return next(new AppError(`Cannot accept a booking that is already in '${booking.status}' status.`, 400));
    }

    booking.status = BOOKING_STATUS.ACCEPTED;
    booking.statusHistory.push({
      status: BOOKING_STATUS.ACCEPTED,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: 'Booking confirmed by service provider'
    });

    await booking.save();

    // Notify customer
    await Notification.create({
      recipient: booking.customer,
      title: 'Booking Confirmed!',
      message: `Your booking ${booking.bookingReference} has been accepted by ${provider.businessName}.`,
      type: 'booking_update',
      data: { bookingId: booking._id }
    });

    return successResponse(res, 'Booking accepted successfully.', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Reject a booking request
 * @route   PUT /api/bookings/:id/reject
 * @access  Private (Provider)
 */
const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const provider = await Provider.findOne({ user: req.user._id });

    const booking = await Booking.findOne({ _id: id, provider: provider._id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      return next(new AppError(`Cannot reject a booking that is in '${booking.status}' status.`, 400));
    }

    booking.status = BOOKING_STATUS.REJECTED;
    booking.cancellationReason = rejectionReason || 'Provider unavailable for this time window';
    booking.statusHistory.push({
      status: BOOKING_STATUS.REJECTED,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: booking.cancellationReason
    });

    await booking.save();

    await Notification.create({
      recipient: booking.customer,
      title: 'Booking Update',
      message: `Your booking ${booking.bookingReference} could not be accepted: ${booking.cancellationReason}`,
      type: 'booking_update',
      data: { bookingId: booking._id }
    });

    return successResponse(res, 'Booking rejected.', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Assign a technician to booking
 * @route   PUT /api/bookings/:id/assign-technician
 * @access  Private (Provider)
 */
const assignTechnician = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    const provider = await Provider.findOne({ user: req.user._id });
    const booking = await Booking.findOne({ _id: id, provider: provider._id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    const technician = await Technician.findOne({ _id: technicianId, provider: provider._id }).populate('user');
    if (!technician) {
      return next(new AppError('Technician not found or not registered under your business.', 404));
    }

    booking.technician = technician._id;
    booking.status = BOOKING_STATUS.TECHNICIAN_ASSIGNED;
    booking.statusHistory.push({
      status: BOOKING_STATUS.TECHNICIAN_ASSIGNED,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: `Assigned to technician ${technician.user.firstName} ${technician.user.lastName}`
    });

    await booking.save();

    // Notify technician
    await Notification.create({
      recipient: technician.user._id,
      title: 'New Service Job Assigned',
      message: `You have been assigned to booking ${booking.bookingReference} scheduled for ${booking.bookingDate} (${booking.timeSlot}).`,
      type: 'booking_update',
      data: { bookingId: booking._id }
    });

    // Notify customer
    await Notification.create({
      recipient: booking.customer,
      title: 'Technician Assigned!',
      message: `${technician.user.firstName} ${technician.user.lastName} has been assigned to your service.`,
      type: 'booking_update',
      data: { bookingId: booking._id }
    });

    return successResponse(res, 'Technician assigned successfully.', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Technician: Get my assigned jobs
 * @route   GET /api/bookings/technician-jobs
 * @access  Private (Technician)
 */
const getTechnicianJobs = async (req, res, next) => {
  try {
    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) {
      return next(new AppError('Technician profile not found.', 404));
    }

    const { status, filter } = req.query;
    const query = { technician: technician._id };

    if (status) {
      query.status = status;
    } else if (filter === 'active') {
      query.status = {
        $in: [
          BOOKING_STATUS.TECHNICIAN_ASSIGNED,
          BOOKING_STATUS.ON_THE_WAY,
          BOOKING_STATUS.ARRIVED,
          BOOKING_STATUS.IN_PROGRESS
        ]
      };
    } else if (filter === 'completed') {
      query.status = BOOKING_STATUS.COMPLETED;
    }

    const jobs = await Booking.find(query)
      .populate('customer', 'firstName lastName phone avatar')
      .populate('service', 'title durationMinutes price')
      .sort({ bookingDate: 1, createdAt: -1 });

    return successResponse(res, 'Technician jobs fetched.', jobs);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Technician: Update job status (e.g. on_the_way, arrived, in_progress)
 * @route   PUT /api/bookings/:id/technician-status
 * @access  Private (Technician)
 */
const updateTechnicianJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) {
      return next(new AppError('Technician profile not found.', 404));
    }

    const booking = await Booking.findOne({ _id: id, technician: technician._id });

    if (!booking) {
      return next(new AppError('Job not found or not assigned to you.', 404));
    }

    // Disallow updates on terminal states
    if ([BOOKING_STATUS.CANCELLED, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.REJECTED].includes(booking.status)) {
      return next(
        new AppError(`Cannot update job status because booking is currently '${booking.status}'.`, 400)
      );
    }

    // State machine: validate linear sequence
    const allowedTransitions = {
      [BOOKING_STATUS.ACCEPTED]: [BOOKING_STATUS.ON_THE_WAY],
      [BOOKING_STATUS.TECHNICIAN_ASSIGNED]: [BOOKING_STATUS.ON_THE_WAY],
      [BOOKING_STATUS.ON_THE_WAY]: [BOOKING_STATUS.ARRIVED],
      [BOOKING_STATUS.ARRIVED]: [BOOKING_STATUS.IN_PROGRESS]
    };

    const nextAllowed = allowedTransitions[booking.status] || [];
    if (!nextAllowed.includes(status)) {
      return next(
        new AppError(
          `Invalid status transition from '${booking.status}' to '${status}'. Allowed next status: ${nextAllowed.join(', ') || 'none (use completion endpoint)'}.`,
          400
        )
      );
    }

    booking.status = status;
    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: remarks || `Technician updated status to ${status}`
    });

    await booking.save();

    // Notify customer
    let statusText = status.replace(/_/g, ' ');
    await Notification.create({
      recipient: booking.customer,
      title: `Job Update: ${statusText.toUpperCase()}`,
      message: `Your technician is now: ${statusText}.`,
      type: 'booking_update',
      data: { bookingId: booking._id }
    });

    return successResponse(res, `Job status updated to ${status}.`, booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Technician: Complete job with remarks & completion photos
 * @route   POST /api/bookings/:id/complete
 * @access  Private (Technician)
 */
const completeTechnicianJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { technicianRemarks, completionImages } = req.body;

    const technician = await Technician.findOne({ user: req.user._id });
    if (!technician) {
      return next(new AppError('Technician profile not found.', 404));
    }

    const booking = await Booking.findOne({ _id: id, technician: technician._id }).populate('provider');

    if (!booking) {
      return next(new AppError('Job not found or not assigned to you.', 404));
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      return next(new AppError('This job is already marked as completed.', 400));
    }

    // Job must be in progress or arrived before completion
    if (![BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.ARRIVED].includes(booking.status)) {
      return next(
        new AppError(`Cannot complete job while in '${booking.status}' status. Job must be 'in_progress'.`, 400)
      );
    }

    booking.status = BOOKING_STATUS.COMPLETED;
    booking.technicianRemarks = technicianRemarks || 'Work completed successfully';
    booking.completionImages = Array.isArray(completionImages) ? completionImages : [];
    booking.completedAt = new Date();

    booking.statusHistory.push({
      status: BOOKING_STATUS.COMPLETED,
      timestamp: new Date(),
      updatedBy: req.user._id,
      remarks: booking.technicianRemarks
    });

    // If payment was cash on delivery, mark paid
    if (booking.paymentMethod === PAYMENT_METHODS.CASH_ON_DELIVERY) {
      booking.paymentStatus = PAYMENT_STATUS.PAID;
    }

    await booking.save();

    // Increment technician completed jobs
    technician.completedJobsCount += 1;
    await technician.save();

    // Increment provider completed jobs
    await Provider.findByIdAndUpdate(booking.provider._id, { $inc: { completedJobsCount: 1 } });

    // Calculate Platform Commission automatically
    const totalAmount = booking.pricing.totalAmount;
    const commissionRate = booking.provider.commissionRate || 15;
    const platformCommissionAmount = Math.round((totalAmount * commissionRate) / 100);
    const providerPayoutAmount = Math.max(0, totalAmount - platformCommissionAmount);

    await Commission.findOneAndUpdate(
      { booking: booking._id },
      {
        provider: booking.provider._id,
        totalBookingAmount: totalAmount,
        commissionPercentage: commissionRate,
        platformCommissionAmount,
        providerPayoutAmount,
        payoutStatus: 'settled',
        settledAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Notify customer
    await Notification.create({
      recipient: booking.customer,
      title: 'Service Completed!',
      message: `Your service for booking ${booking.bookingReference} has been completed. Please rate your experience!`,
      type: 'booking_update',
      data: { bookingId: booking._id }
    });

    return successResponse(res, 'Job completed successfully.', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Super Admin: Get all platform bookings
 * @route   GET /api/bookings/admin/all
 * @access  Private (Admin)
 */
const getAdminAllBookings = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [{ bookingReference: { $regex: search, $options: 'i' } }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customer', 'firstName lastName email phone')
        .populate('provider', 'businessName rating')
        .populate('service', 'title price')
        .populate({
          path: 'technician',
          populate: { path: 'user', select: 'firstName lastName phone' }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query)
    ]);

    return paginatedResponse(res, 'Admin bookings fetched.', bookings, total, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get structured invoice data for a booking
 * @route   GET /api/bookings/:id/invoice
 * @access  Private
 */
const getBookingInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('customer', 'firstName lastName email phone')
      .populate('provider', 'businessName bankDetails rating')
      .populate('service', 'title description price durationMinutes');

    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    const invoice = {
      invoiceNumber: `INV-${booking.bookingReference.replace('HSB-', '')}`,
      invoiceDate: booking.createdAt,
      bookingReference: booking.bookingReference,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      customer: {
        name: `${booking.customer.firstName} ${booking.customer.lastName}`,
        email: booking.customer.email,
        phone: booking.customer.phone,
        address: booking.serviceAddress
      },
      provider: {
        businessName: booking.provider.businessName,
        rating: booking.provider.rating
      },
      items: [
        {
          description: booking.service.title,
          duration: `${booking.service.durationMinutes} mins`,
          unitPrice: booking.pricing.basePrice,
          quantity: 1,
          amount: booking.pricing.basePrice
        }
      ],
      breakdown: {
        basePrice: booking.pricing.basePrice,
        discount: booking.pricing.discount,
        couponCode: booking.pricing.couponCode || 'N/A',
        platformFee: booking.pricing.platformFee,
        tax: booking.pricing.tax,
        totalAmount: booking.pricing.totalAmount
      }
    };

    return successResponse(res, 'Invoice generated successfully.', invoice);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  rescheduleBooking,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
  assignTechnician,
  getTechnicianJobs,
  updateTechnicianJobStatus,
  completeTechnicianJob,
  getAdminAllBookings,
  getBookingInvoice
};
