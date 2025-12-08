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
    // --- ANTI-BOT HANDLER ---
    if (isGroup && isBotAdmins) {
      // Check if message is from a bot
      const isBot = m.id.startsWith('BAES') && m.id.length === 16;
      const isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
      
      if (isBot || isBaileys) {
        // Only proceed if anti-bot is enabled in config
        if (config.ANTI_BOT === "true") {
          // Direct kick without any message deletion or warnings
          await conn.groupParticipantsUpdate(from, [sender], 'remove');
          
          // Optional: Send a notification (without mentions/reply for speed)
          await conn.sendMessage(from, {
            text: `*🤖 Bot detected and removed.*\n*User ID:* ${sender.split('@')[0]}`
          });
          return;
        }
      }
    }
    
  } catch (error) {
    console.error("Anti-bot error:", error);
    // Don't send error message to avoid spamming
  }
});
