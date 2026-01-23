const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNotification = async (userId, title, message, type = 'info', link = null) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.notification.create({
      data: { userId, title, message, type, link }
    });
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

exports.notifyRoleUsers = async (role, title, message, type = 'info', link = null) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const users = await prisma.user.findMany({ where: { role, isActive: true } });
    const notifications = users.map(user => ({
      userId: user.id,
      title,
      message,
      type,
      link
    }));
    await prisma.notification.createMany({ data: notifications });
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error notifying role users:', error);
  }
};

exports.sendRoleNotification = async (req, res) => {
  try {
    const { role, title, message, type, link } = req.body;
    
    if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    await exports.notifyRoleUsers(role, title, message, type, link);
    res.json({ success: true, message: `Notification sent to all ${role}s` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendBulkNotification = async (req, res) => {
  try {
    const { roles, title, message, type, link } = req.body;
    
    for (const role of roles) {
      await exports.notifyRoleUsers(role, title, message, type, link);
    }
    
    res.json({ success: true, message: 'Notifications sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
