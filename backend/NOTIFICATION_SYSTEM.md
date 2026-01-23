# Role-Based Notification System

## Overview
The UniShareSync platform now supports customized notifications for different user roles (Students, Faculty, and Admins).

## Features
- Send notifications to specific roles
- Bulk notifications to multiple roles
- Admin interface for broadcasting messages
- Notification types: info, success, warning, error
- Optional links for actionable notifications

## Backend Usage

### Import the Helper
```javascript
const { notifyStudents, notifyFaculty, notifyAdmins, notifyAll, NotificationTypes } = require('../utils/notificationHelper');
```

### Send Notifications to Specific Roles

#### Notify Students
```javascript
await notifyStudents(
  'New Resource Available',
  'A new study material has been uploaded for your course',
  NotificationTypes.INFO,
  '/resources'
);
```

#### Notify Faculty
```javascript
await notifyFaculty(
  'Pending Approvals',
  'You have 5 resources waiting for approval',
  NotificationTypes.WARNING,
  '/admin/resources'
);
```

#### Notify Admins
```javascript
await notifyAdmins(
  'System Alert',
  'High server load detected',
  NotificationTypes.ERROR
);
```

#### Notify All Users
```javascript
await notifyAll(
  'System Maintenance',
  'Platform will be under maintenance on Sunday 2 AM - 4 AM',
  NotificationTypes.WARNING
);
```

### Integration Examples

#### In Resource Controller (when resource is approved)
```javascript
const { notifyStudents, NotificationTypes } = require('../utils/notificationHelper');

exports.approveResource = async (req, res) => {
  // ... approval logic
  
  await notifyStudents(
    'New Resource Available',
    `${resource.title} is now available in ${resource.courseName}`,
    NotificationTypes.SUCCESS,
    `/resources/${resource.id}`
  );
};
```

#### In Event Controller (when event is created)
```javascript
const { notifyAll, NotificationTypes } = require('../utils/notificationHelper');

exports.createEvent = async (req, res) => {
  // ... event creation logic
  
  await notifyAll(
    'New Event',
    `${event.title} on ${event.eventDate}. Register now!`,
    NotificationTypes.INFO,
    `/events/${event.id}`
  );
};
```

#### In Notice Controller (when notice is posted)
```javascript
const { notifyAll, NotificationTypes } = require('../utils/notificationHelper');

exports.createNotice = async (req, res) => {
  // ... notice creation logic
  
  const notifType = notice.priority === 'HIGH' ? NotificationTypes.WARNING : NotificationTypes.INFO;
  
  await notifyAll(
    notice.title,
    notice.content.substring(0, 100) + '...',
    notifType,
    `/notices/${notice.id}`
  );
};
```

## Admin API Endpoints

### Send to Single Role
```
POST /api/notifications/send-role
Authorization: Bearer <admin_token>

{
  "role": "STUDENT",
  "title": "Exam Schedule",
  "message": "Final exams will begin from next Monday",
  "type": "warning",
  "link": "/schedule"
}
```

### Send to Multiple Roles
```
POST /api/notifications/send-bulk
Authorization: Bearer <admin_token>

{
  "roles": ["STUDENT", "FACULTY"],
  "title": "Holiday Notice",
  "message": "Campus will be closed on Friday",
  "type": "info"
}
```

## Frontend Usage

### Admin Interface
Admins can access the notification manager from the admin dashboard:
1. Navigate to Admin Dashboard
2. Click "Send Notifications" in the sidebar
3. Select target roles (Students, Faculty, Admins)
4. Choose notification type
5. Enter title and message
6. Optionally add a link
7. Click "Send Notification"

### User Notifications
All users can view their notifications:
- Click the bell icon in the top navigation
- Unread notifications are highlighted
- Click on a notification to mark as read
- Click "Mark all read" to clear all unread notifications

## Notification Types

- **info** (blue): General information
- **success** (green): Positive updates, approvals
- **warning** (yellow): Important notices, deadlines
- **error** (red): Critical alerts, system issues

## Best Practices

1. **Be Specific**: Use clear, concise titles
2. **Add Context**: Include relevant details in the message
3. **Use Links**: Direct users to relevant pages
4. **Choose Appropriate Types**: Match the notification type to the message urgency
5. **Avoid Spam**: Only send notifications for important events
6. **Target Correctly**: Send to the appropriate role(s)

## Examples by Use Case

### Resource Management
- Student uploads resource → Notify Faculty (pending approval)
- Faculty approves resource → Notify Students (new resource available)

### Event Management
- Event created → Notify All (new event announcement)
- Event registration confirmed → Notify individual user
- Event cancelled → Notify registered users

### Project Management
- Project deadline approaching → Notify project members
- Project submitted → Notify Faculty

### Lost & Found
- Item reported → Notify Admins
- Item claimed → Notify item poster

### Feedback
- Feedback submitted → Notify Admins
- Feedback responded → Notify feedback submitter
