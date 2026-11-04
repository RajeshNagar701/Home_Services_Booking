const { Review, Booking, Provider, Service } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { BOOKING_STATUS } = require('../config/constants');

/**
 * @desc    Customer: Submit a review for a completed booking
 * @route   POST /api/reviews
 * @access  Private (Customer)
 */
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return next(new AppError('Please provide booking ID, rating, and review comment.', 400));
    }

    const booking = await Booking.findOne({ _id: bookingId, customer: req.user._id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // BUSINESS RULE: Customer can only review completed bookings!
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return next(new AppError('You can only submit reviews for completed services.', 400));
    }

    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return next(new AppError('You have already submitted a review for this booking.', 409));
    }

    const review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      service: booking.service,
      rating: Number(rating),
      comment
    });

    // Recalculate provider average rating
    const providerReviews = await Review.find({ provider: booking.provider, isPublished: true });
    const avgRating = (
      providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length
    ).toFixed(1);

    await Provider.findByIdAndUpdate(booking.provider, {
      rating: Number(avgRating),
      totalReviews: providerReviews.length
    });

    // Recalculate service average rating
    const serviceReviews = await Review.find({ service: booking.service, isPublished: true });
    const serviceAvgRating = (
      serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length
    ).toFixed(1);

    await Service.findByIdAndUpdate(booking.service, {
      rating: Number(serviceAvgRating)
    });

    return successResponse(res, 'Review submitted successfully. Thank you!', review, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Provider: Reply to a review
 * @route   PUT /api/reviews/:id/reply
 * @access  Private (Provider)
 */
const replyToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const provider = await Provider.findOne({ user: req.user._id });
    const review = await Review.findOne({ _id: id, provider: provider._id });

    if (!review) {
      return next(new AppError('Review not found or not addressed to your services.', 404));
    }

    review.replyFromProvider = reply;
    await review.save();

    return successResponse(res, 'Reply posted successfully.', review);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all reviews for a provider
 * @route   GET /api/reviews/provider
 * @access  Private (Provider)
 */
const getProviderReviews = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ user: req.user._id });
    if (!provider) {
      return next(new AppError('Provider profile not found.', 404));
    }

    const reviews = await Review.find({ provider: provider._id })
      .populate('customer', 'firstName lastName avatar')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Provider reviews fetched.', reviews);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  replyToReview,
  getProviderReviews
};
