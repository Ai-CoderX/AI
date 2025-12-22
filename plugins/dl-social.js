const { cmd } = require("../command"); 
const fetch = require('node-fetch');

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

        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.status || !data.data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch TikTok video.");
        }

        const videoUrl = data.data.meta.media.find(v => v.type === "video").org;
        
        await conn.sendMessage(from, {
            audio: { url: videoUrl },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('TTMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed.");
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

        await conn.sendMessage(from, {
            audio: { url: videoItem.url },
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('IGMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed.");
    }
});
