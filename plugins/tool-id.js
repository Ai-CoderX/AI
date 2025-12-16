// JawadTechXD 

const { cmd } = require('../command');

cmd({
    pattern: "id",
    alias: ["chatid", "jid", "gjid", "channelid", "newsletter", "cid"],  
    desc: "Get various IDs (chat, user, group, or channel)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, reply, sender, q
}) => {
    try {
        // Check if user is asking for channel ID
        if (q && q.includes('whatsapp.com/channel/')) {
            const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
            if (!match) return reply("⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx");

            const inviteId = match[1];
            let metadata;
            
            try {
                metadata = await conn.newsletterMetadata("invite", inviteId);
            } catch (e) {
                return reply("❌ Failed to fetch channel metadata. Make sure the link is correct.");
            }

            if (!metadata || !metadata.id) return reply("❌ Channel not found or inaccessible.");

            const infoText = `📡 *Channel Info*\n\n` +
                `🛠️ *ID:* ${metadata.id}\n` +
                `📌 *Name:* ${metadata.name || 'N/A'}\n` +
                `👥 *Followers:* ${metadata.subscribers?.toLocaleString() || "N/A"}\n` +
                `📅 *Created on:* ${metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString() : "Unknown"}`;

            if (metadata.preview) {
                return conn.sendMessage(from, {
                    image: { url: `https://pps.whatsapp.net${metadata.preview}` },
                    caption: infoText
                }, { quoted: m });
            } else {
                return reply(infoText);
            }
        }

        let response = "🆔 *ID INFORMATION*\n\n";
        
        if (isGroup) {
            // Get group JID
            const groupJID = from.includes('@g.us') ? from : `${from}@g.us`;
            response += `👥 *Group JID:*\n${groupJID}\n\n`;
            
            // Get sender information with @lid if available
            const senderJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
            response += `👤 *Sender JID:*\n${senderJID}\n\n`;
            
            // Check for @lid in the message key
            if (mek.key && mek.key.participant) {
                const lid = mek.key.participant;
                response += `🆔 *@lid:*\n${lid}\n`;
            }
            
        } else {
            // Private chat
            const userJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
            response += `👤 *Your JID:*\n${userJID}\n\n`;
            
            // Check for @lid in the message key
            if (mek.key && mek.key.participant) {
                const lid = mek.key.participant;
                response += `🆔 *@lid:*\n${lid}\n`;
            }
        }

        return reply(response);

    } catch (e) {
        console.error("ID Command Error:", e);
        return reply(`⚠️ Error fetching ID information:\n${e.message}`);
    }
});
