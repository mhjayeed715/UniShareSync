const prisma = require('../config/prisma');

// Get dashboard statistics for students and faculty
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'STUDENT') {
      // Student dashboard stats
      const [
        totalResources,
        myProjects,
        upcomingEvents,
        unreadNotices
      ] = await Promise.all([
        prisma.resource.count({ where: { isApproved: true, isDeleted: false } }),
        prisma.projectMember.count({ where: { userId } }),
        prisma.event.count({ where: { eventDate: { gte: new Date() } } }),
        prisma.notice.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } })
      ]);

      return res.json({
        success: true,
        stats: {
          totalResources: { value: totalResources.toString(), label: 'Total Resources' },
          activeProjects: { value: myProjects.toString(), label: 'Active Projects' },
          upcomingEvents: { value: upcomingEvents.toString(), label: 'Upcoming Events' },
          unreadNotices: { value: unreadNotices.toString(), label: 'Recent Notices' }
        }
      });
    }

    if (userRole === 'FACULTY') {
      // Faculty dashboard stats
      const [
        totalResources,
        myUploads,
        upcomingEvents,
        totalStudents
      ] = await Promise.all([
        prisma.resource.count({ where: { isApproved: true, isDeleted: false } }),
        prisma.resource.count({ where: { uploadedBy: userId } }),
        prisma.event.count({ where: { eventDate: { gte: new Date() } } }),
        prisma.user.count({ where: { role: 'STUDENT' } })
      ]);

      return res.json({
        success: true,
        stats: {
          totalResources: { value: totalResources.toString(), label: 'Total Resources' },
          myUploads: { value: myUploads.toString(), label: 'My Uploads' },
          upcomingEvents: { value: upcomingEvents.toString(), label: 'Upcoming Events' },
          totalStudents: { value: totalStudents.toString(), label: 'Total Students' }
        }
      });
    }

    res.status(403).json({ success: false, message: 'Invalid role' });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const [recentResources, recentProjects, recentEvents] = await Promise.all([
      prisma.resource.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        where: { isApproved: true, isDeleted: false },
        include: { uploader: { select: { name: true } } }
      }),
      prisma.project.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { name: true } } }
      }),
      prisma.event.findMany({
        take: 2,
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { name: true } } }
      })
    ]);

    const activities = [
      ...recentResources.map(resource => ({
        id: resource.id,
        user: resource.uploader?.name || 'User',
        action: 'uploaded a new resource',
        target: resource.title,
        time: getRelativeTime(resource.createdAt),
        createdAt: resource.createdAt,
        type: 'resource'
      })),
      ...recentProjects.map(project => ({
        id: project.id,
        user: project.creator?.name || 'User',
        action: 'created project',
        target: project.title,
        time: getRelativeTime(project.createdAt),
        createdAt: project.createdAt,
        type: 'project'
      })),
      ...recentEvents.map(event => ({
        id: event.id,
        user: event.creator?.name || 'User',
        action: 'created event',
        target: event.title,
        time: getRelativeTime(event.createdAt),
        createdAt: event.createdAt,
        type: 'event'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
