const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const resourceController = require('../controllers/resourceController');

// Apply auth middleware
router.use(protect);

// Resource routes
router.get('/', resourceController.getAllResources);
router.get('/my-resources', resourceController.getMyResources);
router.post('/upload', upload.single('file'), resourceController.uploadResource);
router.get('/:id', resourceController.getResource);
router.put('/:id', resourceController.updateResource);
router.delete('/:id', resourceController.deleteResource);

module.exports = router;
