const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: "apk",
    alias: ["app"],
    react: "📲",
    desc: "📥 Download APK directly",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply("❌ *Please provide an app name!*");

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const response = await fetch(`https://delirius-apiofc.vercel.app/download/apk?query=${encodeURIComponent(q)}`);
        const data = await response.json();

        if (!data.status || !data.data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App not found or API error.*");
        }

        const app = data.data;
        
        // Check size limit (150MB)
        const sizeInMB = app.sizeByte / (1024 * 1024);
        if (sizeInMB > 150) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App size is too large to download*");
        }

        // Create caption
        const caption = `📱 *${app.name}*\n\n` +
                       `🆔 Package: ${app.id}\n` +
                       `⭐ Rating: ${app.stats.rating.average} ⭐\n` +
                       `👨‍💻 Developer: ${app.developer}\n` +
                       `💾 Size: ${app.size}\n` +
                       `📅 Last Update: ${app.publish}\n\n` +
                       `*Powered By JawadTech*`;

        // Your GitHub repository link
        const githubRepo = "https://github.com/JawadYT36/KHAN-MD";

        // Send document with thumbnail and info
        await conn.sendMessage(from, {
            document: { 
                url: app.download 
            },
            fileName: `${app.name.replace(/\s+/g, '_')}.apk`,
            mimetype: "application/vnd.android.package-archive",
            caption: caption,
            thumbnail: app.image,
            contextInfo: {
                externalAdReply: {
                    title: app.name,
                    body: "KHAN MD APK DOWNLOADER 🚀",
                    mediaType: 1,
                    thumbnailUrl: app.image,
                    renderLargerThumbnail: true,
                    sourceUrl: githubRepo, // Your repo link
                    mediaUrl: githubRepo   // Your repo link
                },
                isForwarded: true,
                forwardingScore: 999
            }
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *Error fetching APK. Please try again.*");
    }
});
