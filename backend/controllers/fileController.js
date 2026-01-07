const File = require('../models/File');

exports.createFile = async (req, res) => {
    try {
        const { name, projectId, content } = req.body;
        const newFile = new File({ name, projectId, content: content || "" });
        const file = await newFile.save();
        res.json(file);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateFileContent = async (req, res) => {
    try {
        const { content } = req.body;
        const file = await File.findByIdAndUpdate(
            req.params.id, 
            { content }, 
            { new: true }
        );
        res.json(file);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteFile = async (req, res) => {
    try {
        await File.findByIdAndDelete(req.params.id);
        res.json({ msg: 'File deleted' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};