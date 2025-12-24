const { cmd } = require("../command");
const fetch = require('node-fetch');
const converter = require('../lib/converter'); // Add converter

cmd({
    pattern: "ttmp3",
    alias: ["tiktokmp3", "tiktokaudio", "ttaudio"],
    react: "🎵",
    desc: "Extract audio from TikTok video",
    category: "download",
    use: ".ttmp3 <TikTok URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("tiktok.com")) {
            return reply("❌ Please provide/reply to a TikTok link");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Fetch TikTok video
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.status || !data.data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch TikTok video.");
        }

        const videoUrl = data.data.meta.media.find(v => v.type === "video").org;
        
        // Download video as buffer
        await conn.sendMessage(from, { react: { text: '⬇️', key: m.key } });
        const videoResponse = await fetch(videoUrl);
        const videoBuffer = await videoResponse.buffer();
        
        // Convert video to MP3 using converter
        await conn.sendMessage(from, { react: { text: '🔧', key: m.key } });
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');
        
        // Send converted audio
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('TTMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed. Error: " + error.message);
    }
});

cmd({
    pattern: "igmp3",
    alias: ["instamp3", "instaaudio", "igaudio"],
    react: "🎵",
    desc: "Extract audio from Instagram video/reel",
    category: "download",
    use: ".igmp3 <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, q }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) {
            return reply("❌ Please provide/reply to an Instagram link");
        }

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Fetch Instagram video
        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data?.status || !data.data?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch media.");
        }

        const videoItem = data.data.find(item => item.type === 'video');
        if (!videoItem) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("No video found.");
        }

        // Download video as buffer
        await conn.sendMessage(from, { react: { text: '⬇️', key: m.key } });
        const videoResponse = await fetch(videoItem.url);
        const videoBuffer = await videoResponse.buffer();
        
        // Convert video to MP3 using converter
        await conn.sendMessage(from, { react: { text: '🔧', key: m.key } });
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');
        
        // Send converted audio
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('IGMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed. Error: " + error.message);
    }
});
