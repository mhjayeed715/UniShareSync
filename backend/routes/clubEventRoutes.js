const express = require('express');
const router = express.Router();
const { protect, adminOrFaculty } = require('../middleware/authMiddleware');
const clubController = require('../controllers/clubController');
const eventController = require('../controllers/eventManagementController');

// Apply auth middleware
router.use(protect);

// Club routes
router.get('/clubs', clubController.getAllClubs);
router.get('/clubs/my', clubController.getUserClubs);
router.get('/clubs/:id', clubController.getClub);
router.post('/clubs', adminOrFaculty, clubController.createClub);
router.put('/clubs/:id', adminOrFaculty, clubController.updateClub);
router.delete('/clubs/:id', adminOrFaculty, clubController.deleteClub);

// Club membership routes
router.post('/clubs/:clubId/join', clubController.requestJoinClub);
router.get('/clubs/:clubId/requests', adminOrFaculty, clubController.getPendingRequests);
router.put('/clubs/:clubId/requests/:memberId', adminOrFaculty, clubController.handleJoinRequest);

// Event routes
router.get('/events', eventController.getAllEvents);
router.get('/events/:id', eventController.getEvent);
router.post('/events', adminOrFaculty, eventController.createEvent);
router.put('/events/:id', adminOrFaculty, eventController.updateEvent);
router.delete('/events/:id', adminOrFaculty, eventController.deleteEvent);

// Event registration routes
router.post('/events/:id/register', eventController.registerForEvent);
router.delete('/events/:id/register', eventController.unregisterFromEvent);
router.get('/events/:id/registrations', adminOrFaculty, eventController.getEventRegistrations);

module.exports = router;
