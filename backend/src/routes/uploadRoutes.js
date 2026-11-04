const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { successResponse } = require('../utils/apiResponse');

const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a valid file.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return successResponse(res, 'File uploaded successfully.', {
    fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
};

router.post('/', protect, upload.single('file'), handleUpload);
router.post('/file', protect, upload.single('file'), handleUpload);

module.exports = router;
