const express = require('express');
const router = express.Router();
const { 
  getPublicNotices, 
  getAllNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice 
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');

// Public route - no auth required
router.get('/public', getPublicNotices);

// Protected routes - require authentication
router.get('/', protect, getAllNotices);
router.post('/', protect, createNotice);
router.put('/:id', protect, updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;
