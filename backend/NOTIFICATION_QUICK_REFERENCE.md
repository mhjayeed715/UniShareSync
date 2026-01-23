# Notification System - Quick Reference

## Import Statement
```javascript
const { notifyStudents, notifyFaculty, notifyAdmins, notifyAll, NotificationTypes } = require('../utils/notificationHelper');
```

## Function Signatures

### notifyStudents(title, message, type, link)
Send notification to all students
```javascript
await notifyStudents(
  'Title',
  'Message content',
  NotificationTypes.INFO,  // optional, defaults to INFO
  '/link'                   // optional
);
```

### notifyFaculty(title, message, type, link)
Send notification to all faculty members
```javascript
await notifyFaculty(
  'Title',
  'Message content',
  NotificationTypes.WARNING,
  '/link'
);
```

### notifyAdmins(title, message, type, link)
Send notification to all admins
```javascript
await notifyAdmins(
  'Title',
  'Message content',
  NotificationTypes.ERROR
);
```

### notifyAll(title, message, type, link)
Send notification to all users (students, faculty, and admins)
```javascript
await notifyAll(
  'Title',
  'Message content',
  NotificationTypes.SUCCESS,
  '/link'
);
```

## Notification Types

```javascript
NotificationTypes.INFO     // Blue - General information
NotificationTypes.SUCCESS  // Green - Positive updates
NotificationTypes.WARNING  // Yellow - Important notices
NotificationTypes.ERROR    // Red - Critical alerts
```

## Common Use Cases

### Resource Approved
```javascript
await notifyStudents(
  'New Resource Available',
  `${resource.title} is now available`,
  NotificationTypes.INFO,
  `/resources/${resource.id}`
);
```

### Event Created
```javascript
await notifyAll(
  'New Event',
  `${event.title} on ${eventDate}`,
  NotificationTypes.INFO,
  `/events/${event.id}`
);
```

### System Maintenance
```javascript
await notifyAll(
  'System Maintenance',
  'Platform will be down from 2 AM - 4 AM',
  NotificationTypes.WARNING
);
```

### Deadline Reminder
```javascript
await notifyStudents(
  'Assignment Due Soon',
  'Submit your project by tomorrow',
  NotificationTypes.WARNING,
  '/projects'
);
```

### Approval Required
```javascript
await notifyFaculty(
  'Pending Approvals',
  'You have 5 resources waiting for approval',
  NotificationTypes.INFO,
  '/admin/resources'
);
```

### Critical Alert
```javascript
await notifyAdmins(
  'System Error',
  'Database connection failed',
  NotificationTypes.ERROR
);
```

## Best Practices

✅ **DO:**
- Use clear, concise titles
- Include relevant details in messages
- Add links for actionable notifications
- Choose appropriate notification types
- Target the correct role(s)

❌ **DON'T:**
- Send too many notifications (avoid spam)
- Use ERROR type for non-critical issues
- Include sensitive information in messages
- Forget to handle async/await properly
- Send notifications without context

## Error Handling

```javascript
try {
  await notifyStudents('Title', 'Message');
} catch (error) {
  console.error('Notification failed:', error);
  // Continue with your logic - notifications are non-blocking
}
```

## Testing

```javascript
// Test in development
if (process.env.NODE_ENV === 'development') {
  await notifyAdmins(
    'Test Notification',
    'This is a test message',
    NotificationTypes.INFO
  );
}
```

## Admin API (for frontend)

### Send to Single Role
```javascript
await api.post('/api/notifications/send-role', {
  role: 'STUDENT',
  title: 'Title',
  message: 'Message',
  type: 'info',
  link: '/link'
});
```

### Send to Multiple Roles
```javascript
await api.post('/api/notifications/send-bulk', {
  roles: ['STUDENT', 'FACULTY'],
  title: 'Title',
  message: 'Message',
  type: 'warning'
});
```

## Integration Checklist

- [ ] Import notification helper
- [ ] Choose appropriate function (notifyStudents/Faculty/Admins/All)
- [ ] Set clear title
- [ ] Write descriptive message
- [ ] Select correct notification type
- [ ] Add link if applicable
- [ ] Handle errors gracefully
- [ ] Test with different roles
