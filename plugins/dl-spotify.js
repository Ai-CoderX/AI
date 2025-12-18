const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "spotify",
    alias: ["spotifydl", "spotifymusic"],
    desc: "Download Spotify audio with thumbnail",
    category: "download",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🎧 *Please Give url or tital*");

        // Check if input is a URL or query
        const isUrl = q.includes('open.spotify.com');
        
        let apiUrl;
        if (isUrl) {
            // URL mode
            apiUrl = `https://api.deline.web.id/downloader/spotify?url=${encodeURIComponent(q)}`;
        } else {
            // Query mode
            apiUrl = `https://api.deline.web.id/downloader/spotifyplay?q=${encodeURIComponent(q)}`;
        }

        // Send initial processing message
        await reply("🔍 *Searching and processing... Please wait!*");

        const res = await axios.get(apiUrl, { timeout: 30000 });
        const json = res.data;

        if (!json?.status || !json?.result) {
            return await reply("❌ *Download failed!*\n\nPossible reasons:\n• Invalid Spotify URL\n• Song not found\n• API limit reached\n\nTry again with different keywords or URL.");
        }

        const result = json.result;
        
        // Extract data based on API response format
        let title, artist, duration, cover, audioUrl;
        
        if (isUrl) {
            // URL API response format
            title = result.title;
            artist = result.author;
            duration = result.duration;
            cover = result.thumbnail;
            audioUrl = result.medias?.[0]?.url;
        } else {
            // Query API response format
            title = result.metadata?.title;
            artist = result.metadata?.artist;
            duration = result.metadata?.duration;
            cover = result.metadata?.cover;
            audioUrl = result.dlink;
        }

        if (!audioUrl) {
            return await reply("❌ Could not retrieve audio URL. Please try a different song.");
        }

        // Send audio file with externalAdReply
        await conn.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${(title || 'spotify_song').replace(/[^a-z0-9]/gi, '_')}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: title || "Spotify Song",
                    body: `Artist: ${artist || 'Unknown'} | Duration: ${duration || 'Unknown'}`,
                    thumbnailUrl: cover, // Only use cover from API
                    mediaType: 1,
                    mediaUrl: '',
                    sourceUrl: '',
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .spotify command:", e);
        await reply("❌ Error occurred, please try again later!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
