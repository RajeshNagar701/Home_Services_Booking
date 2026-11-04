const mongoose = require('mongoose');
const { PROVIDER_STATUS, DEFAULT_COMMISSION_RATE } = require('../config/constants');

const providerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    categoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    verificationStatus: {
      type: String,
      enum: Object.values(PROVIDER_STATUS),
      default: PROVIDER_STATUS.PENDING
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    serviceAreas: [
      {
        city: { type: String, required: true },
        pincodes: [{ type: String }]
      }
    ],
    commissionRate: {
      type: Number,
      default: DEFAULT_COMMISSION_RATE,
      min: 0,
      max: 100
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    completedJobsCount: {
      type: Number,
      default: 0
    },
    bankDetails: {
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' }
    },
    documentsVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

providerSchema.index({ verificationStatus: 1 });
providerSchema.index({ 'serviceAreas.city': 1 });

module.exports = mongoose.model('Provider', providerSchema);
