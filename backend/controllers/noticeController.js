const prisma = require('../config/prisma');
const { notifyAll, NotificationTypes } = require('../utils/notificationHelper');

// Helper: strip base64 imageUrl from notice, add hasImage/isPdf flags
const stripImageData = (notice) => {
  const { imageUrl, ...rest } = notice;
  return {
    ...rest,
    hasImage: !!imageUrl,
    isPdf: imageUrl
      ? (imageUrl.startsWith('data:application/pdf') || imageUrl.endsWith('.pdf'))
      : false
  };
};

// Serve notice image as binary (public, no auth)
exports.getNoticeImage = async (req, res) => {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: req.params.id },
      select: { imageUrl: true }
    });

    if (!notice || !notice.imageUrl) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Base64 data URL -> serve as binary
    if (notice.imageUrl.startsWith('data:')) {
      const match = notice.imageUrl.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], 'base64');
        res.set('Content-Type', mimeType);
        res.set('Content-Length', buffer.length);
        res.set('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }
    }

    // Legacy file path — redirect
    if (notice.imageUrl.startsWith('/uploads/')) {
      return res.redirect(notice.imageUrl);
    }

    return res.status(404).json({ message: 'Image format not recognized' });
  } catch (error) {
    console.error('Get notice image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all public notices (for landing page)
exports.getPublicNotices = async (req, res) => {
  try {
    console.log('Fetching public notices...');
    
    await prisma.$queryRaw`SELECT 1`;
    
    const rawNotices = await prisma.notice.findMany({
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

    const notices = rawNotices.map(stripImageData);
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
    const rawNotices = await prisma.notice.findMany({
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

    const notices = rawNotices.map(stripImageData);
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

    // Convert uploaded file to base64 data URL
    let imageUrl = null;
    if (req.file) {
      const base64 = req.file.buffer
        ? req.file.buffer.toString('base64')
        : require('fs').readFileSync(req.file.path, { encoding: 'base64' });
      const mimeType = req.file.mimetype || 'application/octet-stream';
      imageUrl = `data:${mimeType};base64,${base64}`;
    }

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

    res.status(201).json({ message: 'Notice created successfully', notice: stripImageData(notice) });
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
      const base64 = req.file.buffer
        ? req.file.buffer.toString('base64')
        : require('fs').readFileSync(req.file.path, { encoding: 'base64' });
      const mimeType = req.file.mimetype || 'application/octet-stream';
      updateData.imageUrl = `data:${mimeType};base64,${base64}`;
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

    res.json({ message: 'Notice updated successfully', notice: stripImageData(notice) });
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
