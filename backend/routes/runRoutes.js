const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const { runCode } = require('../controllers/runController');

router.post('/', auth, runCode);

module.exports = router;