const { cmd } = require('../command');
const config = require("../config");

cmd({
  'on': "body"
}, async (conn, mek, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Dynamically import Baileys
    const baileys = await import('@whiskeysockets/baileys');
    const { getContentType } = baileys;
    
    // Initialize status warnings if not exists
    if (!global.statusWarnings) {
      global.statusWarnings = {};
    }
    
    // Initialize last reset time if not exists
    if (!global.lastStatusWarningReset) {
      global.lastStatusWarningReset = Date.now();
    }
    
    // COMPLETE RESET ALL WARNINGS EVERY 1 HOUR
    const ONE_HOUR = 60 * 60 * 1000; // 3,600,000 ms
    if (Date.now() - global.lastStatusWarningReset > ONE_HOUR) {
      console.log('🔄 Resetting ALL status warnings after 1 hour...');
      global.statusWarnings = {}; // Clear ALL warnings
      global.lastStatusWarningReset = Date.now();
    }

    // --- ANTI-STATUS MENTION HANDLER ---
    if (isGroup && !isAdmins && isBotAdmins) {
      // Get message content type directly from raw message
      const mtype = getContentType(mek.message);
      
      // Check if this is a status mention message
      const isStatusMention = (
        mtype === 'groupStatusMentionMessage' ||
        mtype === 'STATUS_MENTION_MESSAGE' ||
        (mek.message && mek.message.protocolMessage && mek.message.protocolMessage.type === 'STATUS_MENTION_MESSAGE') ||
        (mek.message && mek.message.groupStatusMentionMessage) ||
        (mek.message?.protocolMessage?.type === 25)
      );
      
      if (isStatusMention) {
        console.log(`✅ STATUS MENTION DETECTED: type=${mtype}, from=${sender.split('@')[0]}`);
        
        // Check anti-status mention mode from config
        if (config.ANTI_STATUS_MENTION === "true") {
          // Immediate removal mode
          await conn.sendMessage(from, { delete: mek.key });
          await conn.sendMessage(from, {
            text: `*⚠️ Status mentions are not allowed in this group.*\n*@${sender.split('@')[0]} has been removed.*`
          });
          await conn.groupParticipantsUpdate(from, [sender], 'remove');
          return;
          
        } else if (config.ANTI_STATUS_MENTION === "warn") {
          // Warning system mode - remove after 1 warning
          if (!global.statusWarnings[sender]) {
            // First warning
            global.statusWarnings[sender] = 1;
            
            await conn.sendMessage(from, { delete: mek.key });
            await conn.sendMessage(from, {
              text: `*⚠️ @${sender.split('@')[0]}, status mentions are not allowed.*\n*This is your warning. Next time you will be removed*`
            });
            
          } else {
            // Second offense - remove user
            await conn.sendMessage(from, { delete: mek.key });
            await conn.sendMessage(from, {
              text: `*🚨 @${sender.split('@')[0]} has been removed for status mention.*`
            });
            await conn.groupParticipantsUpdate(from, [sender], 'remove');
            
            // Remove this user's warning after removal
            delete global.statusWarnings[sender];
          }
          return;
          
        } else if (config.ANTI_STATUS_MENTION === "delete") {
          // Delete only mode
          await conn.sendMessage(from, { delete: mek.key });
          await conn.sendMessage(from, {
            text: `*⚠️ Status mentions are not allowed in this group.*\n*Please @${sender.split('@')[0]} take note.*`
          });
          return;
        }
      }
    }
    
  } catch (error) {
    console.error("Anti-status mention error:", error);
    try {
      await conn.sendMessage(from, { text: "❌ An error occurred while processing the message." });
    } catch (sendError) {
      console.error("Failed to send error message:", sendError);
    }
  }
});

// Periodic reset function that runs every 1 hour (as backup)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    if (global.statusWarnings && Object.keys(global.statusWarnings).length > 0) {
      console.log(`⏰ Periodic reset: Clearing ALL status warnings`);
      global.statusWarnings = {};
    }
    if (global.lastStatusWarningReset) global.lastStatusWarningReset = Date.now();
  }, 60 * 60 * 1000); // 1 hour
}
