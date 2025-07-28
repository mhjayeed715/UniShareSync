# UniShareSync

**UniShareSync** is a JavaFX-based desktop application built to streamline resource sharing and collaboration within university environments. It provides **role-specific dashboards** for students, faculty, and administrators, enabling effective communication, project tracking, and academic resource management — all in a user-friendly and real-time interface.

> 📦 Built with **JavaFX**, **SceneBuilder**, **MySQL (MariaDB)**, and **Apache NetBeans**

---

## 🚀 Features

### 1. Homepage (Public View)
- Browse announcements in a **read-only TableView** (`title`, `content`, `department`, `created_at`)
- Accessible `Signup` and `Login` buttons

### 2. Signup Page
- Register with `name`, `email`, `password`, and `role` (Student/Faculty)
- Role and admin status stored in MySQL (`users` table with `role`, `is_admin`)
- Input validation and error handling

### 3. Login Page
- Authenticates with email and password
- Redirects to appropriate dashboard based on role and admin status
- Displays alerts for invalid login attempts

### 4. Student Dashboard
- Collapsible sidebar navigation
- Access: `Announcements`, `Resources`, `Projects`, `Profile`
- CRUD features in searchable `TableView`s

### 5. Faculty Dashboard
- Role-specific dashboard with advanced project and task management
- Navigation: `Announcements`, `Resources`, `Projects`, `Profile`, `Logout`
- Searchable tables with edit/view access

### 6. Admin Dashboard
- Full-featured control panel with the following capabilities:
  - 👥 **User Management**: Add, update, or remove students/faculty
  - 📁 **Resource Management**: Upload and manage academic files
  - 📢 **Announcement Management**: Create, update, delete announcements
  - ✅ **Task Management**: Assign and track academic tasks
  - 📊 **Project Management**: Handle project records (add/edit/delete)
- Role-based data display in `TableView`s

### 7. Navbar
- Role-specific navigation bar:
  - `Announcements`, `Resources`, `Projects`, `Profile`, `Logout`
  - Admin view includes `Admin Dashboard` entry

### 8. Announcements Page
- View all announcements in a searchable, filterable `TableView`
- Filter by title or department
- Admin users can perform CRUD operations
- Save/unsave feature for all users
- Real-time UI updates with TableView binding

### 9. Resource Page
- Displays all academic resources in a searchable, filterable `TableView`
- Columns include: `title`, `category`, `subject`, `resource_type`, `uploader_name`
- Users can filter by category, subject, or type using `ComboBox` options
- Admin users can add or delete resources
- All users can view, search, and filter resources
- Real-time UI updates with TableView binding

### 10. Project Page
- Shows projects and tasks in searchable `TableView`s
- Project columns: `project_id`, `title`, `status`
- Task columns: `task_id`, `description`, `assigned_to`
- Users can join projects and view assigned tasks
- Admin users can add, edit, or delete project and task records
- Real-time UI updates with TableView binding

### 11. Profile Page
- Displays user profile details in editable form fields (`name`, `email')
- Allows users to update their profile information
- Changes can be saved with a dedicated Save button
- Real-time reflection of updates using UI binding


---

## 🛠 Technology Stack

| Component           | Tech Stack                                  |
|--------------------|----------------------------------------------|
| UI Framework        | JavaFX, SceneBuilder                        |
| Backend             | Java, JDBC                                  |
| Database            | MySQL(MariaDB)                              |
| IDE                 | Apache NetBeans                             |
| Styling             | CSS(inspired by Behance UI), Flaticon icons |
| Version Control     | Git + GitHub                                |

---

## 🗃 Database Schema

Database: `unisharesync_db`  
Key Tables:
- `users`
- `announcements`
- `resources`
- `projects`

Database uses role-based access and enum-like behavior (`student`, `faculty`, `admin`) to filter and serve data accordingly.

---

## 📷 Screenshots

### Home Page  
![Home Page](screenshots/homepage1.png)
![Home Page](screenshots/homepage2.png)
![Home Page](screenshots/homepage3.png)


### Signup Page  
![Signup Page](screenshots/signuppage.png)

### Login Page  
![Login Page](screenshots/loginpage.png)

### Student Dashboard  
![Dashboard](screenshots/dashboard.png)

### Faculty Dashboard  
![Dashboard with Navbar](screenshots/facultydashboard.png)

### Admin Dashboard  
![Admin Dashboard](screenshots/admindashuser.png)
![Admin Dashboard](screenshots/admindashannounce.png)
![Admin Dashboard](screenshots/admindashresource.png)
![Admin Dashboard](screenshots/admindashproject.png)
![Admin Dashboard](screenshots/admindashtask.png)


### Navbar
![Navbar Page](screenshots/dashboardwithnavbar.png)
![navbar Page](screenshots/admindashuser.png)


### Announcement Page  
![Announcement Page](screenshots/announcementpage.png)
![Announcement Page](screenshots/adminannouncement1.png)

### Resource Page  
![Resource Page](screenshots/resourcepage.png)
![Resource Page](screenshots/adminaresource1.png)

### Project Page  
![Project Page](screenshots/projectpage.png)
![Project Page](screenshots/adminaproject1.png)
![Project Page](screenshots/adminaproject2.png)


### Profile Page  
![Profile Page](screenshots/profilepage1.png)
![Profile Page](screenshots/profilepage2.png)
![Profile Page](screenshots/adminprofile1.png)
![Profile Page](screenshots/adminprofile2.png)


---

## 🔗 Repository

📌 GitHub: [https://github.com/mhjayeed715/UniShareSync](https://github.com/mhjayeed715/UniShareSync)

---

## 👨‍💻 Author

**S. M. Mehrab Hossain Jayed **  
📧 [GitHub Profile](https://github.com/mhjayeed715)

---

> 🚧 *Note: This project is actively maintained and was built as part of an academic initiative. Contributions and suggestions are welcome!*

