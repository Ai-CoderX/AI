const config = require('../config');

// Initialize warnings globally
if (!global.warnings) global.warnings = {};
if (!global.lastWarningReset) global.lastWarningReset = Date.now();

// Reset warnings every 30 minutes
setInterval(() => {
    const userCount = Object.keys(global.warnings).length;
    if (userCount > 0) {
        global.warnings = {};
        if (global.warningTimestamps) global.warningTimestamps = {};
    }
    global.lastWarningReset = Date.now();
}, 30 * 60 * 1000);

const AntiLink = async (conn, mek, m, {
    from,
    body,
    isGroup,
    sender,
    isBotAdmins,
    isAdmins,
    reply
}) => {
    try {
        // Check if anti-link is enabled
        if (config.ANTI_LINK !== "true" && 
            config.ANTI_LINK !== "warn" && 
            config.ANTI_LINK !== "delete") return;

        if (!mek || !mek.message || mek.key.fromMe) return;
        if (!isGroup) return;
        
        // Skip if bot is not admin or sender is admin
        if (!isBotAdmins || isAdmins) return;
        
        // Clean body for URL detection
        let cleanBody = body.replace(/[\s\u200b-\u200d\uFEFF]/g, '').toLowerCase();
        
        // URL detection regex
        const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:com|org|net|co|pk|biz|id|info|xyz|online|site|website|tech|shop|store|blog|app|dev|io|ai|gov|edu|mil|me)(?:\/[^\s]*)?|whatsapp\.com\/channel\/|wa\.me\//gi;
        
        // Check if message contains links
        const containsLink = urlRegex.test(cleanBody);
        if (!containsLink) return;
        
        // Reset warnings every 30 minutes
        const THIRTY_MINUTES = 30 * 60 * 1000;
        if (Date.now() - global.lastWarningReset > THIRTY_MINUTES) {
            global.warnings = {};
            global.lastWarningReset = Date.now();
        }
        
        const userName = sender.split('@')[0];
        
        // Handle based on config mode
        if (config.ANTI_LINK === "true") {
            // Immediate removal mode
            await conn.sendMessage(from, { delete: mek.key });
            await conn.sendMessage(from, {
                text: `*⚠️ Links are not allowed in this group.*\n*@${userName} has been removed.*`
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
                    text: `*⚠️ @${userName}, this is your ${global.warnings[sender]} warning.*\n*Please avoid sharing links.*\n\n⚠️ *Note:* Warnings reset every 30 minutes`
                });
            } else {
                // Remove after 4th warning
                await conn.sendMessage(from, { delete: mek.key });
                await conn.sendMessage(from, {
                    text: `*🚨 @${userName} has been removed after exceeding warnings.*`
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
                text: `*⚠️ Links are not allowed in this group.*\n*Please @${userName} take note.*`
            });
        }
        
    } catch (error) {
        // Silent error handling
    }
};

module.exports = AntiLink;
