const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createProject, getUserProjects, getProjectDetails, addCollaborator, deleteProject } = require('../controllers/projectController');

router.post('/', auth, createProject);
router.get('/', auth, getUserProjects);
router.get('/:id', auth, getProjectDetails);
router.put('/add-collaborator', auth, addCollaborator);
router.delete('/:id', auth, deleteProject);
module.exports = router;