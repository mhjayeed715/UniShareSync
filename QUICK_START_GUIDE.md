# Quick Start Guide - Clubs & Events Hub

## 🚀 Getting Started

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | mehrabjayeed715@gmail.com | adminmejayeed |
| Faculty | faculty@test.com | faculty123 |
| Student | student@test.com | student123 |

## 📋 Testing Checklist

### As Student (student@test.com)
- [ ] Login and navigate to "Clubs & Events Hub"
- [ ] View all available clubs
- [ ] Click "Join Club" on any club
- [ ] Switch to "Upcoming Events" tab
- [ ] View all events
- [ ] Click "Register" on any event
- [ ] Verify you cannot see "Create" buttons

### As Faculty (faculty@test.com)
- [ ] Login and navigate to "Clubs & Events Hub"
- [ ] Click "Create Club" button
- [ ] Fill in club details and create
- [ ] Click "Create Event" button
- [ ] Fill in event details and create
- [ ] Click "Manage" on any club
- [ ] View pending join requests
- [ ] Approve/Reject requests

### As Admin (mehrabjayeed715@gmail.com)
- [ ] Login to Admin Dashboard
- [ ] Click "Event Management" in sidebar
- [ ] View all clubs and events
- [ ] Create a new club
- [ ] Create a new event
- [ ] Edit existing club/event
- [ ] View pending join requests
- [ ] Approve/Reject requests
- [ ] Delete a club/event

## 🎯 Key Features to Test

### Student Features:
1. **View Clubs**: See all active clubs with member counts
2. **Join Clubs**: Submit join requests (status: pending)
3. **View Events**: See upcoming events with details
4. **Register for Events**: Register for events (capacity check)

### Faculty/Admin Features:
1. **Create Clubs**: Add new clubs with name and description
2. **Create Events**: Add events with date, time, location, capacity
3. **Manage Requests**: Approve or reject club join requests
4. **Edit/Delete**: Modify or remove clubs and events
5. **View Registrations**: See who registered for events

## 🔍 What to Look For

### ✅ Success Indicators:
- No dummy data visible
- Real-time data from database
- Role-based UI (different buttons for different roles)
- Success/error messages on actions
- Proper form validation
- Responsive design

### ❌ Common Issues:
- If you see "Loading..." forever: Check backend is running
- If you get 401 errors: Token expired, login again
- If you get 403 errors: Role permission issue
- If no data shows: Database might be empty, create some data first

## 🛠️ Troubleshooting

### Backend Not Starting:
```bash
cd backend
npm install
npx prisma generate
npm start
```

### Frontend Not Starting:
```bash
cd frontend
npm install
npm run dev
```

### Database Issues:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## 📝 API Testing (Optional)

You can also test the API directly using tools like Postman or curl:

### Get All Clubs:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/clubs
```

### Create Event (Admin/Faculty):
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "Test Description",
    "eventDate": "2025-03-01",
    "location": "Main Hall",
    "maxCapacity": 100
  }'
```

### Register for Event:
```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID/register \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🎉 Success!

If all tests pass, you have successfully implemented:
- ✅ Complete Clubs & Events Hub
- ✅ Role-based access control
- ✅ Student view and join functionality
- ✅ Faculty/Admin management interface
- ✅ Real-time data integration
- ✅ No dummy data

Enjoy your fully functional Clubs & Events Hub! 🚀
