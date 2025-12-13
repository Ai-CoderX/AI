// Jawad Tech On Top 🔝 
const { setPrefix } = require('../lib/prefix');
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

// Placeholder for soft reload function (implement based on your bot's needs)
async function reloadConfig() {
  // Reinitialize command listeners, event handlers, or other components if needed
  // Example: Reload command parser with new prefix or reapply config changes
  console.log("Configuration reloaded without restart.");
}

// SET BOT IMAGE
cmd({
  pattern: "setbotimage",
  alias: ["botdp", "botpic", "botimage"],
  desc: "Set the bot's image URL",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  try {
    if (!isCreator) return reply("❗ Only the bot owner can use this command.");

    let imageUrl = args[0];

    // Upload image if replying to one
    if (!imageUrl && m.quoted) {
      const quotedMsg = m.quoted;
      const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
      if (!mimeType.startsWith("image")) return reply("❌ Please reply to an image.");

      const mediaBuffer = await quotedMsg.download();
      const extension = mimeType.includes("jpeg") ? ".jpg" : ".png";
      const tempFilePath = path.join(os.tmpdir(), `botimg_${Date.now()}${extension}`);
      fs.writeFileSync(tempFilePath, mediaBuffer);

      const form = new FormData();
      form.append("fileToUpload", fs.createReadStream(tempFilePath), `botimage${extension}`);
      form.append("reqtype", "fileupload");

      const response = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
      });

      fs.unlinkSync(tempFilePath);

      if (typeof response.data !== 'string' || !response.data.startsWith('https://')) {
        throw new Error(`Catbox upload failed: ${response.data}`);
      }

      imageUrl = response.data;
    }

    if (!imageUrl || !imageUrl.startsWith("http")) {
      return reply("❌ Provide a valid image URL or reply to an image.");
    }

    // Update config
    config.MENU_IMAGE_URL = imageUrl;
    process.env.MENU_IMAGE_URL = imageUrl;

    await reply(`✅ Bot image updated.\n\n*New URL:* ${imageUrl}`);
  } catch (err) {
    console.error(err);
    reply(`❌ Error: ${err.message || err}`);
  }
});

// SET BOT NAME
cmd({
  pattern: "setbotname",
  alias: ["botname"],
  desc: "Set the bot's name",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");
  const newName = args.join(" ").trim();
  if (!newName) return reply("❌ Provide a bot name.");

  // Update config
  config.BOT_NAME = newName;
  process.env.BOT_NAME = newName;

  await reply(`✅ Bot name updated to: *${newName}*`);
});

// SET OWNER NAME
cmd({
  pattern: "setownername",
  alias: ["ownername"],
  desc: "Set the owner's name",
  category: "owner",
  react: "✅",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");
  const name = args.join(" ").trim();
  if (!name) return reply("❌ Provide an owner name.");

  // Update config
  config.OWNER_NAME = name;
  process.env.OWNER_NAME = name;

  await reply(`✅ Owner name updated to: *${name}*`);
});

// WELCOME
cmd({
  pattern: "welcome",
  alias: ["setwelcome"],
  react: "✅",
  desc: "Enable or disable welcome messages for new members",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.WELCOME = "true";
    process.env.WELCOME = "true";
    return reply("✅ Welcome messages are now enabled.");
  } else if (status === "off") {
    config.WELCOME = "false";
    process.env.WELCOME = "false";
    return reply("❌ Welcome messages are now disabled.");
  } else {
    return reply(`Example: .welcome on`);
  }
});

// ===== ANTI EDIT =====
cmd({
  pattern: "antiedit",
  alias: ["edit", "anti-edit", "antied"],
  react: "✏️",
  desc: "Enable/Disable anti-edit feature to show edited messages",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  
  if (status === "on") {
    config.ANTI_EDIT = "true";
    process.env.ANTI_EDIT = "true";
    return reply("✏️ *Anti-edit is now ENABLED for both inbox and groups*");
  } else if (status === "off") {
    config.ANTI_EDIT = "false";
    process.env.ANTI_EDIT = "false";
    return reply("✏️ *Anti-edit is now DISABLED*");
  } else {
    return reply(`*✏️ Anti-edit Command*\n\n• *on* - Enable for both inbox and groups\n• *off* - Disable completely\n\n*Example:* .antiedit on`);
  }
});


// ===== ANTI DELETE =====
cmd({
  pattern: "antidelete",
  alias: ["ad", "anti-delete", "antidel"],
  react: "🗑️",
  desc: "Enable/Disable anti-delete feature to show deleted messages",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  
  if (status === "on") {
    config.ANTI_DELETE = "true";
    process.env.ANTI_DELETE = "true";
    return reply("🗑️ *Anti-delete is now ENABLED for both inbox and groups*");
  } else if (status === "off") {
    config.ANTI_DELETE = "false";
    process.env.ANTI_DELETE = "false";
    return reply("🗑️ *Anti-delete is now DISABLED*");
  } else {
    return reply(`*🗑️ Anti-delete Command*\n\n• *on* - Enable for both inbox and groups\n• *off* - Disable completely\n\n*Example:* .antidelete on`);
  }
});

cmd({
    pattern: "autodl",
    alias: ["downloader", "auto-downloader"],
    react: "📥",
    desc: "Enable/disable auto-downloader feature",
    category: "settings",
    filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    const status = args[0]?.toLowerCase();
    
    if (status === "on") {
        config.AUTO_DOWNLOADER = "true";
        process.env.AUTO_DOWNLOADER = "true";
        return reply("📥 *Auto-downloader is now ENABLED for both inbox and groups*");
    } else if (status === "ib") {
        config.AUTO_DOWNLOADER = "inbox";
        process.env.AUTO_DOWNLOADER = "inbox";
        return reply("📥 *Auto-downloader is now ENABLED for inbox only*");
    } else if (status === "gc") {
        config.AUTO_DOWNLOADER = "group";
        process.env.AUTO_DOWNLOADER = "group";
        return reply("📥 *Auto-downloader is now ENABLED for groups only*");
    } else if (status === "owner") {
        config.AUTO_DOWNLOADER = "owner";
        process.env.AUTO_DOWNLOADER = "owner";
        return reply("📥 *Auto-downloader is now ENABLED for owner only*");
    } else if (status === "off") {
        config.AUTO_DOWNLOADER = "false";
        process.env.AUTO_DOWNLOADER = "false";
        return reply("📥 *Auto-downloader is now DISABLED*");
    } else {
        return reply(`*📥 Auto-downloader Command*\n\n• *on* - Enable for both\n• *ib* - Enable for inbox only\n• *gc* - Enable for groups only\n• *owner* - Enable for owner only\n• *off* - Disable\n\n*Example:* .autodownloader on`);
    }
});

// MODE
cmd({
  pattern: "mode",
  alias: ["setmode", "mod"],
  react: "✅",
  desc: "Set bot mode to private or public.",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 Only the owner can use this command!*");

  const currentMode = config.MODE || process.env.MODE || "public";

  if (!args[0]) {
    return reply(`📌 Current mode: *${currentMode}*\n\nUsage: .mode private OR .mode public`);
  }

  const modeArg = args[0].toLowerCase();

  if (["private", "public"].includes(modeArg)) {
    config.MODE = modeArg;
    process.env.MODE = modeArg;
    await reply(`✅ Bot mode is now set to *${modeArg.toUpperCase()}*.`);
    await reloadConfig(); // Soft reload for command listeners if needed
  } else {
    return reply("❌ Invalid mode. Please use `.mode private` or `.mode public`.");
  }
});

// ANTI-CALL
cmd({
  pattern: "anti-call",
  react: "🫟",
  alias: ["anticall"],
  desc: "Enable or disable anti-call feature",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*🫟σɴℓу тнє σωɴєʀ ¢αɴ ᴜѕє тнιѕ ¢σммαɴ∂!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.ANTI_CALL = "true";
    process.env.ANTI_CALL = "true";
    return reply("*✅ αɴтι-¢αℓℓ нαѕ вєєɴ єɴαвℓє∂*");
  } else if (status === "off") {
    config.ANTI_CALL = "false";
    process.env.ANTI_CALL = "false";
    return reply("*❌ αɴтι-¢αℓℓ нαѕ вєєɴ ∂ιѕαвℓє∂*");
  } else {
    return reply(`*🏷️ єχαмρℓє: αɴтι-¢αℓℓ σɴ/σff*`);
  }
});




// ANTI-STATUS-MENTION
cmd({
  pattern: "antistatus",
  react: "🚫",
  alias: ["anti-status", "anti-status-mention"],
  desc: "Enable or disable anti-status-mention feature in groups\nModes: on/off/warn/delete",
  category: "group",
  filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    if (args[0] === "on") {
      config.ANTI_STATUS_MENTION = "true";
      process.env.ANTI_STATUS_MENTION = "true";
      await reply("🚫 *Anti-status-mention feature is now ENABLED*\n\nStatus mentions will be automatically deleted.");
    } else if (args[0] === "off") {
      config.ANTI_STATUS_MENTION = "false";
      process.env.ANTI_STATUS_MENTION = "false";
      await reply("🚫 *Anti-status-mention feature is now DISABLED*\n\nStatus mentions will be allowed.");
    } else if (args[0] === "warn") {
      config.ANTI_STATUS_MENTION = "warn";
      process.env.ANTI_STATUS_MENTION = "warn";
      await reply("⚠️ *Anti-status-mention feature is set to WARN mode*\n\nUsers will be warned when sending status mentions.");
    } else if (args[0] === "delete") {
      config.ANTI_STATUS_MENTION = "delete";
      process.env.ANTI_STATUS_MENTION = "delete";
      await reply("🗑️ *Anti-status-mention feature is set to DELETE mode*\n\nStatus mentions will be automatically deleted.");
    } else {
      await reply(`*Invalid input! Use one of the following modes:*\n\n• *on* - Enable anti-status-mention (delete mentions)\n• *off* - Disable anti-status-mention\n• *warn* - Warn users when sending status mentions\n• *delete* - Delete status mentions automatically\n\n*Example:* .antistatus warn`);
    }
  } catch (error) {
    return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${error.message}`);
  }
});

// AUTO STATUS REACT
cmd({
  pattern: "autostatusreact",
  alias: ["status-react", "statusreact", "sreact"],
  react: "🫟",
  desc: "Enable or disable auto-reacting to statuses",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.AUTO_STATUS_REACT = "true";
    process.env.AUTO_STATUS_REACT = "true";
    return reply("Autoreact of statuses is now enabled.");
  } else if (status === "off") {
    config.AUTO_STATUS_REACT = "false";
    process.env.AUTO_STATUS_REACT = "false";
    return reply("Autoreact of statuses is now disabled.");
  } else {
    return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .autostatusreact on*`);
  }
});

// AUTO STATUS VIEW
cmd({
  pattern: "autostatusview",
  alias: ["status-view", "sview", "statusview"],
  desc: "Enable or disable auto-viewing of statuses",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.AUTO_STATUS_SEEN = "true";
    process.env.AUTO_STATUS_SEEN = "true";
    return reply("Autoview of statuses is now enabled.");
  } else if (status === "off") {
    config.AUTO_STATUS_SEEN = "false";
    process.env.AUTO_STATUS_SEEN = "false";
    return reply("Autoview of statuses is now disabled.");
  } else {
    return reply(`Example: .autostatusview on`);
  }
});

// READ MESSAGE
cmd({
  pattern: "read-message",
  alias: ["autoread"],
  desc: "Enable or disable read message feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.READ_MESSAGE = "true";
    process.env.READ_MESSAGE = "true";
    return reply("Read message feature is now enabled.");
  } else if (status === "off") {
    config.READ_MESSAGE = "false";
    process.env.READ_MESSAGE = "false";
    return reply("Read message feature is now disabled.");
  } else {
    return reply(`_example:  .read-message on_`);
  }
});

// ANTI-BAD
cmd({
  pattern: "antibad",
  alias: ["anti-bad", "antibadword"],
  react: "🫟",
  desc: "Enable or disable anti-bad word feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.ANTI_BAD_WORD = "true";
    process.env.ANTI_BAD_WORD = "true";
    return reply("*Anti bad word is now enabled.*");
  } else if (status === "off") {
    config.ANTI_BAD_WORD = "false";
    process.env.ANTI_BAD_WORD = "false";
    return reply("*Anti bad word feature is now disabled*");
  } else {
    return reply(`_example:  .antibad on_`);
  }
});

// AUTO-STICKER
cmd({
  pattern: "autosticker",
  alias: ["auto-sticker"],
  react: "🫟",
  desc: "Enable or disable auto-sticker feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.AUTO_STICKER = "true";
    process.env.AUTO_STICKER = "true";
    return reply("Auto-sticker feature is now enabled.");
  } else if (status === "off") {
    config.AUTO_STICKER = "false";
    process.env.AUTO_STICKER = "false";
    return reply("Auto-sticker feature is now disabled.");
  } else {
    return reply(`_example:  .autosticker on_`);
  }
});

// AUTO-REPLY
cmd({
  pattern: "autoreply",
  alias: ["auto-reply"],
  react: "🫟",
  desc: "Enable or disable auto-reply feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.AUTO_REPLY = "true";
    process.env.AUTO_REPLY = "true";
    return reply("*Auto-reply is now enabled.*");
  } else if (status === "off") {
    config.AUTO_REPLY = "false";
    process.env.AUTO_REPLY = "false";
    return reply("Auto-reply feature is now disabled.");
  } else {
    return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ: . ᴀᴜᴛᴏʀᴇᴘʟʏ ᴏɴ*`);
  }
});

// AUTO-REACT
cmd({
  pattern: "autoreact",
  alias: ["auto-react"],
  react: "🫟",
  desc: "Enable or disable the autoreact feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.AUTO_REACT = "true";
    process.env.AUTO_REACT = "true";
    await reply("Autoreact feature is now enabled.");
  } else if (status === "off") {
    config.AUTO_REACT = "false";
    process.env.AUTO_REACT = "false";
    await reply("Autoreact feature is now disabled.");
  } else {
    await reply(`*🔥 ᴇxᴀᴍᴘʟᴇ: .ᴀᴜᴛᴏʀᴇᴀᴄᴛ ᴏɴ*`);
  }
});

// AUTO STATUS REPLY
cmd({
  pattern: "autostatusreply",
  react: "🫟",
  alias: ["statusreply", "status-reply"],
  desc: "Enable or disable status-reply feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.AUTO_STATUS_REPLY = "true";
    process.env.AUTO_STATUS_REPLY = "true";
    return reply("Status-reply feature is now enabled.");
  } else if (status === "off") {
    config.AUTO_STATUS_REPLY = "false";
    process.env.AUTO_STATUS_REPLY = "false";
    return reply("Status-reply feature is now disabled.");
  } else {
    return reply(`*🫟 ᴇxᴀᴍᴘʟᴇ:  .sᴛᴀᴛᴜsʀᴇᴘʟʏ ᴏɴ*`);
  }
});

// ANTI-BOT
cmd({
  pattern: "antibot",
  react: "🫟",
  alias: ["anti-bot"],
  desc: "Enable or disable anti-bot feature in groups",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    if (args[0] === "on") {
      config.ANTI_BOT = "true";
      process.env.ANTI_BOT = "true";
      await reply("ANTI_BOT feature is now enabled in this group.");
    } else if (args[0] === "off") {
      config.ANTI_BOT = "false";
      process.env.ANTI_BOT = "false";
      await reply("ANTI_BOT feature is now disabled in this group.");
    } else {
      await reply(`*Invalid input! Use either 'on' or 'off'. Example: .antibot on*`);
    }
  } catch (error) {
    return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${error.message}`);
  }
});

// ANTI-LINK
cmd({
  pattern: "antilink",
  react: "🫟",
  alias: ["anti-link"],
  desc: "Enable or disable anti-link feature in groups\nModes: on/off/warn/delete",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  try {
    if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

    if (args[0] === "on") {
      config.ANTI_LINK = "true";
      process.env.ANTI_LINK = "true";
      await reply("🔗 *Anti-link feature is now ENABLED*\n\nLinks will be automatically deleted.");
    } else if (args[0] === "off") {
      config.ANTI_LINK = "false";
      process.env.ANTI_LINK = "false";
      await reply("🔗 *Anti-link feature is now DISABLED*\n\nLinks will be allowed.");
    } else if (args[0] === "warn") {
      config.ANTI_LINK = "warn";
      process.env.ANTI_LINK = "warn";
      await reply("⚠️ *Anti-link feature is set to WARN mode*\n\nUsers will be warned when sending links.");
    } else if (args[0] === "delete") {
      config.ANTI_LINK = "delete";
      process.env.ANTI_LINK = "delete";
      await reply("🗑️ *Anti-link feature is set to DELETE mode*\n\nLinks will be automatically deleted.");
    } else {
      await reply(`*Invalid input! Use one of the following modes:*\n\n• *on* - Enable anti-link (delete links)\n• *off* - Disable anti-link\n• *warn* - Warn users when sending links\n• *delete* - Delete links automatically\n\n*Example:* .antilink warn`);
    }
  } catch (error) {
    return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${error.message}`);
  }
});

// MENTION REPLY
cmd({
  pattern: "mention-reply",
  alias: ["mentionreply", "mee"],
  desc: "Enable or disable mention reply feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.MENTION_REPLY = "true";
    process.env.MENTION_REPLY = "true";
    return reply("Mention Reply feature is now enabled.");
  } else if (status === "off") {
    config.MENTION_REPLY = "false";
    process.env.MENTION_REPLY = "false";
    return reply("Mention Reply feature is now disabled.");
  } else {
    return reply(`_example:  .mee on_`);
  }
});

// ADMIN EVENTS
cmd({
  pattern: "admin-events",
  alias: ["adminevents", "adminaction"],
  desc: "Enable or disable admin event notifications",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.ADMIN_ACTION = "true";
    process.env.ADMIN_ACTION = "true";
    return reply("✅ Admin event notifications are now enabled.");
  } else if (status === "off") {
    config.ADMIN_ACTION = "false";
    process.env.ADMIN_ACTION = "false";
    return reply("❌ Admin event notifications are now disabled.");
  } else {
    return reply(`Example: .admin-events on`);
  }
});

// OWNER REACT
cmd({
  pattern: "ownerreact",
  alias: ["owner-react", "selfreact", "self-react"],
  react: "👑",
  desc: "Enable or disable the owner react feature",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.OWNER_REACT = "true";
    process.env.OWNER_REACT = "true";
    await reply("Owner react feature is now enabled.");
  } else if (status === "off") {
    config.OWNER_REACT = "false";
    process.env.OWNER_REACT = "false";
    await reply("Owner react feature is now disabled.");
  } else {
    await reply(`*🔥 ᴇxᴀᴍᴘʟᴇ: .ᴏᴡɴᴇʀʀᴇᴀᴄᴛ ᴏɴ*`);
  }
});


// ===== AUTO-TYPING =====
cmd({
  pattern: "autotyping",
  alias: ["auto-typing", "typing"],
  react: "⌨️",
  desc: "Enable auto-typing presence for the bot",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  
  if (status === "on") {
    config.AUTO_TYPING = "true";
    process.env.AUTO_TYPING = "true";
    return reply("⌨️ *Auto-typing is now ENABLED for both inbox and groups*");
  } else if (status === "ib") {
    config.AUTO_TYPING = "ib";
    process.env.AUTO_TYPING = "ib";
    return reply("⌨️ *Auto-typing is now ENABLED for inbox only*");
  } else if (status === "gc") {
    config.AUTO_TYPING = "group";
    process.env.AUTO_TYPING = "group";
    return reply("⌨️ *Auto-typing is now ENABLED for groups only*");
  } else if (status === "off") {
    config.AUTO_TYPING = "false";
    process.env.AUTO_TYPING = "false";
    return reply("⌨️ *Auto-typing is now DISABLED*");
  } else {
    return reply(`*⌨️ Auto-typing Command*\n\n• *on* - Enable for both\n• *ib* - Enable for inbox only\n• *gc* - Enable for groups only\n• *off* - Disable\n\n*Example:* .autotyping on`);
  }
});

// ===== ALWAYS ONLINE =====
cmd({
  pattern: "alwaysonline",
  alias: ["online", "always-online"],
  react: "🟢",
  desc: "Enable always online presence for the bot",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  
  if (status === "on") {
    config.ALWAYS_ONLINE = "true";
    process.env.ALWAYS_ONLINE = "true";
    return reply("🟢 *Always online is now ENABLED*");
  } else if (status === "off") {
    config.ALWAYS_ONLINE = "false";
    process.env.ALWAYS_ONLINE = "false";
    return reply("🟢 *Always online is now DISABLED*");
  } else {
    return reply(`*🟢 Always Online Command*\n\n• *on* - Enable\n• *off* - Disable\n\n*Example:* .alwaysonline on`);
  }
});

// ===== AUTO RECORDING =====
cmd({
  pattern: "autorecording",
  alias: ["recording", "auto-recording"],
  react: "🎙️",
  desc: "Enable auto-recording presence for the bot",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  
  if (status === "on") {
    config.AUTO_RECORDING = "true";
    process.env.AUTO_RECORDING = "true";
    return reply("🎙️ *Auto-recording is now ENABLED for both inbox and groups*");
  } else if (status === "ib") {
    config.AUTO_RECORDING = "ib";
    process.env.AUTO_RECORDING = "ib";
    return reply("🎙️ *Auto-recording is now ENABLED for inbox only*");
  } else if (status === "gc") {
    config.AUTO_RECORDING = "group";
    process.env.AUTO_RECORDING = "group";
    return reply("🎙️ *Auto-recording is now ENABLED for groups only*");
  } else if (status === "off") {
    config.AUTO_RECORDING = "false";
    process.env.AUTO_RECORDING = "false";
    return reply("🎙️ *Auto-recording is now DISABLED*");
  } else {
    return reply(`*🎙️ Auto-recording Command*\n\n• *on* - Enable for both\n• *ib* - Enable for inbox only\n• *gc* - Enable for groups only\n• *off* - Disable\n\n*Example:* .autorecording on`);
  }
});

// ===== ANTI EDIT =====
cmd({
  pattern: "antiedit",
  alias: ["edit", "anti-edit", "antied"],
  react: "✏️",
  desc: "Enable anti-edit feature to show edited messages",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  
  if (status === "on") {
    config.ANTI_EDIT = "true";
    process.env.ANTI_EDIT = "true";
    return reply("✏️ *Anti-edit is now ENABLED for both inbox and groups*");
  } else if (status === "ib") {
    config.ANTI_EDIT = "ib";
    process.env.ANTI_EDIT = "ib";
    return reply("✏️ *Anti-edit is now ENABLED for inbox only*");
  } else if (status === "gc") {
    config.ANTI_EDIT = "group";
    process.env.ANTI_EDIT = "group";
    return reply("✏️ *Anti-edit is now ENABLED for groups only*");
  } else if (status === "off") {
    config.ANTI_EDIT = "false";
    process.env.ANTI_EDIT = "false";
    return reply("✏️ *Anti-edit is now DISABLED*");
  } else {
    return reply(`*✏️ Anti-edit Command*\n\n• *on* - Enable for both\n• *ib* - Enable for inbox only\n• *gc* - Enable for groups only\n• *off* - Disable\n\n*Example:* .antiedit on`);
  }
});

// ===== ANTI EDIT PATH =====
cmd({
  pattern: "antieditpath",
  alias: ["editpath", "anti-edit-path"],
  react: "✏️🛣️",
  desc: "Configure where to show edited messages",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const option = args[0]?.toLowerCase();
  
  if (option === "ib") {
    config.ANTI_EDIT_PATH = "inbox";
    process.env.ANTI_EDIT_PATH = "inbox";
    return reply("✏️🛣️ *Anti-edit path set to INBOX only*\n_Edited messages will be shown in the owner's inbox only._");
  } else if (option === "same") {
    config.ANTI_EDIT_PATH = "same";
    process.env.ANTI_EDIT_PATH = "same";
    return reply("✏️🛣️ *Anti-edit path set to SAME chat*\n_Edited messages will be shown in the same chat where they were edited._");
  } else {
    return reply(`*✏️🛣️ Anti-edit Path Command*\n\n• *ib* - Show edited messages in inbox only\n• *same* - Show edited messages in same chat\n\n*Example:* .antieditpath ib`);
  }
});

// ===== ANTI DELETE PATH =====
cmd({
  pattern: "antidelpath",
  alias: ["delpath", "anti-delete-path", "deletepath"],
  react: "🛣️",
  desc: "Configure where to show deleted messages",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const option = args[0]?.toLowerCase();
  
  if (option === "ib") {
    config.ANTI_DELETE_PATH = "inbox";
    process.env.ANTI_DELETE_PATH = "inbox";
    return reply("🛣️ *Anti-delete path set to INBOX only*\n_Deleted messages will be shown in the same inbox where they were deleted._");
  } else if (option === "same") {
    config.ANTI_DELETE_PATH = "same";
    process.env.ANTI_DELETE_PATH = "same";
    return reply("🛣️ *Anti-delete path set to SAME chat*\n_Deleted messages will be shown in the same chat where they were deleted._");
  } else {
    return reply(`*🛣️ Anti-delete Path Command*\n\n• *ib* - Show deleted messages in inbox only\n• *same* - Show deleted messages in same chat\n\n*Example:* .antidelpath ib`);
  }
});

// ===== ANTI DELETE =====
cmd({
  pattern: "antidelete",
  alias: ["ad", "anti-delete", "antidel"],
  react: "🗑️",
  desc: "Enable anti-delete feature to show deleted messages",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  
  if (status === "on") {
    config.ANTI_DELETE = "true";
    process.env.ANTI_DELETE = "true";
    return reply("🗑️ *Anti-delete is now ENABLED for both inbox and groups*");
  } else if (status === "ib") {
    config.ANTI_DELETE = "ib";
    process.env.ANTI_DELETE = "ib";
    return reply("🗑️ *Anti-delete is now ENABLED for inbox only*");
  } else if (status === "gc") {
    config.ANTI_DELETE = "group";
    process.env.ANTI_DELETE = "group";
    return reply("🗑️ *Anti-delete is now ENABLED for groups only*");
  } else if (status === "off") {
    config.ANTI_DELETE = "false";
    process.env.ANTI_DELETE = "false";
    return reply("🗑️ *Anti-delete is now DISABLED*");
  } else {
    return reply(`*🗑️ Anti-delete Command*\n\n• *on* - Enable for both\n• *ib* - Enable for inbox only\n• *gc* - Enable for groups only\n• *off* - Disable\n\n*Example:* .antidelete on`);
  }
});

// ===== PRESENCE STATUS =====
cmd({
  pattern: "presence",
  alias: ["presencestatus", "status"],
  react: "📱",
  desc: "Check the current bot presence status",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");
  
  let statusText = "*📱 Bot Presence Status*\n\n";
  
  // Always Online
  const alwaysOnline = config.ALWAYS_ONLINE || process.env.ALWAYS_ONLINE || "false";
  statusText += `🟢 *Always Online:* ${alwaysOnline === "true" ? "ENABLED" : "DISABLED"}\n`;
  
  // Auto Typing
  const autoTyping = config.AUTO_TYPING || process.env.AUTO_TYPING || "false";
  let typingStatus = "DISABLED";
  if (autoTyping === "true") typingStatus = "ENABLED (both)";
  else if (autoTyping === "ib") typingStatus = "ENABLED (inbox only)";
  else if (autoTyping === "group") typingStatus = "ENABLED (groups only)";
  statusText += `⌨️ *Auto Typing:* ${typingStatus}\n`;
  
  // Auto Recording
  const autoRecording = config.AUTO_RECORDING || process.env.AUTO_RECORDING || "false";
  let recordingStatus = "DISABLED";
  if (autoRecording === "true") recordingStatus = "ENABLED (both)";
  else if (autoRecording === "ib") recordingStatus = "ENABLED (inbox only)";
  else if (autoRecording === "group") recordingStatus = "ENABLED (groups only)";
  statusText += `🎙️ *Auto Recording:* ${recordingStatus}\n\n`;
  
  statusText += `*Available Commands:*\n• .autotyping on/ib/gc/off\n• .alwaysonline on/off\n• .autorecording on/ib/gc/off\n• .presence`;
  
  return reply(statusText);
});


// CUSTOM REACT
cmd({
  pattern: "customreact",
  alias: ["creact", "reactc"],
  react: "😎",
  desc: "Enable or disable custom reactions",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { from, args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const status = args[0]?.toLowerCase();
  if (status === "on") {
    config.CUSTOM_REACT = "true";
    process.env.CUSTOM_REACT = "true";
    return reply("✅ Custom reactions are now enabled.");
  } else if (status === "off") {
    config.CUSTOM_REACT = "false";
    process.env.CUSTOM_REACT = "false";
    return reply("❌ Custom reactions are now disabled.");
  } else {
    return reply(`Example: .customreact on`);
  }
});

// status react emojis

cmd({
  pattern: "statusreacts",
  alias: ["status-emojis", "semojis", "stausemoji"],
  desc: "Set custom reaction emojis for the bot",
  category: "owner",
  react: "🌈",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");

  const emojiList = args.join(" ").trim();
  if (!emojiList) return reply("❌ Please provide a comma-separated list of emojis.\n\nExample:\n.statuaemojis 💖,💗,💘,💕");

  // Update config
  config.STATUS_REACT_EMOJIS = emojiList;
  process.env.STATUS_REACT_EMOJIS = emojiList;

  await reply(`✅ Custom Status reaction emojis updated to:\n${emojiList}`);
});


// SET CUSTOM REACTION EMOJIS
cmd({
  pattern: "setreacts",
  alias: ["customemojis", "emojis", "cemojis"],
  desc: "Set custom reaction emojis for the bot",
  category: "owner",
  react: "🌈",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("❗ Only the bot owner can use this command.");

  const emojiList = args.join(" ").trim();
  if (!emojiList) return reply("❌ Please provide a comma-separated list of emojis.\n\nExample:\n.setreactemoji 💖,💗,💘,💕");

  // Update config
  config.CUSTOM_REACT_EMOJIS = emojiList;
  process.env.CUSTOM_REACT_EMOJIS = emojiList;

  await reply(`✅ Custom reaction emojis updated to:\n${emojiList}`);
});

// SET PREFIX
cmd({
  pattern: "setprefix",
  alias: ["prefix"],
  react: "🪄",
  desc: "Change the bot's command prefix.",
  category: "settings",
  filename: __filename
}, async (conn, mek, m, { args, isCreator, reply }) => {
  if (!isCreator) return reply("*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*");

  const newPrefix = args[0];
  if (!newPrefix) return reply("*❌ ᴘʀᴏᴠɪᴅᴇ ɴᴇᴡ ᴘʀᴇғɪx. ᴇxᴀᴍᴘʟᴇ: .sᴇᴛᴘʀᴇғɪx !*");

  setPrefix(newPrefix);
  config.PREFIX = newPrefix;
  process.env.PREFIX = newPrefix;
  await reloadConfig(); // Soft reload for command listeners

  return reply(`*✅ ᴘʀᴇғɪx ᴜᴘᴅᴀᴛᴇᴅ ᴛᴏ: ${newPrefix}*`);
});

// Jawad The King
