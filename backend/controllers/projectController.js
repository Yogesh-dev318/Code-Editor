const Project = require('../models/Project');
const File = require('../models/File');
const User = require('../models/User');

exports.createProject = async (req, res) => {
    try {
        const { name } = req.body;
        const newProject = new Project({
            name,
            owner: req.user.id,
            collaborators: [req.user.id]
        });
        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getUserProjects = async (req, res) => {
    try {
        const projects = await Project.find({ collaborators: req.user.id })
            .populate('owner', 'username email');
        
        const projectData = await Promise.all(projects.map(async (p) => {
            const fileCount = await File.countDocuments({ projectId: p._id });
            return { ...p._doc, fileCount };
        }));

        res.json(projectData);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getProjectDetails = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('collaborators', 'username email');
            
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        
        const isAuthorized = project.collaborators.some(c => c._id.toString() === req.user.id);
        if (!isAuthorized) return res.status(401).json({ msg: 'Not authorized' });

        const files = await File.find({ projectId: project._id });
        res.json({ project, files });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await File.deleteMany({ projectId: project._id });
        await Project.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Project deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.addCollaborator = async (req, res) => {
    try {
        const { projectId, email } = req.body;
        const userToAdd = await User.findOne({ email });
        
        if (!userToAdd) return res.status(404).json({ msg: 'User not found' });

        const project = await Project.findById(projectId);
        if (project.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Only owner can add collaborators' });
        }

        if (!project.collaborators.includes(userToAdd._id)) {
            project.collaborators.push(userToAdd._id);
            await project.save();
        }
        res.json(project);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
exports.joinProject = async (req, res) => {
    try {
        const { projectId } = req.body;
        
        // validate format of ID to prevent server crash
        if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ msg: 'Invalid Project ID format' });
        }

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ msg: 'Project not found' });

        // Check if user is already a collaborator (or owner)
        if (project.owner.toString() === req.user.id || project.collaborators.includes(req.user.id)) {
            return res.json(project); // Already joined, just return it
        }

        // Add user to collaborators
        project.collaborators.push(req.user.id);
        await project.save();
        
        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};