const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0, // 0 = Sunday
      max: 6  // 6 = Saturday
    },
    startTime: {
      type: String,
      default: '09:00' // HH:mm
    },
    endTime: {
      type: String,
      default: '19:00' // HH:mm
    },
    slotDuration: {
      type: Number,
      default: 120 // 2-hour slots
    },
    maxBookingsPerSlot: {
      type: Number,
      default: 2,
      min: 1
    },
    isOffDay: {
      type: Boolean,
      default: false
    },
    customBlockedDates: [
      {
        type: String // YYYY-MM-DD
      }
    ]
  },
  {
    timestamps: true
  }
);

availabilitySchema.index({ provider: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
