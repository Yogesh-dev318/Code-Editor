const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createFile, updateFileContent, deleteFile } = require('../controllers/fileController');

router.post('/', auth, createFile);
router.put('/:id', auth, updateFileContent);
router.delete('/:id', auth, deleteFile);
module.exports = router;