const express = require('express');
const router = express.Router();
const { createPublicItem } = require('../controllers/lostFoundController');

// Public routes - NO authentication required
router.post('/report', createPublicItem);

module.exports = router;