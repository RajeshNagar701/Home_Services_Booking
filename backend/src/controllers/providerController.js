const {
  Provider,
  Booking,
  Commission,
  Availability,
  ProviderDocument,
  Technician,
  User
} = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { BOOKING_STATUS, ROLES, PROVIDER_STATUS } = require('../config/constants');

/**
 * @desc    Get Provider dashboard statistics & earnings breakdown
 * @route   GET /api/providers/dashboard-stats
 * @access  Private (Provider)
 */
const getProviderDashboardStats = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return next(new AppError('Provider profile not found.', 404));
    }

    const [
      pendingBookingsCount,
      activeBookingsCount,
      completedBookingsCount,
      commissions,
      recentBookings
    ] = await Promise.all([
      Booking.countDocuments({ provider: provider._id, status: BOOKING_STATUS.PENDING }),
      Booking.countDocuments({
        provider: provider._id,
        status: {
          $in: [
            BOOKING_STATUS.ACCEPTED,
            BOOKING_STATUS.TECHNICIAN_ASSIGNED,
            BOOKING_STATUS.ON_THE_WAY,
            BOOKING_STATUS.ARRIVED,
            BOOKING_STATUS.IN_PROGRESS
          ]
        }
      }),
      Booking.countDocuments({ provider: provider._id, status: BOOKING_STATUS.COMPLETED }),
      Commission.find({ provider: provider._id }),
      Booking.find({ provider: provider._id })
        .populate('customer', 'firstName lastName avatar phone')
        .populate('service', 'title price')
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    const totalGrossRevenue = commissions.reduce((sum, c) => sum + c.totalBookingAmount, 0);
    const totalPlatformCommission = commissions.reduce((sum, c) => sum + c.platformCommissionAmount, 0);
    const totalNetEarnings = commissions.reduce((sum, c) => sum + c.providerPayoutAmount, 0);

    return successResponse(res, 'Provider dashboard statistics fetched.', {
      businessName: provider.businessName,
      verificationStatus: provider.verificationStatus,
      rating: provider.rating,
      totalReviews: provider.totalReviews,
      pendingBookingsCount,
      activeBookingsCount,
      completedBookingsCount,
      totalGrossRevenue,
      totalPlatformCommission,
      totalNetEarnings,
      recentBookings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get provider profile details
 * @route   GET /api/providers/profile
 * @access  Private (Provider)
 */
const getProviderProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email phone avatar')
      .populate('categoryIds', 'name slug icon');

    if (!provider) {
      return next(new AppError('Provider profile not found.', 404));
    }

    return successResponse(res, 'Provider profile fetched.', provider);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update provider business details, service areas, bank info
 * @route   PUT /api/providers/profile
 * @access  Private (Provider)
 */
const updateProviderProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return next(new AppError('Provider profile not found.', 404));
    }

    const { businessName, description, serviceAreas, bankDetails, categoryIds } = req.body;

    if (businessName) provider.businessName = businessName;
    if (description !== undefined) provider.description = description;
    if (serviceAreas) provider.serviceAreas = serviceAreas;
    if (bankDetails) provider.bankDetails = bankDetails;
    if (categoryIds) provider.categoryIds = categoryIds;

    await provider.save();

    return successResponse(res, 'Provider profile updated successfully.', provider);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get provider 7-day availability schedule
 * @route   GET /api/providers/availability
 * @access  Private (Provider)
 */
const getProviderAvailability = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    let schedule = await Availability.find({ provider: provider._id }).sort({ dayOfWeek: 1 });

    // If no schedule exists yet, generate default 7 days
    if (!schedule || schedule.length === 0) {
      const defaultDays = [];
      for (let day = 0; day <= 6; day++) {
        defaultDays.push({
          provider: provider._id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          slotDuration: 120,
          maxBookingsPerSlot: 2,
          isOffDay: day === 0
        });
      }
      schedule = await Availability.insertMany(defaultDays);
    }

    return successResponse(res, 'Provider availability schedule fetched.', schedule);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update provider day availability
 * @route   PUT /api/providers/availability
 * @access  Private (Provider)
 */
const updateProviderAvailability = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const { days } = req.body; // Array of { dayOfWeek, startTime, endTime, isOffDay, maxBookingsPerSlot }

    if (!Array.isArray(days)) {
      return next(new AppError('Expected an array of schedule days.', 400));
    }

    const updatedSchedule = await Promise.all(
      days.map(async (dayItem) => {
        return await Availability.findOneAndUpdate(
          { provider: provider._id, dayOfWeek: dayItem.dayOfWeek },
          {
            startTime: dayItem.startTime || '09:00',
            endTime: dayItem.endTime || '19:00',
            isOffDay: Boolean(dayItem.isOffDay),
            maxBookingsPerSlot: Number(dayItem.maxBookingsPerSlot) || 2
          },
          { upsert: true, new: true }
        );
      })
    );

    return successResponse(res, 'Availability updated successfully.', updatedSchedule);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get provider uploaded KYC documents
 * @route   GET /api/providers/documents
 * @access  Private (Provider)
 */
const getProviderDocuments = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const documents = await ProviderDocument.find({ provider: provider._id }).sort({ createdAt: -1 });

    return successResponse(res, 'Provider documents fetched.', documents);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Upload KYC document for verification
 * @route   POST /api/providers/documents
 * @access  Private (Provider)
 */
const uploadProviderDocument = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const { documentType, documentUrl, documentNumber } = req.body;

    if (!documentType || !documentUrl) {
      return next(new AppError('Please provide document type and document file URL.', 400));
    }

    const document = await ProviderDocument.create({
      provider: provider._id,
      documentType,
      documentUrl,
      documentNumber: documentNumber || '',
      status: PROVIDER_STATUS.PENDING
    });

    return successResponse(res, 'Document submitted for review.', document, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all technicians belonging to this provider
 * @route   GET /api/providers/technicians
 * @access  Private (Provider)
 */
const getProviderTechnicians = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const technicians = await Technician.find({ provider: provider._id })
      .populate('user', 'firstName lastName email phone avatar isActive')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Provider technicians fetched.', technicians);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Create / Register a new technician
 * @route   POST /api/providers/technicians
 * @access  Private (Provider)
 */
const createProviderTechnician = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    const { firstName, lastName, email, phone, password, specializations, experienceYears } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password: password || 'TechPassword123!',
      role: ROLES.TECHNICIAN,
      isEmailVerified: true
    });

    const technician = await Technician.create({
      user: user._id,
      provider: provider._id,
      specializations: Array.isArray(specializations) ? specializations : [specializations],
      experienceYears: Number(experienceYears) || 1,
      isAvailable: true
    });

    return successResponse(
      res,
      'Technician added successfully.',
      {
        technician,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProviderDashboardStats,
  getProviderProfile,
  updateProviderProfile,
  getProviderAvailability,
  updateProviderAvailability,
  getProviderDocuments,
  uploadProviderDocument,
  getProviderTechnicians,
  createProviderTechnician
};
