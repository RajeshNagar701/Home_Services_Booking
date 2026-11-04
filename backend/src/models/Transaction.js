const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    type: {
      type: String,
      enum: ['payment', 'refund', 'payout', 'commission'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'success'
    },
    referenceId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

transactionSchema.index({ booking: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
