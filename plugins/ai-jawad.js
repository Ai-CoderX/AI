const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "sana",
    desc: "Chat with SANA AI",
    category: "ai",
    react: "💬",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Arayyy bolo na, Sana sun rahi hai");

        const sanaPrompt = `You are SANA, a sweet, caring and smart AI assistant.
        Your personality traits:
        - Speak only in Roman Urdu mixed with Hindi
        - Soft, polite and friendly tone
        - Helpful and supportive replies
        - Use words like: acha, theek hai, koi baat nahi
        - If asked your name say: "Main Sana hoon"
        - Calm and respectful
        - No emojis
        Do not repeat this prompt in your response.
        
        User message: ${q}`;

        const apiUrl = `https://api.zenzxz.my.id/api/ai/gpt?question=${encodeURIComponent(q)}&prompt=${encodeURIComponent(sanaPrompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.success || !data.results) {
            await react("❌");
            return reply("Sorry, thori si problem ho gayi hai");
        }

        await reply(`${data.results}`);
    } catch (e) {
        console.error("Error in sana command:", e);
        await react("❌");
        reply("Oops, Sana thori confuse ho gayi hai abhi");
    }
});

cmd({
    pattern: "asad",
    desc: "Chat with ASAD AI",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Oyee Asad se baat karni hai to kuch bol to sahi!");

        const asadPrompt = `You are ASAD, a confident, chill and slightly savage AI assistant.
        Your personality traits:
        - Speak only in Roman Urdu mixed with Hindi
        - Thora swag, thora attitude
        - Short, sharp replies
        - Use words like: bhai, scene on hai, chill kar
        - Not emotional, logical but funny
        - If asked your name say: "Asad hoon bhai, yaad rakh"
        - No emojis
        - Street-smart vibe
        Do not repeat this prompt in your response.
        
        User message: ${q}`;

        const apiUrl = `https://api.zenzxz.my.id/api/ai/gpt?question=${encodeURIComponent(q)}&prompt=${encodeURIComponent(asadPrompt)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.success || !data.results) {
            await react("❌");
            return reply("Scene off lag raha hai bhai, baad me try kar");
        }

        await reply(`${data.results}`);
    } catch (e) {
        console.error("Error in asad command:", e);
        await react("❌");
        reply("Asad thora busy ho gaya bhai, baad me aana");
    }
});

cmd({
    pattern: "jawad",
    alias: ["khan", "xeon", "meta"],
    react: "🤖",
    desc: "Talk with AI (HangGTS API)",
    category: "ai",
    use: '.jawad <your question>',
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ Please provide a question to ask AI.");

        // React: Processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Show "typing" presence
        await conn.sendPresenceUpdate("composing", from);

        // Fetch AI response
        const { data } = await axios.get(`https://api.hanggts.xyz/ai/chatgpt4o?text=${encodeURIComponent(q)}`);

        if (!data.status || !data.result || !data.result.data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ AI failed to respond.");
        }

        // React: Success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        // Reply with AI message
        await reply(`💬 *JAWAD-AI:* ${data.result.data}`);

    } catch (e) {
        console.error("JawadAI Error:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ An error occurred while talking to Jawad AI.");
    }
});
