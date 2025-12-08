const { cmd } = require('../command');
const config = require("../config");

cmd({
  'on': "body"
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins,
  reply
}) => {
  try {
    // Initialize status warnings if not exists
    if (!global.statusWarnings) {
      global.statusWarnings = {};
    }
    
    // Initialize warning timestamps for status warnings
    if (!global.statusWarningTimestamps) {
      global.statusWarningTimestamps = {};
    }
    
    // Initialize lastResetTime for status warnings if not exists
    if (!global.lastStatusWarningReset) {
      global.lastStatusWarningReset = Date.now();
    }
    
    // Reset status warnings every 1 hour (60 * 60 * 1000 = 3,600,000 ms)
    const ONE_HOUR = 60 * 60 * 1000;
    if (Date.now() - global.lastStatusWarningReset > ONE_HOUR) {
      console.log('Resetting all status warnings after 1 hour...');
      global.statusWarnings = {};
      global.statusWarningTimestamps = {};
      global.lastStatusWarningReset = Date.now();
    }

    // --- ANTI-STATUS MENTION HANDLER ---
    if (isGroup && !isAdmins && isBotAdmins) {
      // Check if the message contains a status mention
      // Only check for groupStatusMentionMessage
      const hasStatusMention = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.groupStatusMentionMessage;
      
      if (hasStatusMention) {
        // Clean up old warnings (older than 1 hour) for this user
        if (global.statusWarningTimestamps[sender]) {
          if (Date.now() - global.statusWarningTimestamps[sender] > ONE_HOUR) {
            delete global.statusWarnings[sender];
            delete global.statusWarningTimestamps[sender];
          }
        }
        
        // Check anti-status mention mode from config
        if (config.ANTI_STATUS_MENTION === "true") {
          // Immediate removal mode
          await conn.sendMessage(from, { delete: m.key });
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
            global.statusWarningTimestamps[sender] = Date.now();
            
            await conn.sendMessage(from, { delete: m.key });
            await conn.sendMessage(from, {
              text: `*⚠️ @${sender.split('@')[0]}, status mentions are not allowed.*\n*This is your warning. Next time you will be removed.*\n\n⚠️ *Note:* Warnings reset after 1 hour`
            });
            
          } else {
            // Second offense - remove user
            await conn.sendMessage(from, { delete: m.key });
            await conn.sendMessage(from, {
              text: `*🚨 @${sender.split('@')[0]} has been removed for status mention.*`
            });
            await conn.groupParticipantsUpdate(from, [sender], 'remove');
            
            // Reset this user's warnings after removal
            delete global.statusWarnings[sender];
            delete global.statusWarningTimestamps[sender];
          }
          return;
          
        } else if (config.ANTI_STATUS_MENTION === "delete") {
          // Delete only mode
          await conn.sendMessage(from, { delete: m.key });
          await conn.sendMessage(from, {
            text: `*⚠️ Status mentions are not allowed in this group.*\n*Please @${sender.split('@')[0]} take note.*`
          });
          return;
        }
      }
    }
    
  } catch (error) {
    console.error("Anti-status mention error:", error);
    await conn.sendMessage(from, { text: "❌ An error occurred while processing the message." });
  }
});

// Optional: Add a periodic reset function that runs every 1 hour
// This ensures status warnings are cleared even if no messages are processed
setInterval(() => {
  if (global.statusWarnings) {
    const userCount = Object.keys(global.statusWarnings).length;
    if (userCount > 0) {
      console.log(`Periodic reset: Clearing status warnings for ${userCount} user(s)`);
      global.statusWarnings = {};
      if (global.statusWarningTimestamps) global.statusWarningTimestamps = {};
    }
    global.lastStatusWarningReset = Date.now();
  }
}, 60 * 60 * 1000); // 1 hour
