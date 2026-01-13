const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Public route to get all departments (for signup)
router.get('/', departmentController.getAllDepartments);

module.exports = router;
