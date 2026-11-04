const mongoose = require('mongoose');
const { COMPLAINT_STATUS, COMPLAINT_PRIORITY } = require('../config/constants');

const complaintSchema = new mongoose.Schema(
  {
    complaintTicket: {
      type: String,
      unique: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: Object.values(COMPLAINT_PRIORITY),
      default: COMPLAINT_PRIORITY.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.OPEN
    },
    adminResolutionRemarks: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.pre('save', function (next) {
  if (!this.complaintTicket) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.complaintTicket = `CMP-${Date.now().toString().slice(-6)}-${randomHex}`;
  }
  next();
});

complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ raisedBy: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
