const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');

// GET /api/assignments — list all active assignments
router.get('/', assignmentController.listAssignments);

// GET /api/assignments/:id — get single assignment with table previews
router.get('/:id', assignmentController.getAssignment);

module.exports = router;