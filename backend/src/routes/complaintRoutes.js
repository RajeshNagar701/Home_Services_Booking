const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getAdminComplaints,
  resolveComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.post('/', protect, authorize(ROLES.CUSTOMER), createComplaint);
router.get('/my-complaints', protect, authorize(ROLES.CUSTOMER), getMyComplaints);
router.get('/admin', protect, authorize(ROLES.ADMIN), getAdminComplaints);
router.put('/:id/resolve', protect, authorize(ROLES.ADMIN), resolveComplaint);

module.exports = router;
