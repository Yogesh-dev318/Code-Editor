const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, default: "" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    language: { type: String, default: "javascript" }
});

module.exports = mongoose.model('File', FileSchema);