const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      if (!req.user) {
        console.log('User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('Authenticated user:', req.user.name, req.user.role);
      next();
    } catch (error) {
      console.log('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No authorization header found');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

exports.adminOrFaculty = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'FACULTY')) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin or Faculty only.' });
  }
};
