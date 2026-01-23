const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getMyItems,
  createItem,
  createPublicItem,
  updateItem,
  deleteItem,
  getItemById,
  updateItemStatus,
  foundResponse
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/lost-found/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// PUBLIC ROUTES
router.post('/public-test', (req, res) => {
  res.json({ message: 'Public route works', body: req.body });
});
router.post('/public-report', createPublicItem);
router.get('/', getAllItems);

// PROTECTED ROUTES
router.get('/my-items', protect, getMyItems);
router.get('/:id', protect, getItemById);
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.post('/:id/found-response', protect, foundResponse);
router.patch('/:id/status', protect, updateItemStatus);
router.delete('/:id', protect, deleteItem);

module.exports = router;