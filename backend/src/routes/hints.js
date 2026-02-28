const express = require('express');
const router = express.Router();
const hintController = require('../controllers/hintController');

// POST /api/hint — get an LLM-powered hint
router.post('/', hintController.getHint);

module.exports = router;