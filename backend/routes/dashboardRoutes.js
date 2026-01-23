const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivities } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.get('/stats', protect, getDashboardStats);
router.get('/activities', protect, getRecentActivities);

module.exports = router;
