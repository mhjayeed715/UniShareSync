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
const noticeUpload = require('../middleware/noticeUploadMiddleware');

// Public route - no auth required
router.get('/public', getPublicNotices);

// Protected routes - require authentication
router.get('/', protect, getAllNotices);
router.post('/', protect, noticeUpload.single('image'), createNotice);
router.put('/:id', protect, noticeUpload.single('image'), updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;
