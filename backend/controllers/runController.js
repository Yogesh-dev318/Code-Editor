const axios = require('axios');

exports.runCode = async (req, res) => {
    // 1. Extract 'stdin' from the request
    const { language, files, stdin } = req.body;

    if (!files || files.length === 0) {
        return res.status(400).json({ output: "No files provided" });
    }

    const pistonConfig = {
        javascript: { language: 'javascript', version: '18.15.0' },
        typescript: { language: 'typescript', version: '5.0.3' },
        python:     { language: 'python', version: '3.10.0' },
        java:       { language: 'java', version: '15.0.2' },
        c:          { language: 'c', version: '10.2.0' },
        cpp:        { language: 'c++', version: '10.2.0' },
        rust:       { language: 'rust', version: '1.68.2' }
    };

    const config = pistonConfig[language];
    if (!config) {
        return res.status(400).json({ output: "Unsupported Language" });
    }

    let finalFiles = [...files];
    if (language === 'javascript') {
        finalFiles.push({ name: 'package.json', content: '{ "type": "module" }' });
    }

    try {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: config.language,
            version: config.version,
            files: finalFiles,
            stdin: stdin || "" // 2. Pass stdin to Piston
        });

        const { run, compile } = response.data;
        
        let output = "";
        if (compile && compile.output) output += `--- Compilation ---\n${compile.output}\n`;
        if (run && run.output) output += run.output;

        res.json({ output: output || "Code ran successfully (No Output)" });

    } catch (error) {
        console.error("Piston API Error:", error.message);
        res.status(500).json({ output: "Failed to execute code via Piston API" });
    }
};