const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/feedback');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Get all feedback (community view)
exports.getAllFeedback = async (req, res) => {
  try {
    // For admin users, show all feedback. For regular users, show only public feedback
    const whereClause = req.user.role === 'ADMIN' ? {} : { isPublic: true };
    
    const feedback = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match frontend expectations
    const transformedFeedback = feedback.map(item => {
      // Map database status to frontend status based on admin response
      let frontendStatus = 'PENDING';
      
      if (item.adminResponse && item.adminResponse.trim() !== '') {
        // Has admin response
        if (item.status === 'resolved') {
          frontendStatus = 'RESOLVED';
        } else {
          frontendStatus = 'RESPONDED';
        }
      } else {
        // No admin response yet
        if (item.status === 'archived') {
          frontendStatus = 'ARCHIVED';
        } else {
          frontendStatus = 'PENDING';
        }
      }
      
      return {
        id: item.id,
        title: item.title,
        content: item.message,
        category: item.category || 'General',
        priority: 'MEDIUM',
        status: frontendStatus,
        isAnonymous: item.isAnonymous,
        submittedBy: item.isAnonymous ? 'Anonymous' : (item.submitter?.name || 'Anonymous'),
        submittedAt: item.createdAt,
        rating: 5,
        response: item.adminResponse,
        imageUrl: null
      };
    });

    res.json(transformedFeedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's feedback
exports.getMyFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    const feedback = await prisma.feedback.findMany({
      where: { 
        submittedBy: userId,
        status: { not: 'archived' } // Exclude archived feedback from user view
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data
    const transformedFeedback = feedback.map(item => {
      // Map database status to frontend status
      let frontendStatus = 'PENDING';
      if (item.status === 'submitted' || !item.status) {
        frontendStatus = 'PENDING';
      } else if (item.status === 'responded') {
        frontendStatus = 'RESPONDED';
      } else if (item.status === 'resolved') {
        frontendStatus = 'RESOLVED';
      } else if (item.status === 'archived') {
        frontendStatus = 'ARCHIVED';
      } else {
        frontendStatus = 'PENDING'; // Default to PENDING for any unmapped status
      }
      
      return {
        id: item.id,
        title: item.title,
        content: item.message,
        category: item.category || 'General',
        priority: 'MEDIUM',
        status: frontendStatus,
        isAnonymous: item.isAnonymous,
        submittedBy: item.isAnonymous ? 'Anonymous' : (item.submitter?.name || 'Anonymous'),
        submittedAt: item.createdAt,
        rating: 5,
        response: item.adminResponse,
        imageUrl: null
      };
    });

    res.json(transformedFeedback);
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Transform data
    const transformedFeedback = {
      id: feedback.id,
      title: feedback.title,
      content: feedback.message,
      category: feedback.category || 'General',
      priority: 'MEDIUM',
      status: feedback.status?.toUpperCase() || 'PENDING',
      isAnonymous: feedback.isAnonymous,
      submittedBy: feedback.isAnonymous ? 'Anonymous' : (feedback.submitter?.name || 'Anonymous'),
      submittedAt: feedback.createdAt,
      rating: 5,
      response: feedback.adminResponse,
      imageUrl: null
    };

    res.json(transformedFeedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const { title, content, category, priority, isAnonymous, rating } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/feedback/${req.file.filename}` : null;

    const feedback = await prisma.feedback.create({
      data: {
        title,
        message: content,
        category: category || 'General',
        submittedBy: isAnonymous === 'true' ? null : userId,
        isAnonymous: isAnonymous === 'true',
        status: 'submitted',
        isPublic: true // Make feedback public by default
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Transform data
    const transformedFeedback = {
      id: feedback.id,
      title: feedback.title,
      content: feedback.message,
      category: feedback.category || 'General',
      priority: priority || 'MEDIUM',
      status: 'PENDING',
      isAnonymous: feedback.isAnonymous,
      submittedBy: feedback.isAnonymous ? 'Anonymous' : (feedback.submitter?.name || 'Anonymous'),
      submittedAt: feedback.createdAt,
      rating: parseInt(rating) || 5,
      response: null,
      imageUrl: imageUrl
    };

    res.status(201).json({ 
      message: 'Feedback submitted successfully', 
      feedback: transformedFeedback 
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const userId = req.user.id;

    // Check if user owns the feedback
    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.submittedBy !== userId) {
      return res.status(403).json({ message: 'You can only update your own feedback' });
    }

    const imageUrl = req.file ? `/uploads/feedback/${req.file.filename}` : null;

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        title,
        message: content,
        category
      },
      include: {
        submitter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ 
      message: 'Feedback updated successfully', 
      feedback: updatedFeedback 
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Respond to feedback (admin only)
exports.respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can respond to feedback' });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        adminResponse: response,
        respondedBy: req.user.id,
        responseDate: new Date(),
        status: 'responded'
      }
    });

    res.json({ 
      message: 'Response sent successfully', 
      feedback: updatedFeedback 
    });
  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update feedback status (admin only)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update feedback status' });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        status: status.toLowerCase()
      }
    });

    res.json({ 
      message: 'Feedback status updated successfully', 
      feedback: updatedFeedback 
    });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Archive feedback (user only)
exports.archiveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user owns the feedback
    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.submittedBy !== userId) {
      return res.status(403).json({ message: 'You can only archive your own feedback' });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        status: 'archived'
      }
    });

    res.json({ 
      message: 'Feedback archived successfully', 
      feedback: updatedFeedback 
    });
  } catch (error) {
    console.error('Archive feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resolve feedback (user only)
exports.resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user owns the feedback
    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.submittedBy !== userId) {
      return res.status(403).json({ message: 'You can only resolve your own feedback' });
    }

    // Only allow resolving if admin has responded
    if (feedback.status !== 'responded') {
      return res.status(400).json({ message: 'Feedback can only be resolved after admin response' });
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedDate: new Date()
      }
    });

    res.json({ 
      message: 'Feedback marked as resolved', 
      feedback: updatedFeedback 
    });
  } catch (error) {
    console.error('Resolve feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user owns the feedback or is admin
    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (feedback.submittedBy !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only delete your own feedback' });
    }

    await prisma.feedback.delete({
      where: { id }
    });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};