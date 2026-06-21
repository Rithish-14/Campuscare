const express = require('express');
const router = express.Router();
const {
  predictComplaint,
  createComplaint,
  getStudentComplaints,
  getComplaintById,
  closeComplaint
} = require('../controllers/complaintController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/predict', protect, restrictTo('STUDENT'), predictComplaint);
router.post('/', protect, restrictTo('STUDENT'), upload.single('image'), createComplaint);
router.get('/my', protect, restrictTo('STUDENT'), getStudentComplaints);
router.put('/:id/close', protect, restrictTo('STUDENT'), closeComplaint);
router.get('/:id', protect, getComplaintById);

module.exports = router;
