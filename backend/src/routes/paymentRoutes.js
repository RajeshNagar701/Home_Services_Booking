const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, handleWebhook, refundPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.post('/create-order', protect, authorize(ROLES.CUSTOMER), createPaymentOrder);
router.post('/verify', protect, authorize(ROLES.CUSTOMER), verifyPayment);
router.post('/webhook', handleWebhook);
router.post('/:id/refund', protect, authorize(ROLES.ADMIN), refundPayment);

module.exports = router;
