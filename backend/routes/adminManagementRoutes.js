const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Import controllers
const userController = require('../controllers/userManagementController');
const resourceController = require('../controllers/resourceManagementController');
const eventController = require('../controllers/eventManagementController');
const projectController = require('../controllers/projectManagementController');
const feedbackController = require('../controllers/feedbackManagementController');
const lostFoundController = require('../controllers/lostFoundManagementController');
const departmentController = require('../controllers/departmentController');
const courseController = require('../controllers/courseController');

// Apply auth middleware
router.use(protect);
router.use(adminOnly);

// User Management Routes
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUser);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Resource Management Routes
router.get('/resources', resourceController.getAllResources);
router.put('/resources/:id/approve', resourceController.approveResource);
router.post('/resources/bulk-action', resourceController.bulkAction);
router.delete('/resources/:id', resourceController.deleteResource);

// Event Management Routes
router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEvent);
router.post('/events', eventController.createEvent);
router.put('/events/:id', eventController.updateEvent);
router.delete('/events/:id', eventController.deleteEvent);
router.get('/events/:id/registrations', eventController.getEventRegistrations);

// Project Management Routes
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProject);
router.put('/projects/:id/status', projectController.updateProjectStatus);
router.delete('/projects/:id', projectController.deleteProject);
router.get('/projects/:id/members', projectController.getProjectMembers);
router.delete('/projects/:id/members/:memberId', projectController.removeMember);

// Feedback Management Routes
router.get('/feedback', feedbackController.getAllFeedback);
router.get('/feedback/:id', feedbackController.getFeedback);
router.put('/feedback/:id/respond', feedbackController.respondToFeedback);
router.put('/feedback/:id/resolve', feedbackController.markAsResolved);
router.post('/feedback/bulk-resolve', feedbackController.bulkResolve);
router.delete('/feedback/:id', feedbackController.deleteFeedback);

// Lost & Found Management Routes
router.get('/lost-found', lostFoundController.getAllItems);
router.get('/lost-found/:id', lostFoundController.getItem);
router.put('/lost-found/:id/status', lostFoundController.updateItemStatus);
router.delete('/lost-found/:id', lostFoundController.deleteItem);
router.get('/lost-found/matches', lostFoundController.findMatches);

// Department Management Routes
router.get('/departments', departmentController.getAllDepartments);
router.post('/departments', departmentController.createDepartment);
router.put('/departments/:id', departmentController.updateDepartment);
router.delete('/departments/:id', departmentController.deleteDepartment);

// Course Management Routes
router.get('/courses', courseController.getAllCourses);
router.get('/courses/:id', courseController.getCourse);
router.post('/courses', courseController.createCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);

module.exports = router;
