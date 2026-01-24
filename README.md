# UniShareSync

A comprehensive university resource sharing and collaboration platform that enables students, faculty, and administrators to share academic materials, collaborate on projects, manage events, and stay connected through real-time notifications.

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Problem Statement

Universities face challenges in managing and sharing academic resources, coordinating student activities, and maintaining effective communication across campus. Students struggle to find study materials, collaborate on projects, and stay informed about events. Faculty members need efficient ways to share resources and manage approvals. Administrators require centralized tools to oversee campus activities and communicate with different user groups.

**UniShareSync** addresses these challenges by providing a unified platform for resource sharing, project collaboration, event management, and role-based communication.

## ✨ Features

### 🔐 Authentication & User Management
- Secure login/signup with email OTP verification
- Role-based access control (Student, Faculty, Admin)
- Profile management with picture upload
- Password change functionality

### 📚 Resource Management
- Upload and share study materials (notes, assignments, past papers)
- Semester and course-wise organization
- Admin/Faculty approval workflow for student uploads
- Search and filter by semester, course, and type
- Download tracking and view counts
- File type support: PDF, DOCX, PPT, images

### 📢 Notice Board
- Priority-based notices (Low, Normal, High)
- Image attachments support
- Public and authenticated access
- Admin-only posting with instant notifications

### 🤝 Project Collaboration
- Create and join projects
- Team member management
- Project status tracking (Active, Recruiting, Completed)
- Semester-wise categorization
- Deadline management

### 🎉 Events & Clubs
- Club creation and membership management
- Event scheduling with capacity limits
- Registration system with real-time updates
- Event status tracking (Upcoming, Ongoing, Completed)
- Club join request approval workflow

### 🔍 Lost & Found
- Report lost/found items with images
- Category-based organization
- Location tracking
- Contact information management
- Status updates (Open, Matched, Resolved)

### 💬 Feedback System
- Anonymous and identified feedback submission
- Category-based organization (Academic, Technical, General)
- Admin response system
- Status tracking (Pending, Responded, Resolved)
- Public feedback visibility

### 🔔 Notification System
- **Automatic notifications** for all platform activities
- Role-based targeting (Students, Faculty, Admins)
- Real-time updates with 30-second auto-refresh
- Notification types (Info, Success, Warning, Error)
- Unread count tracking
- Manual admin broadcasting for announcements

### 📅 Class Scheduler
- Routine management and viewing
- Department and semester-wise schedules
- Room availability tracking

### 📊 Dashboard
- Role-specific dashboards
- Activity statistics and analytics
- Recent activity feed
- Quick action shortcuts

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library for building interactive interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Prisma ORM** - Next-generation database toolkit
- **PostgreSQL** - Relational database management system
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload middleware
- **Nodemailer** - Email service for OTP


### Development Tools
- **Git** - Version control
- **npm** - Package manager
- **VS Code** - Code editor

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/unisharesync.git
cd unisharesync
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Configure environment variables
```bash
# Create .env file in backend directory
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/unisharesync"
JWT_SECRET="your-secret-key"
PORT=5000

# Email Configuration (for OTP)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

4. Setup database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npm run seed
```

5. Start backend server
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Install frontend dependencies
```bash
cd ../frontend
npm install
```

2. Start frontend development server
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🚀 Usage

### Default Admin Account
After seeding the database, use these credentials:
- **Email**: admin@university.edu
- **Password**: admin123
- **Role**: ADMIN

### User Roles

**Student**
- Upload resources (requires approval)
- Browse and download approved resources
- Join projects and clubs
- Register for events
- Submit feedback
- Report lost/found items

**Faculty**
- All student permissions
- Upload resources (auto-approved)
- Create events and clubs
- Approve club join requests
- View event registrations

**Admin**
- All faculty permissions
- Manage users (create, update, delete)
- Approve/reject resources
- Manage all content (notices, events, clubs, projects)
- Send manual notifications to specific roles
- View analytics and system statistics
- Respond to feedback

## 📁 Project Structure

```
unisharesync/
├── backend/
│   ├── config/
│   │   └── prisma.js              # Database configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── notificationController.js  # Notification system
│   │   ├── resourceController.js  # Resource management
│   │   ├── eventManagementController.js  # Events
│   │   └── ...                    # Other controllers
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT & role verification
│   │   └── uploadMiddleware.js    # File upload handling
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── notificationRoutes.js  # Notification endpoints
│   │   └── ...                    # Other routes
│   ├── utils/
│   │   ├── notificationHelper.js  # Notification utilities
│   │   └── sendEmail.js           # Email service
│   ├── uploads/                   # Uploaded files storage
│   ├── .env                       # Environment variables
│   ├── server.js                  # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/             # Admin components
│   │   │   │   ├── NotificationManager.jsx
│   │   │   │   ├── ResourceManagement.jsx
│   │   │   │   └── ...
│   │   │   └── ui/                # Reusable UI components
│   │   ├── pages/
│   │   │   ├── AppLayout.jsx      # Main layout with notifications
│   │   │   ├── Dashboard.jsx      # User dashboard
│   │   │   ├── AdminDashboard.jsx # Admin dashboard
│   │   │   ├── LoginPage.jsx      # Login page
│   │   │   └── ...                # Other pages
│   │   ├── api.js                 # API client
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 📡 API Documentation

### Authentication Endpoints

```
POST /api/auth/signup          # Register new user
POST /api/auth/login           # Login user
POST /api/auth/verify-otp      # Verify OTP
POST /api/auth/resend-otp      # Resend OTP
```

### Resource Endpoints

```
GET    /api/resources          # Get all approved resources
POST   /api/resources          # Upload resource
GET    /api/resources/:id      # Get single resource
DELETE /api/resources/:id      # Delete resource
GET    /api/resources/:id/download  # Download resource
```

### Notification Endpoints

```
GET    /api/notifications      # Get user notifications
PUT    /api/notifications/:id/read  # Mark as read
PUT    /api/notifications/read-all  # Mark all as read
POST   /api/notifications/send-role  # Send to specific role (Admin)
POST   /api/notifications/send-bulk  # Send to multiple roles (Admin)
```

### Event Endpoints

```
GET    /api/clubs/events       # Get all events
POST   /api/clubs/events       # Create event (Admin/Faculty)
GET    /api/clubs/events/:id   # Get single event
PUT    /api/clubs/events/:id   # Update event (Admin/Faculty)
DELETE /api/clubs/events/:id   # Delete event (Admin/Faculty)
POST   /api/clubs/events/:id/register  # Register for event
```

### Club Endpoints

```
GET    /api/clubs/clubs        # Get all clubs
POST   /api/clubs/clubs        # Create club (Admin/Faculty)
GET    /api/clubs/clubs/:id    # Get single club
POST   /api/clubs/clubs/:clubId/join  # Join club
GET    /api/clubs/clubs/:clubId/requests  # Get join requests
PUT    /api/clubs/clubs/:clubId/requests/:memberId  # Approve/reject
```

## 🔔 Notification System

### Automatic Notifications

The system automatically sends notifications for:

1. **Notice Posted** → All users
2. **Resource Uploaded** → Admins (if student) / Students (if approved)
3. **Event Created** → All users
4. **Club Created** → All users
5. **Project Created** → All users
6. **Lost/Found Item** → Admins
7. **Feedback Submitted** → Admins
8. **Feedback Responded** → Submitter

### Manual Notifications (Admin)

Admins can send custom notifications:
1. Navigate to Admin Dashboard → "Send Notifications"
2. Select target roles (Students/Faculty/Admins)
3. Choose notification type (Info/Success/Warning/Error)
4. Enter title and message
5. Optionally add a link
6. Click "Send Notification"

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by university collaboration needs
- Built with modern web technologies


