const express = require('express');
const router = express.Router();
const { createReview, replyToReview, getProviderReviews } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.post('/', protect, authorize(ROLES.CUSTOMER), createReview);
router.put('/:id/reply', protect, authorize(ROLES.PROVIDER), replyToReview);
router.get('/provider', protect, authorize(ROLES.PROVIDER), getProviderReviews);

module.exports = router;
