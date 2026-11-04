const mongoose = require('mongoose');
const { PROVIDER_STATUS } = require('../config/constants');

const providerDocumentSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true
    },
    documentType: {
      type: String,
      enum: ['id_proof', 'business_license', 'trade_certificate', 'address_proof'],
      required: true
    },
    documentUrl: {
      type: String,
      required: [true, 'Document URL is required']
    },
    documentNumber: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: Object.values(PROVIDER_STATUS),
      default: PROVIDER_STATUS.PENDING
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

providerDocumentSchema.index({ provider: 1, status: 1 });

module.exports = mongoose.model('ProviderDocument', providerDocumentSchema);
