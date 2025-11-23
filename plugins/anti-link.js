const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions');
const { writeFileSync } = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { setConfig, getConfig } = require("../lib/configdb");

cmd({
  pattern: "antilink",
  react: "🫟",
  alias: ["antilink"],
  desc: "Enable or disable anti-link feature in groups",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    // ⏳ React - processing
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
    
    // Small delay to ensure react is visible
    await sleep(500);

    // Check for creator permission
    if (!isCreator) {
      await reply('*📛 This is an owner command.*');
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    // Check for group
    if (!isGroup) {
      await reply('*This command can only be used in a group.*');
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      return;
    }

    // Enable or disable anti-link feature with different modes
    if (args[0] === "on") {
      config.ANTI_LINK = "true";
      await reply("✅ *Anti-link enabled!*\n\n*Mode:* 🚫 Delete & Kick\n*Description:* Links will be deleted and sender will be kicked immediately.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } 
    else if (args[0] === "off") {
      config.ANTI_LINK = "false";
      await reply("✅ *Anti-link disabled!*\n\n*Mode:* 🔓 Inactive\n*Description:* Link detection is turned off.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else if (args[0] === "warn") {
      config.ANTI_LINK = "warn";
      await reply("✅ *Anti-link enabled!*\n\n*Mode:* ⚠️ Warning System\n*Description:* Users get 3 warnings before being kicked.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else if (args[0] === "delete") {
      config.ANTI_LINK = "delete";
      await reply("✅ *Anti-link enabled!*\n\n*Mode:* 🗑️ Delete Only\n*Description:* Links will be deleted but users won't be kicked.");
      await sleep(1000);
      await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    }
    else {
      // Perfect WhatsApp-style invalid command message
      const helpMessage = `
🛡️ *ANTI-LINK SETTINGS*

Please select a valid option:

🟢 *ON* - Delete links & kick users immediately
🔴 *OFF* - Disable anti-link protection
🟡 *WARN* - Give 3 warnings then kick
🔵 *DELETE* - Delete links only (no kick)

*Usage Examples:*
• ${prefix}antilink on
• ${prefix}antilink warn  
• ${prefix}antilink delete
• ${prefix}antilink off

📝 *Note:* Only bot owner can use this command
      `.trim();
      
      await reply(helpMessage);
      await sleep(500);
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
  } catch (error) {
    await reply(`*❌ An error occurred while processing your request.*\n\n_Error:_ ${error.message}`);
    await sleep(500);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
  }
});

