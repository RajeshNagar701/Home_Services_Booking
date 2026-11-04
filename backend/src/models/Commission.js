const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    totalBookingAmount: {
      type: Number,
      required: true,
      min: 0
    },
    commissionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    platformCommissionAmount: {
      type: Number,
      required: true,
      min: 0
    },
    providerPayoutAmount: {
      type: Number,
      required: true,
      min: 0
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'settled'],
      default: 'pending'
    },
    settledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

commissionSchema.index({ provider: 1, payoutStatus: 1 });

module.exports = mongoose.model('Commission', commissionSchema);
