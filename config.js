const fs = require('fs');
const path = require('path');
const settings = require('./settings');

if (fs.existsSync(path.resolve('config.env'))) {
  require('dotenv').config({ path: path.resolve('config.env') });
}

// Helper to convert "true"/"false" strings to actual boolean
function convertToBool(text, trueValue = 'true') {
  return text === trueValue;
}

// Global API Settings
global.jk = 'https://jawad-tech.vercel.app';
global.pair = 'https://khanmd-pair.onrender.com';
global.pairx = 'https://khanxmd-pair.onrender.com';

// Don't Change This Part Unless You Want Errors!!!!
global.APIs = {
  jk: 'https://jawad-tech.vercel.app',
  pair: 'https://khanmd-pair.onrender.com',
  pairx: 'https://khanxmd-pair.onrender.com'
}

global.APIKeys = {
  'https://jawad-tech.vercel.app': ''
}

module.exports = {
  // ===== BOT CORE SETTINGS =====
  SESSION_ID: settings.SESSION_ID || process.env.SESSION_ID || "",
  PREFIX: settings.PREFIX || process.env.PREFIX || ".",
  CHATBOT: settings.CHATBOT || process.env.CHATBOT || "off",
  BOT_NAME: settings.BOT_NAME || process.env.BOT_NAME || "KHAN-MD",
  MODE: settings.MODE || process.env.MODE || "private",
  REPO: process.env.REPO || "https://github.com/JawadYT36/KHAN-MD",
  PAIRING_CODE: process.env.PAIRING_CODE || 'true',
  BAILEYS: process.env.BAILEYS || "@whiskeysockets/baileys",

  // ===== OWNER & DEVELOPER SETTINGS =====
  OWNER_NUMBER: settings.OWNER_NUMBER || process.env.OWNER_NUMBER || "923427582273",
  OWNER_NAME: settings.OWNER_NAME || process.env.OWNER_NAME || "Jᴀᴡᴀᴅ TᴇᴄʜX",
  DEV: process.env.DEV || "923427582273",
  
  // ===== AUTO-RESPONSE SETTINGS =====
  AUTO_REPLY: settings.AUTO_REPLY || process.env.AUTO_REPLY || "false",
  AUTO_STATUS_REPLY: settings.AUTO_STATUS_REPLY || process.env.AUTO_STATUS_REPLY || "false",
  AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*KHAN MD VIEWED YOUR STATUS 🤖*",
  READ_MESSAGE: settings.READ_MESSAGE || process.env.READ_MESSAGE || "false",
  REJECT_MSG: process.env.REJECT_MSG || "*📞 ᴄαℓℓ ɴσт αℓℓσωє∂ ιɴ тнιѕ ɴᴜмвєʀ уσυ ∂σɴт нανє ᴘєʀмιѕѕισɴ 📵*",

  // ===== REACTION SETTINGS =====
  AUTO_REACT: settings.AUTO_REACT || process.env.AUTO_REACT || "false",
  CUSTOM_REACT: settings.CUSTOM_REACT || process.env.CUSTOM_REACT || "false",
  CUSTOM_REACT_EMOJIS: settings.CUSTOM_REACT_EMOJIS || process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
  STICKER_NAME: process.env.STICKER_NAME || "KHAN-MD",
  AUTO_STICKER: settings.AUTO_STICKER || process.env.AUTO_STICKER || "false",

  // ===== AUTO PRESENCE SETTINGS =====
  ALWAYS_ONLINE: settings.ALWAYS_ONLINE || process.env.ALWAYS_ONLINE || "false",
  AUTO_TYPING: settings.AUTO_TYPING || process.env.AUTO_TYPING || "false",
  AUTO_RECORDING: settings.AUTO_RECORDING || process.env.AUTO_RECORDING || "false",

  // ===== MEDIA & AUTOMATION =====
  MENTION_REPLY: settings.MENTION_REPLY || process.env.MENTION_REPLY || "false",
  MENU_IMAGE_URL: settings.MENU_IMAGE_URL || process.env.MENU_IMAGE_URL || "https://files.catbox.moe/7zfdcq.jpg",
  MENU_AUDIO_URL: settings.MENU_AUDIO_URL || process.env.MENU_AUDIO_URL || 'https://files.catbox.moe/xv42ur.mp3',

  // ===== SECURITY & ANTI-FEATURES =====
  ANTI_DELETE: settings.ANTI_DELETE || process.env.ANTI_DELETE || "true",
  ANTI_DELETE_PATH: process.env.ANTI_DELETE_PATH || "inbox",
  ANTI_EDIT: settings.ANTI_EDIT || process.env.ANTI_EDIT || "false",
  ANTI_EDIT_PATH: settings.ANTI_EDIT_PATH || process.env.ANTI_EDIT_PATH || "inbox",
  ANTI_CALL: settings.ANTI_CALL || process.env.ANTI_CALL || "false",
  ANTI_BAD_WORD: settings.ANTI_BAD_WORD || process.env.ANTI_BAD_WORD || "false",
  ANTI_LINK: settings.ANTI_LINK || process.env.ANTI_LINK || "true",
  ANTI_SPAM: settings.ANTI_SPAM || process.env.ANTI_SPAM || "false",
  ANTI_VV: settings.ANTI_VV || process.env.ANTI_VV || "false",
  ANTI_BOT: settings.ANTI_BOT || process.env.ANTI_BOT || "false",
  PM_BLOCKER: settings.PM_BLOCKER || process.env.PM_BLOCKER || "false",
  ANTI_MENTION: settings.ANTI_MENTION || process.env.ANTI_MENTION || "false",
  ANTI_STATUS_MENTION: settings.ANTI_STATUS_MENTION || process.env.ANTI_STATUS_MENTION || "false",

  // ===== BOT BEHAVIOR & APPEARANCE =====
  DESCRIPTION: process.env.DESCRIPTION || "*© ᴘᴏᴡᴇʀᴇᴅ ʙʏ Jᴀᴡᴀᴅ TᴇᴄʜX*",
  AUTO_STATUS_REACT: settings.AUTO_STATUS_REACT || process.env.AUTO_STATUS_REACT || "true",
  AUTO_STATUS_SEEN: settings.AUTO_STATUS_SEEN || process.env.AUTO_STATUS_SEEN || "true",
  AUTO_BIO: settings.AUTO_BIO || process.env.AUTO_BIO || "false",
  WELCOME: settings.WELCOME || process.env.WELCOME || "false",
  ADMIN_ACTION: settings.ADMIN_ACTION || process.env.ADMIN_ACTION || "false",
  VERSION: process.env.VERSION || "9.0.0 Bᴇᴛᴀ",
  TIMEZONE: settings.TIMEZONE || process.env.TIMEZONE || "Asia/Karachi",
};
