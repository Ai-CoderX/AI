// Credits JawadTechX - KHAN-MD 💜
const config = require('../config');

// Initialize warnings globally
if (!global.warnings) global.warnings = {};
if (!global.lastWarningReset) global.lastWarningReset = Date.now();

// Reset warnings every 30 minutes (only if needed)
const resetWarnings = () => {
    const userCount = Object.keys(global.warnings).length;
    if (userCount > 0) {
        global.warnings = {};
        if (global.warningTimestamps) global.warningTimestamps = {};
    }
    global.lastWarningReset = Date.now();
};

// Start periodic reset
setInterval(resetWarnings, 30 * 60 * 1000);

const AntiLink = async (conn, messages) => {
    try {
        // Check if anti-link is enabled
        if (config.ANTI_LINK !== "true" && 
            config.ANTI_LINK !== "warn" && 
            config.ANTI_LINK !== "delete") return;

        const mek = messages.messages[0];
        if (!mek || !mek.message || mek.key.fromMe) return;

        const type = Object.keys(mek.message)[0];
        const from = mek.key.remoteJid;
        const sender = mek.key.participant || mek.key.remoteJid;
        
        // Skip if not a group
        if (!from.endsWith('@g.us')) return;
        
        // Get message body
        let body = '';
        if (type === 'conversation') {
            body = mek.message.conversation || '';
        } else if (type === 'extendedTextMessage') {
            body = mek.message.extendedTextMessage?.text || '';
        } else if (type === 'imageMessage') {
            body = mek.message.imageMessage?.caption || '';
        } else if (type === 'videoMessage') {
            body = mek.message.videoMessage?.caption || '';
        } else if (type === 'documentMessage') {
            body = mek.message.documentMessage?.caption || '';
        }
        
        // Clean body for URL detection
        let cleanBody = body.replace(/[\s\u200b-\u200d\uFEFF]/g, '').toLowerCase();
        
        // URL detection regex
        const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:com|org|net|co|pk|biz|id|info|xyz|online|site|website|tech|shop|store|blog|app|dev|io|ai|gov|edu|mil|me)(?:\/[^\s]*)?|whatsapp\.com\/channel\/|wa\.me\//gi;
        
        // Check if message contains links
        const containsLink = urlRegex.test(cleanBody);
        if (!containsLink) return;
        
        // Fetch group metadata (no cache)
        const groupMetadata = await conn.groupMetadata(from).catch(() => null);
        if (!groupMetadata) return;
        
        const participants = groupMetadata.participants || [];
        const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
        const isBotAdmins = groupAdmins.includes(conn.user.id);
        const isAdmins = groupAdmins.includes(sender);
        
        // Skip if bot is not admin or sender is admin
        if (!isBotAdmins || isAdmins) return;
        
        // Reset warnings every 30 minutes
        const THIRTY_MINUTES = 30 * 60 * 1000;
        if (Date.now() - global.lastWarningReset > THIRTY_MINUTES) {
            resetWarnings();
        }
        
        // Handle based on config mode
        if (config.ANTI_LINK === "true") {
            // Immediate removal mode
            await conn.sendMessage(from, { delete: mek.key });
            await conn.sendMessage(from, {
                text: `*⚠️ Links are not allowed in this group.*\n*@${sender.split('@')[0]} has been removed.*`,
                mentions: [sender]
            });
            await conn.groupParticipantsUpdate(from, [sender], 'remove');
            
        } else if (config.ANTI_LINK === "warn") {
            // Warning system mode
            if (!global.warnings[sender]) global.warnings[sender] = 0;
            global.warnings[sender] += 1;
            
            if (!global.warningTimestamps) global.warningTimestamps = {};
            global.warningTimestamps[sender] = Date.now();
            
            if (global.warnings[sender] <= 3) {
                // Warn user
                await conn.sendMessage(from, { delete: mek.key });
                await conn.sendMessage(from, {
                    text: `*⚠️ @${sender.split('@')[0]}, this is your ${global.warnings[sender]} warning.*\n*Please avoid sharing links.*\n\n⚠️ *Note:* Warnings reset every 30 minutes`,
                    mentions: [sender]
                });
            } else {
                // Remove after 4th warning
                await conn.sendMessage(from, { delete: mek.key });
                await conn.sendMessage(from, {
                    text: `*🚨 @${sender.split('@')[0]} has been removed after exceeding warnings.*`,
                    mentions: [sender]
                });
                await conn.groupParticipantsUpdate(from, [sender], 'remove');
                
                // Reset this user's warnings
                delete global.warnings[sender];
                if (global.warningTimestamps) delete global.warningTimestamps[sender];
            }
            
        } else if (config.ANTI_LINK === "delete") {
            // Delete only mode
            await conn.sendMessage(from, { delete: mek.key });
            await conn.sendMessage(from, {
                text: `*⚠️ Links are not allowed in this group.*\n*Please @${sender.split('@')[0]} take note.*`,
                mentions: [sender]
            });
        }
        
    } catch (error) {
        // Silent error handling
    }
};

module.exports = AntiLink;
