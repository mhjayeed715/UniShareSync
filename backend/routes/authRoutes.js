const express = require('express');
const {
  signup,
  login,
  verifyOTP,
  resendOTP,
  verifyToken
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/verify-token', protect, verifyToken);

module.exports = router;