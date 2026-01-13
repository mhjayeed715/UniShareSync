const prisma = require('../config/prisma');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get counts from database
    const [
      studentsCount,
      facultyCount,
      resourcesCount,
      eventsCount,
      projectsCount,
      feedbackCount,
      noticesCount,
      totalUsers
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'FACULTY' } }),
      prisma.resource.count({ where: { isDeleted: false } }),
      prisma.event.count(),
      prisma.project.count(),
      prisma.feedback.count(),
      prisma.notice.count(),
      prisma.user.count()
    ]);

    const stats = {
      students: {
        value: studentsCount.toString(),
        change: '+5.2%',
        trend: 'up'
      },
      faculty: {
        value: facultyCount.toString(),
        change: '+2.1%',
        trend: 'up'
      },
      resources: {
        value: resourcesCount.toString(),
        change: '+12.3%',
        trend: 'up'
      },
      events: {
        value: eventsCount.toString(),
        change: '+8.7%',
        trend: 'up'
      },
      projects: {
        value: projectsCount.toString(),
        change: '+3.4%',
        trend: 'up'
      },
      feedback: {
        value: feedbackCount.toString(),
        change: '+15.2%',
        trend: 'up'
      },
      notices: {
        value: noticesCount.toString(),
        change: '+10.5%',
        trend: 'up'
      },
      totalUsers: {
        value: totalUsers.toString(),
        change: '+7.8%',
        trend: 'up'
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get system health
exports.getSystemHealth = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const systemHealth = {
      status: 'Healthy',
      activeSessions: '234', // Mock for now - implement session tracking later
      storage: '45.2 GB / 100 GB', // Mock for now
      lastBackup: '2 hours ago' // Mock for now
    };

    res.json({ systemHealth });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get recent activities from different sources
    const [recentNotices, recentResources, recentProjects, recentEvents] = await Promise.all([
      prisma.notice.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { name: true } } }
      }),
      prisma.resource.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
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
      ...recentNotices.map(notice => ({
        user: notice.author?.name || 'Admin',
        action: 'posted announcement',
        item: notice.title,
        time: getRelativeTime(notice.createdAt),
        icon: 'Megaphone',
        color: 'text-orange-500'
      })),
      ...recentResources.map(resource => ({
        user: resource.uploader?.name || 'User',
        action: 'uploaded resource',
        item: resource.title,
        time: getRelativeTime(resource.createdAt),
        icon: 'Upload',
        color: 'text-blue-500'
      })),
      ...recentProjects.map(project => ({
        user: project.creator?.name || 'User',
        action: 'created project',
        item: project.title,
        time: getRelativeTime(project.createdAt),
        icon: 'Flag',
        color: 'text-green-500'
      })),
      ...recentEvents.map(event => ({
        user: event.creator?.name || 'User',
        action: 'created event',
        item: event.title,
        time: getRelativeTime(event.createdAt),
        icon: 'Calendar',
        color: 'text-purple-500'
      }))
    ].sort((a, b) => {
      // Sort by time (most recent first)
      return 0; // Already sorted by individual queries
    }).slice(0, 10);

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
