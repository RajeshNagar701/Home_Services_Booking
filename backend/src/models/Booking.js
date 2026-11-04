const mongoose = require('mongoose');
const { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Technician',
      default: null
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    bookingDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Booking date is required']
    },
    timeSlot: {
      type: String, // e.g., '10:00 - 12:00'
      required: [true, 'Time slot is required']
    },
    serviceAddress: {
      streetAddress: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      contactPhone: { type: String, required: true },
      type: { type: String, default: 'home' }
    },
    problemDescription: {
      type: String,
      trim: true,
      default: ''
    },
    problemImages: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remarks: { type: String, default: '' }
      }
    ],
    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      couponCode: { type: String, default: '' },
      platformFee: { type: Number, default: 49 },
      tax: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true, min: 0 }
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.RAZORPAY
    },
    technicianRemarks: {
      type: String,
      default: ''
    },
    completionImages: [
      {
        type: String
      }
    ],
    completedAt: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Pre-save to auto-generate unique booking reference if not present
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingReference = `HSB-${dateStr}-${randomHex}`;
  }
  next();
});

// Composite indexes for fast queries & atomic availability validation
bookingSchema.index({ provider: 1, bookingDate: 1, timeSlot: 1, status: 1 });
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ technician: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
