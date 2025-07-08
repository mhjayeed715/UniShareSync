\# UniShareSync



UniShareSync is a JavaFX-based application designed to manage user roles, announcements, resources, tasks, and projects. This README outlines the features implemented so far and provides an overview of the project structure.



\## Features



\### 1. Signup Page

\- Allows users to register with an email, name, password, and role (student or faculty).

\- Role selection is integrated to determine user type.

\- Data is stored in a database with a separate `role` column and `is\_admin` boolean for admin status.



\### 2. Login Page

\- Enables users to log in using their email and password.

\- Authenticates users and redirects them based on their role (student or faculty).

\- Includes basic error handling for invalid credentials.



\### 3. Dashboard

\- Displays a user-friendly interface with a navbar for navigation.

\- Supports role-based views (student/faculty) with access to announcements, resources, tasks, and projects.

\- Includes a searchable table for each category (e.g., users, announcements).



\### 4. Navbar

\- Provides navigation options (Announcements, Resources, Projects, Profile).

\- Dynamically adjusts visibility based on the user's role.

\- Includes a logout button for session management.



\### 5. Admin Dashboard

\- Offers an enhanced interface for admin users with comprehensive management powers:

&nbsp; - \*\*User Management\*\*: CRUD operations (Create, Read, Update, Delete) for users with role selection (student/faculty).

&nbsp; - \*\*Resource Management\*\*: Ability to add, update, delete, and view resources with file upload support.

&nbsp; - \*\*Announcement Management\*\*: CRUD operations for creating, editing, and removing announcements.

&nbsp; - \*\*Task Management\*\*: Add, update, delete, and view tasks with status tracking.

&nbsp; - \*\*Project Management\*\*: CRUD operations for managing project titles.

\- Displays tables for each category with relevant columns (e.g., email, name, role for users; title, file path for resources).



\### 6. Admin Navbar

\- Extends the standard navbar with an additional "Admin Dashboard" button for admin users.

\- Maintains the same navigation options as the standard navbar with role-based visibility.



\## Screenshots



Include screenshots to showcase the progress. Below are suggested sections with placeholder image links. Replace the placeholders with actual image paths or URLs after uploading the screenshots.



\### Signup Page

!\[Signup Page](src/unisharesync/screenshots/signup\_page.png)

\- Shows the signup form with email, name, password, and role dropdown.



\### Login Page

!\[Login Page](screenshots/login\_page.png)

\- Displays the login form with email and password fields.



\### Dashboard

!\[Dashboard](screenshots/dashboard.png)

\- Highlights the dashboard interface with the navbar and role-based content.



\### Admin Dashboard

!\[Admin Dashboard](src/unisharesync/screenshots/admin\_dashboard.png))

\- Shows the admin management interface.



\### Admin Navbar

!\[Admin Navbar](screenshots/admin\_navbar.png)

\- Shows the navbar with the additional "Admin Dashboard" button.



