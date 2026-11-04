const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    specializations: [
      {
        type: String,
        trim: true
      }
    ],
    experienceYears: {
      type: Number,
      default: 1,
      min: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    currentLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
      address: { type: String, default: '' }
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    completedJobsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

technicianSchema.index({ provider: 1, isAvailable: 1 });

module.exports = mongoose.model('Technician', technicianSchema);
