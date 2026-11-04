const { Coupon } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');

/**
 * @desc    Public/Customer: Validate coupon code & compute discount
 * @route   POST /api/coupons/validate
 * @access  Public
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return next(new AppError('Please enter a coupon code.', 400));
    }

    const orderAmount = Number(amount) || 0;
    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      validTill: { $gte: new Date() }
    });

    if (!coupon) {
      return next(new AppError('Invalid or expired coupon code.', 404));
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return next(new AppError('This coupon usage limit has been reached.', 400));
    }

    if (orderAmount < coupon.minOrderAmount) {
      return next(
        new AppError(`This coupon requires a minimum booking amount of ₹${coupon.minOrderAmount}.`, 400)
      );
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return successResponse(res, `Coupon '${coupon.code}' applied successfully!`, {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      calculatedDiscount: Math.min(discount, orderAmount),
      maxDiscountAmount: coupon.maxDiscountAmount
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin: Get all coupons
 * @route   GET /api/coupons
 * @access  Private (Admin)
 */
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return successResponse(res, 'Coupons fetched.', coupons);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin: Create coupon
 * @route   POST /api/coupons
 * @access  Private (Admin)
 */
const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validTill,
      usageLimit
    } = req.body;

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return next(new AppError('A coupon with this code already exists.', 409));
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 500,
      validTill: new Date(validTill),
      usageLimit: Number(usageLimit) || 100,
      isActive: true
    });

    return successResponse(res, 'Coupon created successfully.', coupon, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin: Toggle coupon status
 * @route   PUT /api/coupons/:id/toggle
 * @access  Private (Admin)
 */
const toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return next(new AppError('Coupon not found.', 404));
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return successResponse(res, `Coupon is now ${coupon.isActive ? 'active' : 'inactive'}.`, coupon);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Admin: Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin)
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return next(new AppError('Coupon not found.', 404));
    }
    return successResponse(res, 'Coupon deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon
};
