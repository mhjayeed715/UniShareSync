const prisma = require('../config/prisma');

// Get all projects (browse)
exports.getAllProjects = async (req, res) => {
  try {
    const { semester, search } = req.query;
    
    let whereClause = {};
    if (semester) {
      whereClause.projectType = semester; // Store semester in projectType field
    }
    
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match frontend expectations
    let transformedProjects = projects.map(project => {
      const descParts = project.description.split('|maxMembers:');
      const actualDescription = descParts[0];
      const maxMembers = descParts[1] ? parseInt(descParts[1]) : 10;
      
      return {
        id: project.id,
        title: project.title,
        description: actualDescription,
        members: project.members.map(member => member.user.name),
        maxMembers: maxMembers,
        deadline: project.submissionDeadline || project.endDate,
        createdBy: project.creator.name,
        createdById: project.creator.id,
        status: project.status.toUpperCase(),
        semester: project.projectType || 'Current',
        pendingRequests: []
      };
    });

    // Apply search filter if provided
    if (search) {
      transformedProjects = transformedProjects.filter(project => 
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(transformedProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's projects
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get projects where user is creator or member
    const createdProjects = await prisma.project.findMany({
      where: { createdBy: userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    const memberProjects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Combine and deduplicate
    const allProjects = [...createdProjects, ...memberProjects];
    const uniqueProjects = allProjects.filter((project, index, self) => 
      index === self.findIndex(p => p.id === project.id)
    );

    // Transform data
    const transformedProjects = uniqueProjects.map(project => {
      const descParts = project.description.split('|maxMembers:');
      const actualDescription = descParts[0];
      const maxMembers = descParts[1] ? parseInt(descParts[1]) : 10;
      
      return {
        id: project.id,
        title: project.title,
        description: actualDescription,
        members: project.members.map(member => member.user.name),
        maxMembers: maxMembers,
        deadline: project.submissionDeadline || project.endDate,
        createdBy: project.creator.name,
        createdById: project.creator.id,
        status: project.status.toUpperCase(),
        skills: [],
        progress: Math.floor(Math.random() * 100), // Mock progress
        semester: project.projectType || 'Current'
      };
    });

    res.json(transformedProjects);
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Transform data
    const descParts = project.description.split('|maxMembers:');
    const actualDescription = descParts[0];
    const maxMembers = descParts[1] ? parseInt(descParts[1]) : 10;
    
    const transformedProject = {
      id: project.id,
      title: project.title,
      description: actualDescription,
      members: project.members.map(member => member.user.name),
      maxMembers: maxMembers,
      deadline: project.submissionDeadline || project.endDate,
      createdBy: project.creator.name,
      createdById: project.creator.id,
      status: project.status.toUpperCase(),
      skills: [],
      progress: Math.floor(Math.random() * 100),
      semester: project.projectType || 'Current',
      pendingRequests: []
    };

    res.json(transformedProject);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { title, description, maxMembers, deadline, semester } = req.body;
    const userId = req.user.id;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        createdBy: userId,
        submissionDeadline: deadline ? new Date(deadline) : null,
        status: 'active',
        projectType: semester, // Store semester in projectType field
        description: `${description}|maxMembers:${maxMembers}` // Store maxMembers in description
      }
    });

    // Auto-add creator as member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: userId,
        role: 'creator'
      }
    });

    // Fetch project with members
    const projectWithMembers = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Transform data
    const descParts = projectWithMembers.description.split('|maxMembers:');
    const actualDescription = descParts[0];
    const projectMaxMembers = descParts[1] ? parseInt(descParts[1]) : 10;
    
    const transformedProject = {
      id: projectWithMembers.id,
      title: projectWithMembers.title,
      description: actualDescription,
      members: projectWithMembers.members.map(member => member.user.name),
      maxMembers: projectMaxMembers,
      deadline: projectWithMembers.submissionDeadline,
      createdBy: projectWithMembers.creator.name,
      createdById: projectWithMembers.creator.id,
      status: 'RECRUITING',
      semester: semester || 'Current',
      pendingRequests: []
    };

    res.status(201).json({ 
      message: 'Project created successfully', 
      project: transformedProject 
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const userId = req.user.id;

    // Check if user is the creator
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy !== userId) {
      return res.status(403).json({ message: 'Only project creator can update the project' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        status: status?.toLowerCase()
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({ 
      message: 'Project updated successfully', 
      project: updatedProject 
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project status
exports.updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Check if user is the creator
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy !== userId) {
      return res.status(403).json({ message: 'Only project creator can update status' });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: status.toLowerCase()
      }
    });

    res.json({ 
      message: 'Project status updated successfully', 
      status: status.toUpperCase()
    });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user is the creator or admin
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only project creator or admin can delete the project' });
    }

    // Delete project members first
    await prisma.projectMember.deleteMany({
      where: { projectId: id }
    });

    // Delete project
    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join project (send request)
exports.joinProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    // Add user as member directly (simplified - no approval process)
    await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: userId,
        role: 'member'
      }
    });

    res.json({ message: 'Successfully joined the project' });
  } catch (error) {
    console.error('Join project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept join request (placeholder)
exports.acceptJoinRequest = async (req, res) => {
  try {
    res.json({ message: 'Join request accepted' });
  } catch (error) {
    console.error('Accept join request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Decline join request (placeholder)
exports.declineJoinRequest = async (req, res) => {
  try {
    res.json({ message: 'Join request declined' });
  } catch (error) {
    console.error('Decline join request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};