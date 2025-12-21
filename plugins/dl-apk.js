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

        // ⏳ React - processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Fetch data from API using node-fetch
        const response = await fetch(`https://delirius-apiofc.vercel.app/download/apk?query=${encodeURIComponent(q)}`);
        const data = await response.json();

        if (!data.status || !data.data) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App not found or API error.*");
        }

        const app = data.data;
        
        // Extract size in MB from sizeByte and check limit
        const sizeInMB = app.sizeByte / (1024 * 1024);
        
        if (sizeInMB > 150) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App size is too large to download*");
        }
        
        // Format the caption
        const caption = `📱 *${app.name}*\n\n` +
                       `🆔 *Package:* ${app.id}\n` +
                       `⭐ *Rating:* ${app.stats.rating.average} ⭐\n` +
                       `👨‍💻 *Developer:* ${app.developer}\n` +
                       `💾 *Size:* ${app.size}\n` +
                       `📅 *Last Update:* ${app.publish}\n\n` +
                       `> *Powered By JawadTech*`;

        // Send APK as document with thumbnail and caption in one message
        await conn.sendMessage(from, {
            document: { url: app.download },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${app.name.replace(/[^\w\s]/gi, '_')}.apk`,
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: app.name,
                    body: "KHAN MD APK DOWNLOADER 🚀",
                    mediaType: 1, // 1 = Image
                    thumbnailUrl: app.image,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                },
                isForwarded: true,
                forwardingScore: 999
            }
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("APK Download Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the APK.*");
    }
});
