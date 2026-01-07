const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getAiAssistance = async (req, res) => {
    const { code, prompt, context } = req.body; 

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let systemInstruction = "";
        if (context === "fix") {
            systemInstruction = "You are an expert code debugger. Fix the errors in the code provided.";
        } else if (context === "review") {
            systemInstruction = "You are a code reviewer. Review the code quality and security.";
        } else {
            systemInstruction = "You are a coding assistant. Generate code based on the prompt.";
        }

        const fullPrompt = `${systemInstruction}\nUser Prompt: ${prompt}\nCode:\`\`\`${code || ""}\`\`\``;
        
        const result = await model.generateContent(fullPrompt);
        res.json({ result: result.response.text() });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ msg: "AI Service Failed" });
    }
};