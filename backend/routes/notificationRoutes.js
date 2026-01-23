const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, sendRoleNotification, sendBulkNotification } = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);
router.post('/send-role', protect, adminOnly, sendRoleNotification);
router.post('/send-bulk', protect, adminOnly, sendBulkNotification);

module.exports = router;
