const express = require('express');
const router = express.Router();
const { getAssignedComplaints, updateComplaintStatus } = require('../controllers/staffController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/complaints', protect, restrictTo('STAFF'), getAssignedComplaints);
router.put('/complaints/:id/status', protect, restrictTo('STAFF'), updateComplaintStatus);

module.exports = router;
