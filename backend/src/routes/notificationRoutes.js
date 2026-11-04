const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { protect } = require('../middleware/authMiddleware');
const { successResponse } = require('../utils/apiResponse');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    return successResponse(res, 'Notifications fetched.', notifications);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    return successResponse(res, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
});

router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    return successResponse(res, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
