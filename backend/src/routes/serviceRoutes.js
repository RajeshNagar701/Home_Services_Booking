const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.get('/', getAllServices);
router.get('/my-services', protect, authorize(ROLES.PROVIDER), getMyServices);
router.get('/:id', getServiceById);
router.post('/', protect, authorize(ROLES.PROVIDER), createService);
router.put('/:id', protect, authorize(ROLES.PROVIDER), updateService);
router.delete('/:id', protect, authorize(ROLES.PROVIDER), deleteService);

module.exports = router;
