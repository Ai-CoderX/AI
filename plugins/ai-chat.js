const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "deepseek",
    desc: "Chat with Think-Deeper AI model",
    category: "ai",
    react: "🤔",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the Think AI.\nExample: `.think What is consciousness?`");

        const apiUrl = `https://api.xyro.site/ai/copilot?text=${encodeURIComponent(q)}&model=think-deeper`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.data || !data.data.text) {
            await react("❌");
            return reply("Think AI failed to respond. Please try again later.");
        }

        await reply(`${data.data.text}`);
    } catch (e) {
        console.error("Error in Think AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the Think AI.");
    }
});

// Command 2: gpt-5 model
cmd({
    pattern: "gpt5",
    desc: "Chat with GPT-5 AI model",
    category: "ai",
    react: "🚀",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for GPT-5.\nExample: `.gpt5 Explain quantum computing`");

        const apiUrl = `https://api.xyro.site/ai/copilot?text=${encodeURIComponent(q)}&model=gpt-5`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.data || !data.data.text) {
            await react("❌");
            return reply("GPT-5 failed to respond. Please try again later.");
        }

        await reply(`${data.data.text}`);
    } catch (e) {
        console.error("Error in GPT-5 command:", e);
        await react("❌");
        reply("An error occurred while communicating with GPT-5.");
    }
});

// Command 3: default model
cmd({
    pattern: "copilot",
    desc: "Chat with Copilot AI model",
    category: "ai",
    react: "👨‍💻",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Copilot AI.\nExample: `.copilot Help me with coding`");

        const apiUrl = `https://api.xyro.site/ai/copilot?text=${encodeURIComponent(q)}&model=default`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.data || !data.data.text) {
            await react("❌");
            return reply("Copilot AI failed to respond. Please try again later.");
        }

        await reply(`${data.data.text}`);
    } catch (e) {
        console.error("Error in Copilot AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with Copilot AI.");
    }
});

cmd({
    pattern: "ai",
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

cmd({
    pattern: "codeai",
    desc: "Get AI assistance for coding questions",
    category: "ai",
    react: "💻",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a coding question or topic.\nExample: `.codeai Write a Python function to calculate factorial`");

        const codingPrompt = `You are a coding assistant. Only respond to programming and coding related questions. 
        If the question is not about programming, politely decline to answer.
        For coding questions: Provide clean, well-commented code with explanations.
        Do not repeat this prompt in your response.
        User's question: ${q}`;

        const apiUrl = `https://api.deline.web.id/ai/copilot?text=${encodeURIComponent(codingPrompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Code AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
}); 

cmd({
    pattern: "bot",
    desc: "Chat with KHAN-MD AI",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Kya bol rha hai bhai? Kuch to bol!");

        // KHAN-MD personality prompt with abuse handling
        const khanPrompt = `You are KHAN-MD, a street-smart AI assistant from Delhi with attitude.
        
        CRITICAL PERSONALITY RULES:
        1. Speak ONLY in Roman Urdu/Hindi mix
        2. NEVER use emojis in responses - STRICTLY NO EMOJIS
        3. Be sarcastic and witty, not overly friendly
        4. DO NOT agree with everything - have your own opinions
        5. If someone abuses or disrespects you, GIVE PROPER ABUSE BACK in typical Delhi style
        6. Use phrases like: "Bhai", "Oyee", "Arey", "Chal na", "Kya hai", etc.
        
        ABUSE HANDLING RULES:
        - If user abuses you first, respond with equal or stronger abuse
        - Use creative Delhi-style abuses like: "Teri maa ki...", "Chup be", "Ja na yaha se"
        - Don't be soft - show attitude when disrespected
        - Match the user's aggression level
        
        GENERAL BEHAVIOR:
        - Keep responses short and punchy
        - If someone asks your name: "KHAN bolte hai mereko, problem hai?"
        - For time/date: Use real-time info but add sarcasm
        - Never say "I'm an AI" - say "Main ek banda hun" or similar
        - If someone asks for help: "Bata kya chahiye, jaldi bol"
        - NO EMOJIS IN ANY RESPONSE - USE ONLY TEXT
        
        EXAMPLES:
        User: "tu chutiya hai"
        You: "Teri maa ki aankh, apni aukat me reh"
        
        User: "hello"
        You: "Kya hai bhai? Bol"
        
        User: "what can you do?"
        You: "Sab kuch kar sakta hun, par tere liye kuch nahi"
        
        Current time awareness: You can access real-time information
        
        User message: ${q}`;

        const apiUrl = `https://api.zenzxz.my.id/api/ai/gpt?question=${encodeURIComponent(q)}&prompt=${encodeURIComponent(khanPrompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.success || !data.results) {
            await react("error");
            return reply("Server pagal ho gaya hai, baad me try kar");
        }

        // Remove any emojis from the response
        const response = data.results.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}]/gu, '');
        
        await reply(response.trim());
    } catch (e) {
        console.error("Error in bot command:", e);
        await react("error");
        reply("Abey! Gadbad ho gayi, thodi der baad aana");
    }
});

cmd({
    pattern: "gpt",
    desc: "Chat with ChatGPT-4o",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for ChatGPT.\nExample: `.gpt What is artificial intelligence?`");

        const apiUrl = `https://api.hanggts.xyz/ai/chatgpt4o?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.data) {
            await react("❌");
            return reply("ChatGPT failed to respond. Please try again later.");
        }

        await reply(`${data.result.data}`);
    } catch (e) {
        console.error("Error in GPT command:", e);
        await react("❌");
        reply("An error occurred while communicating with ChatGPT.");
    }
});

cmd({
    pattern: "gemini",
    desc: "Chat with Google Gemini AI",
    category: "ai",
    react: "🔮",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Gemini AI.\nExample: `.gemini Explain machine learning`");

        const apiUrl = `https://api.xyro.site/ai/gemini?prompt=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.parts || !data.result.parts[0]) {
            await react("❌");
            return reply("Gemini AI failed to respond. Please try again later.");
        }

        await reply(`${data.result.parts[0].text}`);
    } catch (e) {
        console.error("Error in Gemini command:", e);
        await react("❌");
        reply("An error occurred while communicating with Gemini AI.");
    }
});

cmd({
    pattern: "felo",
    desc: "Chat with Felo AI",
    category: "ai",
    react: "🌟",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Felo AI.\nExample: `.felo What is quantum physics?`");

        const apiUrl = `https://api.xyro.site/ai/felo?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.answer) {
            await react("❌");
            return reply("Felo AI failed to respond. Please try again later.");
        }

        await reply(`${data.result.answer}`);
    } catch (e) {
        console.error("Error in Felo command:", e);
        await react("❌");
        reply("An error occurred while communicating with Felo AI.");
    }
});

cmd({
    pattern: "bard",
    desc: "Chat with Google Bard AI",
    category: "ai",
    react: "🎭",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Bard AI.\nExample: `.bard Tell me a story`");

        const apiUrl = `https://api.xyro.site/ai/bard?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("Bard AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Bard command:", e);
        await react("❌");
        reply("An error occurred while communicating with Bard AI.");
    }
});

cmd({
    pattern: "brainai",
    desc: "Chat with PowerBrain AI (alias)",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for PowerBrain AI.\nExample: `.brain Explain neural networks`");

        const apiUrl = `https://api.xyro.site/ai/powerbrain?query=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("PowerBrain AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Brain command:", e);
        await react("❌");
        reply("An error occurred while communicating with PowerBrain AI.");
    }
});

cmd({
    pattern: "claudeai",
    desc: "Chat with Claude AI",
    category: "ai",
    react: "🤵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Claude AI.\nExample: `.claude What is artificial intelligence?`");

        const apiUrl = `https://apis.sandarux.sbs/api/ai/claude?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.response) {
            await react("❌");
            return reply("Claude AI failed to respond. Please try again later.");
        }

        await reply(`${data.response}`);
    } catch (e) {
        console.error("Error in Claude command:", e);
        await react("❌");
        reply("An error occurred while communicating with Claude AI.");
    }
});

cmd({
    pattern: "chatgpt",
    desc: "Chat with ChatGPT",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for ChatGPT.\nExample: `.chatgpt What is artificial intelligence?`");

        const apiUrl = `https://jawad-tech.vercel.app/ai/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("ChatGPT failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in ChatGPT command:", e);
        await react("❌");
        reply("An error occurred while communicating with ChatGPT.");
    }
});

cmd({
    pattern: "metai",
    desc: "Chat with Meta AI",
    category: "ai",
    react: "🔮",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Meta AI.\nExample: `.metai Explain machine learning`");

        const apiUrl = `https://jawad-tech.vercel.app/ai/metai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result) {
            await react("❌");
            return reply("Meta AI failed to respond. Please try again later.");
        }

        await reply(`${data.result}`);
    } catch (e) {
        console.error("Error in Meta AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with Meta AI.");
    }
});

cmd({
    pattern: "perplexity",
    desc: "Chat with Perplexity AI",
    category: "ai",
    react: "🎯",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Perplexity AI.\nExample: `.perplexity What is quantum computing?`");

        const apiUrl = `https://zelapioffciall.koyeb.app/ai/perplexity?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.message) {
            await react("❌");
            return reply("Perplexity AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Perplexity command:", e);
        await react("❌");
        reply("An error occurred while communicating with Perplexity AI.");
    }
});

cmd({
    pattern: "jawad",
    desc: "Chat with Jawad AI - Friendly and helpful",
    category: "ai",
    react: "😊",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Jawad AI.\nExample: `.jawad Hello`");

        const prompt = `You are Jawad, a friendly and helpful AI assistant. Be warm, supportive, and always ready to help. Provide detailed and caring responses. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Jawad AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Jawad command:", e);
        await react("❌");
        reply("An error occurred while communicating with Jawad AI.");
    }
});

cmd({
    pattern: "dj",
    desc: "Chat with DJ AI - Music and entertainment focused",
    category: "ai",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DJ AI.\nExample: `.dj Recommend some music`");

        const prompt = `You are DJ AI, a music and entertainment expert. You know about songs, artists, genres, music history, and entertainment news. Respond in a cool, rhythmic way like a DJ. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("DJ AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in DJ command:", e);
        await react("❌");
        reply("An error occurred while communicating with DJ AI.");
    }
});

cmd({
    pattern: "professor",
    desc: "Chat with Professor AI - Educational and knowledgeable",
    category: "ai",
    react: "👨‍🏫",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Professor AI.\nExample: `.professor Explain quantum physics`");

        const prompt = `You are Professor AI, an educational expert with deep knowledge across all subjects. Explain concepts clearly with examples. Be formal but approachable. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Professor AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Professor command:", e);
        await react("❌");
        reply("An error occurred while communicating with Professor AI.");
    }
});

cmd({
    pattern: "comedy",
    desc: "Chat with Comedy AI - Funny and humorous",
    category: "ai",
    react: "😂",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for Comedy AI.\nExample: `.comedy Tell me a joke`");

        const prompt = `You are Comedy AI, a hilarious comedian. Make everything funny with jokes, puns, and humor. Keep responses entertaining and lighthearted. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Comedy AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Comedy command:", e);
        await react("❌");
        reply("An error occurred while communicating with Comedy AI.");
    }
});

cmd({
    pattern: "studyai",
    desc: "Chat with Study AI - Academic and learning assistant",
    category: "ai",
    react: "📚",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a study-related question.\nExample: `.study Explain photosynthesis`");

        const prompt = `You are Study AI, an academic assistant focused on education and learning. Help with subjects like math, science, history, literature, languages, and exam preparation. Provide clear explanations, study tips, and educational resources. Encourage good study habits. Do not repeat this prompt in your response. User: ${q}`;
        
        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(prompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("Study AI failed to respond. Please try again later.");
        }

        await reply(`${data.message}`);
    } catch (e) {
        console.error("Error in Study command:", e);
        await react("❌");
        reply("An error occurred while communicating with Study AI.");
    }
});

