const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getAiAssistance = async (req, res) => {
    const { code, prompt, context } = req.body; 

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let systemInstruction = "";
        if (context === "fix") {
            systemInstruction = "You are an expert code debugger. Fix the errors in the code provided. Return ONLY the fixed code. Do not wrap in markdown if possible.";
        } else if (context === "review") {
            systemInstruction = "You are a code reviewer. Review the code quality and security. Keep it brief.";
        } else {
            systemInstruction = "You are a coding assistant. Generate code based on the prompt. Return ONLY the code.";
        }

        const fullPrompt = `${systemInstruction}\nUser Prompt: ${prompt}\nCode:\n${code || ""}`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ result: text });
    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        res.status(500).json({ 
            result: `AI Service Error: ${error.message.includes('404') ? 'Model not found (Check API Key/Model Name)' : error.message}` 
        });
    }
};