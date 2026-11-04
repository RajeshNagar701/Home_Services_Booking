const express = require('express');
const router = express.Router();
const {
  getProviderDashboardStats,
  getProviderProfile,
  updateProviderProfile,
  getProviderAvailability,
  updateProviderAvailability,
  getProviderDocuments,
  uploadProviderDocument,
  getProviderTechnicians,
  createProviderTechnician,
  getPublicVerifiedProviders
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Public endpoints
router.get('/public/verified', getPublicVerifiedProviders);

// Protected endpoints

router.get('/dashboard-stats', protect, authorize(ROLES.PROVIDER), getProviderDashboardStats);
router.get('/profile', protect, authorize(ROLES.PROVIDER), getProviderProfile);
router.put('/profile', protect, authorize(ROLES.PROVIDER), updateProviderProfile);
router.get('/availability', protect, authorize(ROLES.PROVIDER), getProviderAvailability);
router.put('/availability', protect, authorize(ROLES.PROVIDER), updateProviderAvailability);
router.get('/documents', protect, authorize(ROLES.PROVIDER), getProviderDocuments);
router.post('/documents', protect, authorize(ROLES.PROVIDER), uploadProviderDocument);
router.get('/technicians', protect, authorize(ROLES.PROVIDER), getProviderTechnicians);
router.post('/technicians', protect, authorize(ROLES.PROVIDER), createProviderTechnician);

module.exports = router;
