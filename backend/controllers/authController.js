const User = require('../models/user');
const OTP = require('../models/otp');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Prevent public admin signup
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot register as admin' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'  // default to student if not provided
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP
    await OTP.create({ userId: user._id, otp });

    // Send OTP via email
    await sendEmail({
      email: user.email,
      subject: 'Your UniShareSync Login OTP',
      message: `Your login OTP is ${otp}. It is valid for 10 minutes.`
    });

    res.json({
      message: 'OTP sent to your email',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ userId, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.findById(userId);

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Delete used OTP
    await otpRecord.deleteOne();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};