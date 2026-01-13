const prisma = require('../config/prisma');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true } }
        }
      }),
      prisma.project.count({ where })
    ]);

    const projectsWithCount = projects.map(project => ({
      ...project,
      memberCount: project._count.members
    }));

    res.json({
      success: true,
      data: projectsWithCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update project status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'COMPLETED', 'ON_HOLD'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const project = await prisma.project.update({
      where: { id },
      data: { status },
      include: {
        creator: { select: { name: true } }
      }
    });

    res.json({ success: true, data: project, message: 'Project status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete members first
    await prisma.projectMember.deleteMany({ where: { projectId: id } });
    
    // Delete project
    await prisma.project.delete({ where: { id } });

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get project members
exports.getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, department: true } }
      },
      orderBy: { joinedAt: 'asc' }
    });

    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove project member
exports.removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    
    await prisma.projectMember.deleteMany({
      where: {
        projectId: id,
        userId: memberId
      }
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
