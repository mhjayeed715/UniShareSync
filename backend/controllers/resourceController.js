const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs');
const { getCoursesBySemester, matchCourseCode, getSemesterFromCourse } = require('../utils/routineParser');
const { createNotification } = require('./notificationController');
const { notifyStudents, notifyAdmins, NotificationTypes } = require('../utils/notificationHelper');

// Upload a new resource (link-based — user provides Google Drive/OneDrive link)
exports.uploadResource = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Body:', req.body);
    
    const { title, description, courseName, type, semester, fileUrl, fileName } = req.body;
    const userId = req.user.id;

    if (!fileUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a file link (Google Drive, OneDrive, etc.)' 
      });
    }

    // Validate URL
    try {
      new URL(fileUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid URL'
      });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        courseName: courseName || '',
        semester: parseInt(semester) || 8,
        filePath: fileUrl,
        fileName: fileName || title,
        fileSize: null,
        fileType: 'link',
        resourceType: type || 'notes',
        uploadedBy: userId,
        isApproved: req.user.role === 'ADMIN' || req.user.role === 'FACULTY'
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        }
      }
    });

    console.log('Resource created successfully:', resource.id);

    // Send notifications
    if (req.user.role === 'STUDENT') {
      await notifyAdmins(
        'New Resource Pending Approval',
        `${req.user.name} uploaded "${title}" for ${courseName}`,
        NotificationTypes.INFO
      );
    } else {
      await notifyStudents(
        'New Resource Available',
        `New ${type || 'resource'} "${title}" added for ${courseName}`,
        NotificationTypes.SUCCESS
      );
    }

    res.status(201).json({
      success: true,
      message: req.user.role === 'STUDENT' 
        ? 'Resource uploaded successfully and pending approval'
        : 'Resource uploaded and approved successfully',
      data: resource
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload resource',
      error: error.message 
    });
  }
};

// Get all approved resources with search and filter
exports.getAllResources = async (req, res) => {
  try {
    const { search, semester, type, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = { 
      isApproved: true,
      isDeleted: false
    };
    
    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { courseName: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add semester filter
    if (semester && semester !== 'all') {
      where.semester = parseInt(semester);
    }
    
    // Add type filter
    if (type && type !== 'all') {
      where.resourceType = type;
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true
            }
          }
        }
      }),
      prisma.resource.count({ where })
    ]);

    // Group by semester for easy navigation
    const resourcesBySemester = {};
    for (let i = 1; i <= 10; i++) {
      resourcesBySemester[i] = [];
    }
    
    resources.forEach(resource => {
      const sem = resource.semester || 8;
      if (resourcesBySemester[sem]) {
        resourcesBySemester[sem].push(resource);
      }
    });

    res.json({
      success: true,
      resources: resources,
      resourcesBySemester,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch resources',
      error: error.message 
    });
  }
};

// Get user's uploaded resources
exports.getMyResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { uploaderId: userId };
    if (status) {
      where.status = status;
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      }),
      prisma.resource.count({ where })
    ]);

    res.json({
      success: true,
      data: resources,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my resources error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch your resources',
      error: error.message 
    });
  }
};

// Get single resource
exports.getResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            department: true
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch resource',
      error: error.message 
    });
  }
};

// Update resource
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type } = req.body;
    const userId = req.user.id;

    const resource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    // Only owner can update
    if (resource.uploaderId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this resource' 
      });
    }

    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        title,
        description,
        type
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update resource',
      error: error.message 
    });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const resource = await prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    // Only owner or admin can delete
    if (resource.uploaderId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this resource' 
      });
    }

    // Delete file from filesystem (only for legacy local files)
    if (resource.filePath && !resource.filePath.startsWith('http')) {
      const filePath = path.join(__dirname, '..', resource.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.resource.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete resource',
      error: error.message 
    });
  }
};

// Download resource (redirect to external link)
exports.downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await prisma.resource.findUnique({
      where: { id, isApproved: true, isDeleted: false }
    });

    if (!resource) {
      return res.status(404).json({ 
        success: false, 
        message: 'Resource not found' 
      });
    }

    // Increment download count
    await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    });

    // If filePath is an external URL, redirect to it
    if (resource.filePath.startsWith('http')) {
      return res.json({ 
        success: true, 
        redirectUrl: resource.filePath,
        fileName: resource.fileName 
      });
    }

    // Legacy: local file download
    const filePath = path.join(__dirname, '..', resource.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found on server' 
      });
    }

    res.download(filePath, resource.fileName);
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download resource',
      error: error.message 
    });
  }
};
