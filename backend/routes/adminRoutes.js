const express = require('express');
const { getDelayedComplaints, getDashboardStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/delayed', getDelayedComplaints);
router.get('/dashboard', getDashboardStats);

module.exports = router;
