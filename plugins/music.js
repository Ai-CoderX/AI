const { cmd } = require('../command');
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');

// Helper for small caps font
const toSmallCaps = (text) => {
    const map = {
        'a': 'ᴀ','b': 'ʙ','c': 'ᴄ','d': 'ᴅ','e': 'ᴇ','f': 'ғ','g': 'ɢ','h': 'ʜ','i': 'ɪ','j': 'ᴊ',
        'k': 'ᴋ','l': 'ʟ','m': 'ᴍ','n': 'ɴ','o': 'ᴏ','p': 'ᴘ','q': 'ǫ','r': 'ʀ','s': 's','t': 'ᴛ',
        'u': 'ᴜ','v': 'ᴠ','w': 'ᴡ','x': 'x','y': 'ʏ','z': 'ᴢ'
    };
    return text.split('').map(c => map[c.toLowerCase()] || c).join('');
};

cmd({
    pattern: "song",
    alias: ["yt", "ytdl"],
    desc: "Download YouTube song or video",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎶 Please provide a YouTube video name or link.\n\nExample:\n`.song Alone - Alan Walker`");

        // 🔍 Search YouTube
        let video = null;
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            const videoId = q.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
            const results = await yts({ videoId: videoId ? videoId[1] : q });
            video = results;
        } else {
            const search = await yts(q);
            if (!search.videos || !search.videos.length) return await reply("❌ No results found.");
            video = search.videos[0];
        }

        // 🖼 Menu Caption
        const caption = `*╭┈───〔 ${toSmallCaps('YT Downloader')} 〕┈───⊷*
*├▢ 🎬 Title:* ${video.title}
*├▢ 📺 Channel:* ${video.author.name}
*├▢ ⏰ Duration:* ${video.timestamp}
*╰───────────────────⊷*
*╭───⬡ ${toSmallCaps('Select Format')} ⬡───*
*┋ ⬡ 1.* 🎧 ${toSmallCaps('Audio (MP3)')}
*┋ ⬡ 2.* 📹 ${toSmallCaps('Video (MP4)')}
*╰───────────────────⊷*

> ${toSmallCaps('*Please Reply With 1 or 2')}*`;

        const sent = await conn.sendMessage(from, {
            image: { url: video.thumbnail },
            caption
        }, { quoted: mek });

        const msgId = sent.key.id;

        // 🕒 Wait for user reply
        conn.ev.on("messages.upsert", async (msgData) => {
            const received = msgData.messages[0];
            if (!received.message) return;

            const text = received.message.conversation || received.message.extendedTextMessage?.text;
            const sender = received.key.remoteJid;
            const replyToBot = received.message.extendedTextMessage?.contextInfo?.stanzaId === msgId;

            if (replyToBot) {
                await conn.sendMessage(sender, { react: { text: '⬇️', key: received.key } });

                if (text === "1" || text === "2") {
                    const type = text === "1" ? "mp3" : "mp4";

                    if (type === "mp3") {
                        // Use audio API for MP3
                        const apiUrl = `https://jawad-tech.vercel.app/download/audio?url=${encodeURIComponent(video.url)}`;
                        const { data } = await axios.get(apiUrl);

                        if (!data?.status || !data?.result) {
                            return await conn.sendMessage(sender, { text: "❌ Audio download failed, please try again later." }, { quoted: received });
                        }

                        await conn.sendMessage(sender, {
                            audio: { url: data.result },
                            mimetype: "audio/mpeg",
                            ptt: false
                        }, { quoted: received });

                    } else {
                        // Use original video API for MP4
                        const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(video.url)}`;
                        const { data } = await axios.get(apiUrl);

                        if (!data?.status || !data?.result || !data.result.mp4) {
                            return await conn.sendMessage(sender, { text: "❌ Video download failed, please try again later." }, { quoted: received });
                        }

                        await conn.sendMessage(sender, {
                            video: { url: data.result.mp4 },
                            caption: `🎬 *${video.title}*\n\n> *Powered by JawadTechX*`
                        }, { quoted: received });
                    }

                    await conn.sendMessage(sender, { react: { text: '✅', key: received.key } });
                } else {
                    await conn.sendMessage(sender, {
                        text: `❌ *Invalid selection!*\nPlease reply with:\n1️⃣ for Audio (MP3)\n2️⃣ for Video (MP4)`
                    }, { quoted: received });
                }
            }
        });

    } catch (e) {
        console.error(e);
        await reply(`❌ Error: ${e.message}`);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
