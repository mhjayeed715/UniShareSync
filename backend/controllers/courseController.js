const prisma = require('../config/prisma');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { departmentId, search } = req.query;

    const where = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            resources: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch courses',
      error: error.message 
    });
  }
};

// Get single course
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            resources: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch course',
      error: error.message 
    });
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { name, code, credits, departmentId, description } = req.body;

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });

    if (existingCourse) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course code already exists' 
      });
    }

    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits: parseInt(credits),
        departmentId,
        description: description || ''
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create course',
      error: error.message 
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, credits, departmentId, description } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    // Check if new code conflicts with another course
    if (code !== existingCourse.code) {
      const codeExists = await prisma.course.findUnique({
        where: { code }
      });

      if (codeExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Course code already exists' 
        });
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        name,
        code,
        credits: parseInt(credits),
        departmentId,
        description
      },
      include: {
        department: {
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
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update course',
      error: error.message 
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course has resources
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            resources: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    if (course._count.resources > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete course with ${course._count.resources} resources. Please delete resources first.` 
      });
    }

    await prisma.course.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete course',
      error: error.message 
    });
  }
};
