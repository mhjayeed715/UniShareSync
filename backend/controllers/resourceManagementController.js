const prisma = require('../config/prisma');

// Get all resources (admin)
exports.getAllResources = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { isDeleted: false };
    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: { select: { id: true, name: true, email: true, role: true } },
          course: { select: { id: true, courseCode: true, courseName: true } }
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
    console.error('Get resources error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve resource
exports.approveResource = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.update({
      where: { id },
      data: { isApproved: true },
      include: { uploader: { select: { name: true } } }
    });

    res.json({ success: true, data: resource, message: 'Resource approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk approve/delete resources
exports.bulkAction = async (req, res) => {
  try {
    const { resourceIds, action } = req.body;

    if (!resourceIds || !Array.isArray(resourceIds)) {
      return res.status(400).json({ success: false, message: 'Invalid resource IDs' });
    }

    let result;
    if (action === 'approve') {
      result = await prisma.resource.updateMany({
        where: { id: { in: resourceIds } },
        data: { isApproved: true }
      });
    } else if (action === 'delete') {
      result = await prisma.resource.updateMany({
        where: { id: { in: resourceIds } },
        data: { isDeleted: true }
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    res.json({ 
      success: true, 
      message: `${result.count} resources ${action}d successfully`,
      count: result.count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update resource (admin)
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, courseName, type } = req.body;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title,
        description,
        courseName,
        resourceType: type
      },
      include: {
        uploader: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: resource
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

// Delete resource permanently
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.resource.update({
      where: { id },
      data: { isDeleted: true }
    });
    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
