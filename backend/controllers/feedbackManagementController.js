const prisma = require('../config/prisma');

// Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status === 'pending') {
      where.isResolved = false;
    } else if (status === 'resolved') {
      where.isResolved = true;
    }
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        }
      }),
      prisma.feedback.count({ where })
    ]);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single feedback
exports.getFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, department: true } }
      }
    });

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Respond to feedback
exports.respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ success: false, message: 'Response is required' });
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        response,
        isResolved: true,
        resolvedAt: new Date()
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    res.json({ success: true, data: feedback, message: 'Response sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark feedback as resolved
exports.markAsResolved = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });

    res.json({ success: true, data: feedback, message: 'Feedback marked as resolved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.feedback.delete({ where: { id } });
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk mark as resolved
exports.bulkResolve = async (req, res) => {
  try {
    const { feedbackIds } = req.body;

    if (!feedbackIds || !Array.isArray(feedbackIds)) {
      return res.status(400).json({ success: false, message: 'Invalid feedback IDs' });
    }

    const result = await prisma.feedback.updateMany({
      where: { id: { in: feedbackIds } },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });

    res.json({ 
      success: true, 
      message: `${result.count} feedbacks marked as resolved`,
      count: result.count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
