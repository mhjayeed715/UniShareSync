const prisma = require('../config/prisma');

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const exists = await prisma.department.findFirst({
      where: {
        OR: [
          { name },
          { code }
        ]
      }
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description
      }
    });

    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully'
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        code,
        description
      }
    });

    res.json({
      success: true,
      data: department,
      message: 'Department updated successfully'
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department has courses
    const coursesCount = await prisma.course.count({
      where: { departmentId: id }
    });

    if (coursesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${coursesCount} associated courses`
      });
    }

    await prisma.department.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
