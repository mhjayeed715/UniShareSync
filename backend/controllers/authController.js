const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register new user
// @route   POST /api/auth/signup
exports.signup = async (req, res) => {
  const { name, email, password, role, designation, department } = req.body;

  try {
    // Prevent public admin signup
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot register as admin' });
    }

    // Validate email format
    // Allow any email ending in .ac.bd
    const emailRegex = /^[\w.-]+@[\w.-]+\.ac\.bd$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format. Please use a university email ending in .ac.bd' });
    }

    // Validate password length
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'faculty' && (!designation || !designation.trim())) {
      return res.status(400).json({ message: 'Designation is required for faculty signup' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: (role || 'student').toUpperCase(),  
        designation: designation?.trim(),
        department: department?.trim()
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    console.log('Login attempt:', email);
    
    await prisma.$queryRaw`SELECT 1`;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User authenticated:', user.role);

    const testEmails = ['student@test.com', 'faculty@test.com'];
    const isTestAccount = testEmails.includes(user.email);
    
    // Check if user can skip OTP (remember me within 24 hours)
    const canSkipOtp = rememberMe && user.lastLoginSkipOtp && 
      (new Date() - new Date(user.lastLoginSkipOtp)) < 24 * 60 * 60 * 1000;

    // Bypass OTP for admin, test accounts, or remember me users
    if (user.role === 'ADMIN' || isTestAccount || canSkipOtp) {
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      // Update lastLoginSkipOtp if remember me is checked
      if (rememberMe) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginSkipOtp: new Date() }
        });
      }
      
      return res.json({
        message: `${user.role === 'ADMIN' ? 'Admin' : isTestAccount ? 'Test account' : 'Remember me'} login successful`,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          profilePicture: user.profilePicture
        }
      });
    }

    console.log('Generating OTP...');
    const otp = crypto.randomInt(100000, 999999).toString();
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp
      }
    });

    console.log('Sending email...');
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your UniShareSync Login OTP',
        message: `Your login OTP is ${otp}. It is valid for 10 minutes.`
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({
      message: 'OTP sent to your email',
      userId: user.id
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'ECONNREFUSED' || error.message.includes('connect')) {
      return res.status(503).json({ message: 'Database connection failed. Please ensure PostgreSQL is running.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.verifyOTP = async (req, res) => {
  const { userId, otp, rememberMe } = req.body;

  try {
    const otpRecord = await prisma.oTP.findFirst({
      where: { userId, otp }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update lastLoginSkipOtp if remember me is checked
    if (rememberMe) {
      await prisma.user.update({
        where: { id: userId },
        data: { lastLoginSkipOtp: new Date() }
      });
    }

    await prisma.oTP.delete({ where: { id: otpRecord.id } });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    
    await prisma.oTP.deleteMany({ where: { userId: user.id } });
    
    await prisma.oTP.create({
      data: {
        userId: user.id,
        otp
      }
    });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your UniShareSync Login OTP',
        message: ` Your new login OTP is ${otp}. It is valid for 10 minutes.`
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
    }

    res.json({ message: 'New OTP sent to your email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};