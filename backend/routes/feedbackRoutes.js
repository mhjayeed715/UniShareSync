const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  getMyFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackById,
  respondToFeedback,
  updateFeedbackStatus,
  archiveFeedback,
  resolveFeedback
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/feedback/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(protect);

// Get all feedback (for community view)
router.get('/', getAllFeedback);

// Get user's feedback
router.get('/my-feedback', getMyFeedback);

// Get specific feedback
router.get('/:id', getFeedbackById);

// Create new feedback
router.post('/', upload.single('image'), createFeedback);

// Update feedback
router.put('/:id', upload.single('image'), updateFeedback);

// Respond to feedback (admin only)
router.post('/:id/respond', respondToFeedback);

// Update feedback status (admin only)
router.patch('/:id/status', updateFeedbackStatus);

// Archive feedback (user only)
router.patch('/:id/archive', archiveFeedback);

// Resolve feedback (user only)
router.patch('/:id/resolve', resolveFeedback);

// Delete feedback
router.delete('/:id', deleteFeedback);

module.exports = router;