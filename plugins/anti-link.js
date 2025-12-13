const { cmd } = require('../command');
const config = require("../config");

cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  botNumber2,
  botNumber,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Get the original message object
    const mek = m.mek || m;
    
    // CRITICAL CHECKS: Ignore messages from certain sources
    // 1. Ignore if message is from the bot itself (fromMe)
    if (mek.key.fromMe) {
      return; // Ignore messages sent by the bot
    }
    
    // 2. Check if sender is botNumber2 (same as isAdmins check)
    if (sender === botNumber2) {
      return; // Ignore messages from the bot
    }
    
    // 3. Ignore if sender is an admin
    if (isAdmins) {
      return; // Admins can post links
    }
    
    // Initialize warnings if not exists
    if (!global.warnings) {
      global.warnings = {};
    }
    
    // Initialize lastResetTime if not exists
    if (!global.lastWarningReset) {
      global.lastWarningReset = Date.now();
    }
    
    // Reset warnings every 30 minutes (30 * 60 * 1000 = 1,800,000 ms)
    const THIRTY_MINUTES = 30 * 60 * 1000;
    if (Date.now() - global.lastWarningReset > THIRTY_MINUTES) {
      console.log('Resetting all warnings after 30 minutes...');
      global.warnings = {};
      global.lastWarningReset = Date.now();
    }

    // --- ANTI-LINK HANDLER ---
    // Only proceed if: it's a group, bot is admin, and sender is NOT admin
    if (isGroup && isBotAdmins) {
      // Clean the body for better detection
      let cleanBody = body.replace(/[\s\u200b-\u200d\uFEFF]/g, '').toLowerCase();
      
      // Custom domains to block - only detect actual URLs including WhatsApp
      const urlRegex = /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.(?:com|org|net|co|pk|biz|id|info|xyz|online|site|website|tech|shop|store|blog|app|dev|io|ai|gov|edu|mil|me)(?:\/[^\s]*)?|whatsapp\.com\/channel\/|wa\.me\//gi;
      
      // Check if message contains any forbidden links
      const containsLink = urlRegex.test(cleanBody);
      
      if (containsLink) {
        // Check anti-link mode from config
        if (config.ANTI_LINK === "true") {
          // Immediate removal mode
          await conn.sendMessage(from, { delete: mek.key });
          await conn.sendMessage(from, {
            text: `*⚠️ Links are not allowed in this group.*\n*@${sender.split('@')[0]} has been removed.*`,
            mentions: [sender]
          });
          await conn.groupParticipantsUpdate(from, [sender], 'remove');
          return;
          
        } else if (config.ANTI_LINK === "warn") {
          // Warning system mode
          if (!global.warnings[sender]) global.warnings[sender] = 0;
          global.warnings[sender] += 1;
          
          // Store the timestamp of this warning
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
            
            // Reset this user's warnings after removal
            delete global.warnings[sender];
            if (global.warningTimestamps) delete global.warningTimestamps[sender];
          }
          return;
          
        } else if (config.ANTI_LINK === "delete") {
          // Delete only mode
          await conn.sendMessage(from, { delete: mek.key });
          await conn.sendMessage(from, {
            text: `*⚠️ Links are not allowed in this group.*\n*Please @${sender.split('@')[0]} take note.*`,
            mentions: [sender]
          });
          return;
        }
      }
    }
    
    // If bot is not admin or sender is admin - DO NOTHING
    // The checks above already handle this with early returns
    
  } catch (error) {
    console.error("Anti-link error:", error);
    // Don't use reply() to avoid quoting
    try {
      await conn.sendMessage(from, { text: "❌ An error occurred while processing the message." });
    } catch (e) {
      console.error("Failed to send error message:", e);
    }
  }
});

// Optional: Add a periodic reset function that runs every 30 minutes
// This ensures warnings are cleared even if no messages are processed
setInterval(() => {
  if (global.warnings) {
    const userCount = Object.keys(global.warnings).length;
    if (userCount > 0) {
      console.log(`Periodic reset: Clearing warnings for ${userCount} user(s)`);
      global.warnings = {};
      if (global.warningTimestamps) global.warningTimestamps = {};
    }
    global.lastWarningReset = Date.now();
  }
}, 30 * 60 * 1000); // 30 minutes
