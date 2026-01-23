const prisma = require('../config/prisma');
const path = require('path');
const fs = require('fs');
const { getCoursesBySemester, matchCourseCode, getSemesterFromCourse } = require('../utils/routineParser');

// Upload a new resource
exports.uploadResource = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { title, description, courseName, type, semester } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Create file URL
    const fileUrl = `/uploads/resources/${req.file.filename}`;
    
    console.log('Creating resource with:', {
      title,
      courseName,
      semester: parseInt(semester) || 8,
      filePath: fileUrl,
      fileName: req.file.originalname,
      resourceType: type || 'notes',
      uploadedBy: userId
    });

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        courseName: courseName || '',
        semester: parseInt(semester) || 8,
        filePath: fileUrl,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
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

    res.status(201).json({
      success: true,
      message: req.user.role === 'STUDENT' 
        ? 'Resource uploaded successfully and pending approval'
        : 'Resource uploaded and approved successfully',
      data: resource
    });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/resources', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
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

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', resource.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
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

// Download resource
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

    const filePath = path.join(__dirname, '..', resource.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found on server' 
      });
    }

    // Increment download count
    await prisma.resource.update({
      where: { id },
      data: { downloads: { increment: 1 } }
    });

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
