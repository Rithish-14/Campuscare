const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllComplaints,
  assignComplaint,
  getStaffList,
  getAllUsers
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/stats', protect, restrictTo('ADMIN'), getAdminStats);
router.get('/complaints', protect, restrictTo('ADMIN'), getAllComplaints);
router.put('/complaints/:id/assign', protect, restrictTo('ADMIN'), assignComplaint);
router.get('/staff', protect, restrictTo('ADMIN'), getStaffList);
router.get('/users', protect, restrictTo('ADMIN'), getAllUsers);

module.exports = router;
