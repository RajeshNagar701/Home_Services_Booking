const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getAdminProviders,
  verifyProvider,
  getAdminCustomers,
  getAdminCommissions
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.use(protect, authorize(ROLES.ADMIN));

router.get('/analytics', getAdminAnalytics);
router.get('/providers', getAdminProviders);
router.put('/providers/:id/verify', verifyProvider);
router.get('/customers', getAdminCustomers);
router.get('/commissions', getAdminCommissions);

module.exports = router;
