const { cmd } = require('../command');
const { lidToPhone, cleanPN } = require('../lib/fixlid'); 

cmd({
    pattern: "id",
    alias: ["chatid", "jid", "gjid", "channelid", "newsletter", "cid"],  
    desc: "Get various IDs (chat, user, group, or channel)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, reply, sender, fromMe
}) => {
    try {
        // Check if user is asking for channel ID
        if (m.text && m.text.includes('whatsapp.com/channel/')) {
            const match = m.text.match(/whatsapp\.com\/channel\/([\w-]+)/);
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
            
            // Get sender information
            const senderJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
            response += `👤 *Sender JID:*\n${senderJID}\n\n`;
            
            // Check for @lid in the message key
            if (mek.key && mek.key.participant) {
                const lid = mek.key.participant;
                response += `🆔 *@lid:*\n${lid}\n`;
            }
            
        } else {
            // Private chat
            
            if (fromMe) {
                // If message is from bot (owner using command)
                response += `🤖 *Bot Information*\n\n`;
                
                // Get conn.user.id (bot's JID)
                if (conn.user && conn.user.id) {
                    const botJid = conn.user.id;
                    
                    // Check if botJid contains @lid
                    if (botJid.includes('@lid')) {
                        try {
                            // Convert lid to phone number
                            const lid = botJid.split('@')[0];
                            const phoneNumber = await lidToPhone(conn, lid);
                            response += `📱 *Bot Phone:*\n${phoneNumber}@s.whatsapp.net\n`;
                            response += `🆔 *Bot Lid:*\n${botJid}\n\n`;
                        } catch (e) {
                            response += `📱 *Bot JID:*\n${botJid}\n\n`;
                        }
                    } else {
                        response += `📱 *Bot JID:*\n${botJid}\n\n`;
                    }
                }
                
                // Get conn.user.lid (bot's lid)
                if (conn.user && conn.user.lid) {
                    const botLid = conn.user.lid;
                    response += `🆔 *Bot Lid:*\n${botLid}\n`;
                    
                    // Convert bot lid to phone number
                    try {
                        const lidNumber = botLid.split('@')[0];
                        const phoneNumber = await lidToPhone(conn, lidNumber);
                        if (phoneNumber !== lidNumber) {
                            response += `📱 *Lid to Phone:*\n${phoneNumber}@s.whatsapp.net\n`;
                        }
                    } catch (e) {
                        // Ignore conversion errors
                    }
                }
                
            } else {
                // If someone else is using the command
                
                // Check if sender contains @lid
                if (sender.includes('@lid')) {
                    try {
                        // Convert lid to phone number
                        const lid = sender.split('@')[0];
                        const phoneNumber = await lidToPhone(conn, lid);
                        
                        response += `👤 *Your Information*\n\n`;
                        response += `📱 *Your Phone:*\n${phoneNumber}@s.whatsapp.net\n`;
                        response += `🆔 *Your Lid:*\n${sender}\n\n`;
                    } catch (e) {
                        response += `👤 *Your JID:*\n${sender}\n\n`;
                    }
                } else {
                    // Regular sender (no lid)
                    const userJID = sender.includes('@s.whatsapp.net') ? sender : `${sender}@s.whatsapp.net`;
                    response += `👤 *Your JID:*\n${userJID}\n\n`;
                }
                
                // Check for @lid in the message key (if available)
                if (mek.key && mek.key.participant && mek.key.participant.trim() !== '') {
                    const lid = mek.key.participant;
                    response += `🆔 *@lid:*\n${lid}\n`;
                }
            }
            
            // Also check contextInfo for participant (from your example)
            if (mek.message && mek.message.extendedTextMessage && 
                mek.message.extendedTextMessage.contextInfo && 
                mek.message.extendedTextMessage.contextInfo.participant) {
                const contextLid = mek.message.extendedTextMessage.contextInfo.participant;
                if (!response.includes(contextLid)) {
                    response += `📨 *Context Lid:*\n${contextLid}\n`;
                }
            }
        }

        return reply(response);

    } catch (e) {
        console.error("ID Command Error:", e);
        return reply(`⚠️ Error fetching ID information:\n${e.message}`);
    }
});
