const { notifyRoleUsers, createNotification } = require('../controllers/notificationController');

const NotificationTypes = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

const notifyStudents = (title, message, type = NotificationTypes.INFO, link = null) => {
  return notifyRoleUsers('STUDENT', title, message, type, link);
};

const notifyFaculty = (title, message, type = NotificationTypes.INFO, link = null) => {
  return notifyRoleUsers('FACULTY', title, message, type, link);
};

const notifyAdmins = (title, message, type = NotificationTypes.INFO, link = null) => {
  return notifyRoleUsers('ADMIN', title, message, type, link);
};

const notifyAll = async (title, message, type = NotificationTypes.INFO, link = null) => {
  await notifyStudents(title, message, type, link);
  await notifyFaculty(title, message, type, link);
  await notifyAdmins(title, message, type, link);
};

module.exports = {
  NotificationTypes,
  notifyStudents,
  notifyFaculty,
  notifyAdmins,
  notifyAll,
  createNotification
};
