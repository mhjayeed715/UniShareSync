const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getMyProjects,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  joinProject,
  acceptJoinRequest,
  declineJoinRequest,
  getProjectById
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get all projects (browse)
router.get('/', getAllProjects);

// Get user's projects
router.get('/my-projects', getMyProjects);

// Update project status (specific routes before generic /:id)
router.patch('/:id/status', updateProjectStatus);

// Join project (send request)
router.post('/:id/join', joinProject);

// Accept join request
router.post('/:id/accept/:requestId', acceptJoinRequest);

// Decline join request
router.post('/:id/decline/:requestId', declineJoinRequest);

// Get specific project
router.get('/:id', getProjectById);

// Create new project
router.post('/', createProject);

// Update project
router.put('/:id', updateProject);

// Update project status - using PUT instead of PATCH
router.put('/:id/status', updateProjectStatus);

// Delete project
router.delete('/:id', deleteProject);

module.exports = router;