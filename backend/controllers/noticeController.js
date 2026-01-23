const prisma = require('../config/prisma');
const { notifyAll, NotificationTypes } = require('../utils/notificationHelper');

// Get all public notices (for landing page)
exports.getPublicNotices = async (req, res) => {
  try {
    console.log('Fetching public notices...');
    
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`;
    
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        author: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });
    console.log('Found notices:', notices.length);
    res.json({ notices });
  } catch (error) {
    console.error('Public notices error:', error);
    if (error.code === 'P2021' || error.message.includes('does not exist')) {
      return res.json({ notices: [], message: 'Notice table not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all notices (authenticated)
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    res.json({ notices });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create notice (admin only)
exports.createNotice = async (req, res) => {
  const { title, content, priority } = req.body;

  try {
    console.log('Create notice request:', { title, content, priority, hasFile: !!req.file, userId: req.user?.id });
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can create notices' });
    }

    const imageUrl = req.file ? `/uploads/notices/${req.file.filename}` : null;

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || 'NORMAL',
        imageUrl,
        createdBy: req.user.id
      },
      include: {
        author: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    // Auto-notify all users
    const notifType = priority === 'HIGH' ? NotificationTypes.WARNING : NotificationTypes.INFO;
    await notifyAll(
      title,
      content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      notifType
    );

    res.status(201).json({ message: 'Notice created successfully', notice });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notice (admin only)
exports.updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, content, priority } = req.body;

  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update notices' });
    }

    const updateData = { title, content, priority };
    if (req.file) {
      updateData.imageUrl = `/uploads/notices/${req.file.filename}`;
    }

    const notice = await prisma.notice.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            name: true,
            role: true
          }
        }
      }
    });

    res.json({ message: 'Notice updated successfully', notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notice (admin only)
exports.deleteNotice = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete notices' });
    }

    await prisma.notice.delete({ where: { id } });

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
