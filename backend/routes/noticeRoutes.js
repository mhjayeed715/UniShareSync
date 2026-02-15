const express = require('express');
const router = express.Router();
const { 
  getPublicNotices, 
  getAllNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice,
  getNoticeImage
} = require('../controllers/noticeController');
const { protect } = require('../middleware/authMiddleware');
const noticeUpload = require('../middleware/noticeUploadMiddleware');

// Public routes - no auth required
router.get('/public', getPublicNotices);
router.get('/:id/image', getNoticeImage);

// Protected routes - require authentication
router.get('/', protect, getAllNotices);
router.post('/', protect, noticeUpload.single('image'), createNotice);
router.put('/:id', protect, noticeUpload.single('image'), updateNotice);
router.delete('/:id', protect, deleteNotice);

module.exports = router;
