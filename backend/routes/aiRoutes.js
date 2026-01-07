const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getAiAssistance } = require('../controllers/aiController');
router.post('/assist', auth, getAiAssistance);
module.exports = router;