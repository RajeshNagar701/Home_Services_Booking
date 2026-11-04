const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.post('/validate', validateCoupon);
router.get('/', protect, authorize(ROLES.ADMIN), getAllCoupons);
router.post('/', protect, authorize(ROLES.ADMIN), createCoupon);
router.put('/:id/toggle', protect, authorize(ROLES.ADMIN), toggleCouponStatus);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCoupon);

module.exports = router;
