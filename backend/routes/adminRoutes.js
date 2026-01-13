const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getSystemHealth, 
  getRecentActivities 
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.get('/dashboard/stats', protect, getDashboardStats);
router.get('/dashboard/health', protect, getSystemHealth);
router.get('/dashboard/activities', protect, getRecentActivities);

module.exports = router;
