require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const prisma = require('./config/prisma');

// Import routes
const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminManagementRoutes = require('./routes/adminManagementRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clubEventRoutes = require('./routes/clubEventRoutes');
const profileRoutes = require('./routes/profileRoutes');
const projectRoutes = require('./routes/projectRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const publicRoutes = require('./routes/publicRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Configure CORS for both development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL // Add your Vercel frontend URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Test route to verify no global auth
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

// Direct public route BEFORE any other middleware or routes
app.post('/api/public-report', async (req, res) => {
  try {
    const { title, description, type, category, location, contactInfo } = req.body;
    const prisma = require('./config/prisma');
    
    const item = await prisma.lostFoundItem.create({
      data: {
        title,
        description,
        category: category || 'Other',
        itemType: type?.toLowerCase() || 'found',
        lastSeenLocation: location,
        lastSeenDate: new Date(),
        status: 'active',
        itemStatus: 'open',
        postedBy: null,
        contactName: 'Anonymous Reporter',
        contactEmail: contactInfo,
        isAnonymous: true,
        resolved: false
      }
    });
    
    res.status(201).json({ 
      message: 'Item reported successfully', 
      item 
    });
  } catch (error) {
    console.error('Public report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Serve static files from uploads directory with error handling
const uploadsPath = process.env.VERCEL === '1' 
  ? '/tmp/uploads' 
  : path.join(__dirname, 'uploads');
app.use('/uploads', (req, res, next) => {
  express.static(uploadsPath)(req, res, (err) => {
    if (err) {
      console.error('Static file error:', err);
      return res.status(404).json({ message: 'File not found' });
    }
    next();
  });
}); 

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/manage', adminManagementRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/clubs', clubEventRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', chatRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('UniShareSync Backend is running!');
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Add error handling for server
  server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy. Run 'npm run kill-port' first or use 'npm start' which handles this automatically.`);
      process.exit(1);
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down gracefully...');
    await prisma.$disconnect();
    server.close(() => {
      process.exit(0);
    });
  });
}

app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Export app for Vercel serverless
module.exports = app;