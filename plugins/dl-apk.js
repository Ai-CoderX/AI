const { cmd } = require('../command');
const axios = require('axios');

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

        const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/apk?id=${encodeURIComponent(q)}`);

        if (!data.status || !data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App not found or API error.*");
        }

        const app = data.result;
        
        // Send info message with thumbnail
        const infoMsg = await conn.sendMessage(from, {
            image: { url: app.image },
            caption: `📱 *${app.name}*\n\n📦 Package: ${app.package}\n📅 Last Update: ${app.lastUpdate}\n💾 Size: ${app.size}\n\n_Powered by KHAN-MD-BOT_`
        }, { quoted: mek });

        // Send APK file as reply to the info message
        await conn.sendMessage(from, {
            document: { url: app.dl_link },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${app.name}.apk`
        }, { quoted: mek });

        // ✅ React - success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the APK.*");
    }
});
