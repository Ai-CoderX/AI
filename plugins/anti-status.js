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
    
    // Initialize status warning timestamps if not exists
    if (!global.statusWarningTimestamps) {
      global.statusWarningTimestamps = {};
    }
    
    // Initialize lastResetTime for status warnings if not exists
    if (!global.lastStatusWarningReset) {
      global.lastStatusWarningReset = Date.now();
    }
    
    // Reset status warnings every 1 hour (60 * 60 * 1000 = 3,600,000 ms)
    const ONE_HOUR = 60 * 60 * 1000;
    
    // Clean old warnings (older than 1 hour)
    if (global.statusWarningTimestamps[sender]) {
      if (Date.now() - global.statusWarningTimestamps[sender] > ONE_HOUR) {
        delete global.statusWarnings[sender];
        delete global.statusWarningTimestamps[sender];
      }
    }

    // --- ANTI-STATUS MENTION HANDLER ---
    if (isGroup && !isAdmins && isBotAdmins) {
      // Check if the message contains a status mention
      const hasStatusMention = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.groupStatusMentionMessage ||
                              m?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.protocolMessage?.type === "STATUS_MENTION_MESSAGE";
      
      if (hasStatusMention) {
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
          // Warning system mode - REMOVE ON FIRST WARNING
          if (!global.statusWarnings[sender]) global.statusWarnings[sender] = 0;
          global.statusWarnings[sender] += 1;
          
          // Store the timestamp of this warning
          global.statusWarningTimestamps[sender] = Date.now();
          
          // Remove on first warning (since warnings reset after 1 hour)
          await conn.sendMessage(from, { delete: m.key });
          await conn.sendMessage(from, {
            text: `*🚨 @${sender.split('@')[0]} has been removed for mentioning a status.*\n*Note:* Status mentions are strictly prohibited.`
          });
          await conn.groupParticipantsUpdate(from, [sender], 'remove');
          
          // Reset this user's warnings after removal
          delete global.statusWarnings[sender];
          delete global.statusWarningTimestamps[sender];
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
    await conn.sendMessage(from, { text: "❌ An error occurred while processing status mention." });
  }
});

// Optional: Add a periodic cleanup function that runs every hour
// This removes old warnings even if no messages are processed
setInterval(() => {
  if (global.statusWarningTimestamps) {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    let cleanedCount = 0;
    
    // Clean warnings older than 1 hour
    for (const [userId, timestamp] of Object.entries(global.statusWarningTimestamps)) {
      if (now - timestamp > ONE_HOUR) {
        delete global.statusWarnings[userId];
        delete global.statusWarningTimestamps[userId];
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Periodic cleanup: Removed ${cleanedCount} old status warning(s)`);
    }
    
    global.lastStatusWarningReset = Date.now();
  }
}, 60 * 60 * 1000); // 1 hour
