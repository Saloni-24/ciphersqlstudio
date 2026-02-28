const express = require('express');
const router = express.Router();
const queryController = require('../controllers/queryController');

// POST /api/query/execute
router.post('/execute', queryController.executeQuery);

module.exports = router;