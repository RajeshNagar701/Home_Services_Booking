const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  rescheduleBooking,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
  assignTechnician,
  getTechnicianJobs,
  updateTechnicianJobStatus,
  completeTechnicianJob,
  getAdminAllBookings,
  getBookingInvoice
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Customer routes
router.post('/', protect, authorize(ROLES.CUSTOMER), createBooking);
router.get('/my-bookings', protect, authorize(ROLES.CUSTOMER), getMyBookings);
router.post('/:id/cancel', protect, authorize(ROLES.CUSTOMER), cancelBooking);
router.put('/:id/reschedule', protect, rescheduleBooking);

// Provider routes
router.get('/provider-bookings', protect, authorize(ROLES.PROVIDER), getProviderBookings);
router.put('/:id/accept', protect, authorize(ROLES.PROVIDER), acceptBooking);
router.put('/:id/reject', protect, authorize(ROLES.PROVIDER), rejectBooking);
router.put('/:id/assign-technician', protect, authorize(ROLES.PROVIDER), assignTechnician);

// Technician routes
router.get('/technician-jobs', protect, authorize(ROLES.TECHNICIAN), getTechnicianJobs);
router.put('/:id/technician-status', protect, authorize(ROLES.TECHNICIAN), updateTechnicianJobStatus);
router.post('/:id/complete', protect, authorize(ROLES.TECHNICIAN), completeTechnicianJob);

// Admin routes
router.get('/admin/all', protect, authorize(ROLES.ADMIN), getAdminAllBookings);

// General authenticated routes
router.get('/:id', protect, getBookingDetails);
router.get('/:id/invoice', protect, getBookingInvoice);

module.exports = router;
