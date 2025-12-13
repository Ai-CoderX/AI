const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

function getStatusText(value) {
    if (!value || value === "false") return "❌ DISABLED";
    if (value === "true") return "✅ ENABLED";
    if (value === "warn") return "⚠️ WARN";
    if (value === "delete") return "🗑️ DELETE";
    if (value === "same") return "💬 SAME";
    if (value === "group") return "👥 GROUP";
    if (value === "inbox") return "📥 INBOX";
    return value;
}

cmd({
    pattern: "config",
    alias: ["varlist", "envlist"],
    desc: "Show all bot configuration variables (Owner Only)",
    category: "owner",
    react: "⚙️",
    filename: __filename
}, 
async (conn, mek, m, { from, quoted, reply, isCreator }) => {
    try {
        if (!isCreator) {
            return reply("🚫 *Owner Only Command!* You're not authorized to view bot configurations.");
        }

        let envSettings = `
╭───『 *${config.BOT_NAME} CONFIGURATION* 』───❏
│
├─❏ *🤖 BOT CORE SETTINGS*
│  ├─∘ *Name:* ${config.BOT_NAME}
│  ├─∘ *Prefix:* ${config.PREFIX}
│  ├─∘ *Owner:* ${config.OWNER_NAME}
│  ├─∘ *Number:* ${config.OWNER_NUMBER}
│  ├─∘ *Mode:* ${config.MODE.toUpperCase()}
│  ├─∘ *Chatbot:* ${config.CHATBOT}
│  └─∘ *Version:* ${config.VERSION}
│
├─❏ *📱 AUTO PRESENCE*
│  ├─∘ *Always Online:* ${getStatusText(config.ALWAYS_ONLINE)}
│  ├─∘ *Auto Typing:* ${getStatusText(config.AUTO_TYPING)}
│  └─∘ *Auto Recording:* ${getStatusText(config.AUTO_RECORDING)}
│
├─❏ *🔌 AUTOMATION*
│  ├─∘ *Auto Reply:* ${getStatusText(config.AUTO_REPLY)}
│  ├─∘ *Auto React:* ${getStatusText(config.AUTO_REACT)}
│  ├─∘ *Custom React:* ${getStatusText(config.CUSTOM_REACT)}
│  ├─∘ *React Emojis:* ${config.CUSTOM_REACT_EMOJIS}
│  ├─∘ *Auto Sticker:* ${getStatusText(config.AUTO_STICKER)}
│  ├─∘ *Mention Reply:* ${getStatusText(config.MENTION_REPLY)}
│  └─∘ *Read Message:* ${getStatusText(config.READ_MESSAGE)}
│
├─❏ *📢 STATUS SETTINGS*
│  ├─∘ *Status Seen:* ${getStatusText(config.AUTO_STATUS_SEEN)}
│  ├─∘ *Status Reply:* ${getStatusText(config.AUTO_STATUS_REPLY)}
│  ├─∘ *Status React:* ${getStatusText(config.AUTO_STATUS_REACT)}
│  └─∘ *Status Msg:* ${config.AUTO_STATUS_MSG}
│
├─❏ *🛡️ ANTI-FEATURES*
│  ├─∘ *Anti-Link:* ${getStatusText(config.ANTI_LINK)}
│  ├─∘ *Anti-Bad:* ${getStatusText(config.ANTI_BAD_WORD)}
│  ├─∘ *Anti-Call:* ${getStatusText(config.ANTI_CALL)}
│  ├─∘ *Anti-Spam:* ${getStatusText(config.ANTI_SPAM)}
│  ├─∘ *Anti-VV:* ${getStatusText(config.ANTI_VV)}
│  ├─∘ *Anti-Bot:* ${getStatusText(config.ANTI_BOT)}
│  ├─∘ *Anti-Mention:* ${getStatusText(config.ANTI_MENTION)}
│  ├─∘ *Anti-Status Mention:* ${getStatusText(config.ANTI_STATUS_MENTION)}
│  ├─∘ *PM Blocker:* ${getStatusText(config.PM_BLOCKER)}
│  ├─∘ *Anti-Delete:* ${getStatusText(config.ANTI_DELETE)}
│  ├─∘ *Anti-Delete Path:* ${getStatusText(config.ANTI_DELETE_PATH)}
│  ├─∘ *Anti-Edit:* ${getStatusText(config.ANTI_EDIT)}
│  └─∘ *Anti-Edit Path:* ${getStatusText(config.ANTI_EDIT_PATH)}
│
├─❏ *🎨 MEDIA & APPEARANCE*
│  ├─∘ *Menu Image:* ${config.MENU_IMAGE_URL}
│  ├─∘ *Menu Audio:* ${config.MENU_AUDIO_URL}
│  ├─∘ *Sticker Pack:* ${config.STICKER_NAME}
│  └─∘ *Description:* ${config.DESCRIPTION}
│
├─❏ *👥 GROUP SETTINGS*
│  ├─∘ *Welcome:* ${getStatusText(config.WELCOME)}
│  ├─∘ *Admin Action:* ${getStatusText(config.ADMIN_ACTION)}
│  └─∘ *Call Reject Msg:* ${config.REJECT_MSG}
│
├─❏ *🌍 SYSTEM*
│  ├─∘ *Timezone:* ${config.TIMEZONE}
│  ├─∘ *Repo:* ${config.REPO}
│  ├─∘ *Baileys:* ${config.BAILEYS}
│  ├─∘ *Pairing Code:* ${getStatusText(config.PAIRING_CODE)}
│  ├─∘ *Auto Bio:* ${getStatusText(config.AUTO_BIO)}
│  └─∘ *Dev Number:* ${config.DEV}
│
╰───『 *${config.DESCRIPTION}* 』───❏

*📝 Note:* Session ID is hidden for security.
`;

        await conn.sendMessage(
            from,
            {
                image: { url: config.MENU_IMAGE_URL },
                caption: envSettings,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );

    } catch (error) {
        console.error('Env command error:', error);
        reply(`❌ Error displaying config: ${error.message}`);
    }
});
