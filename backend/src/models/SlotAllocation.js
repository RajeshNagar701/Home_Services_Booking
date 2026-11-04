const mongoose = require('mongoose');

const slotAllocationSchema = new mongoose.Schema(
  {
    slotKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    bookingDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    timeSlot: {
      type: String, // HH:mm - HH:mm
      required: true
    },
    activeBookings: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

slotAllocationSchema.index({ provider: 1, bookingDate: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('SlotAllocation', slotAllocationSchema);
