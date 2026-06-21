const express = require('express');
const router = express.Router();
const { getAssignedComplaints, updateComplaintStatus } = require('../controllers/staffController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/complaints', protect, restrictTo('STAFF'), getAssignedComplaints);
router.put('/complaints/:id/status', protect, restrictTo('STAFF'), upload.single('resolutionImage'), updateComplaintStatus);

module.exports = router;
