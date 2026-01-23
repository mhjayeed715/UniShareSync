const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');
const profileUpload = require('../middleware/profileUploadMiddleware');

router.use(protect);

router.put('/update', profileUpload.single('profilePicture'), profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

module.exports = router;
