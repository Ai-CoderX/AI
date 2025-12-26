const { cmd } = require("../command");
const fetch = require("node-fetch");

// List of Islamic search queries for random selection
const islamicQueries = [
    "Islamic status",
    "Quran recitation",
    "Islamic nasheed",
    "Muslim prayer",
    "Islamic reminder",
    "Allah names",
    "Prophet Muhammad",
    "Islamic dua",
    "Muslim community",
    "Islamic teachings",
    "Ramadan status",
    "Islamic motivation",
    "Islamic quotes",
    "Muslim brotherhood",
    "Islamic education",
    "Muslim lifestyle",
    "Islamic history",
    "Muslim culture",
    "Islamic faith",
    "Muslim unity",
    "Surah recitation",
    "Islamic wisdom",
    "Muslim inspiration",
    "Islamic values",
    "Muslim identity"
];

cmd({
    pattern: "status",
    desc: "Send random Islamic status videos from TikTok",
    react: '❤️',
    category: '',
    use: ".status",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        // Select a random Islamic query
        const randomQuery = islamicQueries[Math.floor(Math.random() * islamicQueries.length)];
        
        // Using the API endpoint
        const url = `https://delirius-apiofc.vercel.app/search/tiktoksearch?query=${encodeURIComponent(randomQuery)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate response
        if (!data?.meta || !data.meta.length) {
            return reply("❌ Failed to fetch Islamic video. Please try again.");
        }
        
        const results = data.meta;
        
        // Select one random video
        const randomVideo = results[Math.floor(Math.random() * results.length)];
        
        if (randomVideo.hd) {
            await conn.sendMessage(
                from,
                { 
                    video: { url: randomVideo.hd },
                    caption: `🌺 *Islamic Status Video*\n> *© Powered by KHAN-MD*`
                },
                { quoted: mek }
            );
        } else {
            reply("❌ Failed to retrieve video. Please try again.");
        }
        
    } catch (error) {
        console.error('Islamic Status Error:', error);
        reply("❌ Failed to fetch Islamic video. Please try again.");
    }
});
