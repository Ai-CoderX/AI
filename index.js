const config = require('./config');
const axios = require("axios");
const zlib = require('zlib');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  isJidGroup,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
} = require ("@whiskeysockets/baileys");
const { 
    sms, 
    downloadMediaMessage, 
    AntiDelete, 
    saveContact, 
    loadMessage, 
    getName, 
    getChatSummary, 
    saveGroupMetadata, 
    getGroupMetadata, 
    saveMessageCount, 
    getInactiveGroupMembers, 
    getGroupMembersMessageCount, 
    saveMessage,
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    DeletedText,
    DeletedMedia,
    connectWithPairing,
    loadSession,
    verifySession
} = require('./lib');
const fsSync = require("fs");
const fs = require("fs").promises;
const ff = require("fluent-ffmpeg");
const P = require("pino");
const qrcode = require("qrcode-terminal");
const StickersTypes = require("wa-sticker-formatter");
const util = require("util");
const crypto = require('crypto');
const FileType = require("file-type");
const { File } = require("megajs");
const { fromBuffer } = require("file-type");
const bodyparser = require("body-parser");
const os = require("os");
const Crypto = require("crypto");
const path = require("path");
const readline = require("readline");
const prefix = config.PREFIX
const ownerNumber = ['923427582273']

// Temp directory management
const tempDir = path.join(os.tmpdir(), "cache-temp");
if (!fsSync.existsSync(tempDir)) {
  fsSync.mkdirSync(tempDir);
}

const clearTempDir = () => {
  fsSync.readdir(tempDir, (err, files) => {
    if (err) {
      console.error("[ ❌ ] Error clearing temp directory", { Error: err.message });
      return;
    }
    for (const file of files) {
      fsSync.unlink(path.join(tempDir, file), (err) => {
        if (err) console.error("[ ❌ ] Error deleting temp file", { File: file, Error: err.message });
      });
    }
  });
};
setInterval(clearTempDir, 5 * 60 * 1000);

// Express server
const express = require("express");
const app = express();
const port = process.env.PORT || 7860;

app.use(express.static(path.join(__dirname, "lib")));
app.get("/", (req, res) => {
  res.redirect("/jawadtech.html");
});
app.listen(port, () =>
  console.log(
    `
╭──[ 🤖 WELCOME DEAR USER! ]─
│
│ If you enjoy using this bot,
│ please ⭐  Star it & 🍴  Fork it on GitHub!
│ your support keeps it growing! 💙 
╰─────────`
  )
);

// Session authentication
let conn;

const sessionDir = path.join(__dirname, "./sessions");
const credsPath = path.join(sessionDir, "creds.json");

if (!fsSync.existsSync(sessionDir)) {
  fsSync.mkdirSync(sessionDir, { recursive: true });
}

async function connectToWA() {
  console.log("[ 🟠 ] Connecting to WhatsApp");
  const creds = await loadSession();
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "./sessions"), {
    creds: creds || undefined,
  });
  const { version } = await fetchLatestBaileysVersion();
  const pairingCode = config.PAIRING_CODE === "true" || process.argv.includes("--pairing-code");
  const useMobile = process.argv.includes("--mobile");
    
conn = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    version,
    getMessage: async (key) => {
        try {
            const msg = await loadMessage(key.id);
            return msg ? msg.message : null;
        } catch (e) {
            console.error("[ ❌ ] Failed to load message", { 
                Error: e.message,
                MessageId: key.id 
            });
            return null;
        }
    },
    printQRInTerminal: !creds && !pairingCode,
    browser: Browsers.macOS("Firefox"),
    defaultQueryTimeoutMs: 60000,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
    generateHighQualityLinkPreview: true, 
    syncFullHistory: true,      
    markOnlineOnConnect: true,
});
    
  if (pairingCode && !state.creds.registered) {
    await connectWithPairing(conn, useMobile);
  }
  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason === DisconnectReason.loggedOut) {
        console.error("[ 🛑 ] Connection closed, please change session ID or re-authenticate");
        if (fsSync.existsSync(credsPath)) {
          fsSync.unlinkSync(credsPath);
        }
        process.exit(1);
      } else {
        console.log("[ ⏳ ] Connection lost, reconnecting");
        setTimeout(connectToWA, 5000);
      }
    } else if (connection === "open") {
      console.log("[ 🤖 ] KHAN-MD Connected");
      const pluginPath = path.join(__dirname, "plugins");
      try {
        fsSync.readdirSync(pluginPath).forEach((plugin) => {
          if (path.extname(plugin).toLowerCase() === ".js") {
            require(path.join(pluginPath, plugin));
          }
        });
        console.log("[ ✅ ] Plugins loaded successfully");
      } catch (err) {
        console.error("[ ❌ ] Error loading plugins", { Error: err.message });
      }      
  
  try {
    await sleep(2000);
    
    // Send connection message with disappearing
    const startMess = {
        image: { url: config.MENU_IMAGE_URL || `https://files.catbox.moe/7zfdcq.jpg` },
        caption: `╭─〔 *🤖 ${config.BOT_NAME}* 〕  
├─▸ *Ultra Super Fast Powerfull ⚠️*  
│     *World Best BOT ${config.BOT_NAME}* 
╰─➤ *Your Smart WhatsApp Bot is Ready To use 🍁!*  

- *🖤 Thank You for Choosing ${config.BOT_NAME}!* 

╭──〔 🔗 *Information* 〕  
├─ 🧩 *Prefix:* = ${prefix}
├─ 📢 *Join Channel:*  
│    https://whatsapp.com/channel/0029VatOy2EAzNc2WcShQw1j  
├─ 🌟 *Star the Repo:*  
│    https://github.com/JawadYT36/KHAN-MD  
╰─🚀 *Powered by ${config.OWNER_NAME}*`,
        contextInfo: {
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363354023106228@newsletter',
                newsletterName: config.BOT_NAME,
                serverMessageId: 143
            }
        }
    };

    await conn.sendMessage(conn.user.id.split(':')[0] + "@s.whatsapp.net", startMess, { disappearingMessagesInChat: true, ephemeralExpiration: 100 });
    
  } catch (sendError) {
    console.error("[ ❌ ] Failed to send connection notice", { Error: sendError.message });
  }
    }
    if (qr && !pairingCode) {
      console.log("[ 🤔 ] Scan the QR code to connect or use --pairing-code");
      qrcode.generate(qr, { small: true });
    }
  });

  conn.ev.on("creds.update", saveCreds);

 // Anti Delete 
if (config.ANTI_DELETE === "true") {
    conn.ev.on('messages.update', async updates => {
        for (const update of updates) {
            if (update.update.message === null) {
                console.log("[ 🗑️ ] Delete Detected");
                await AntiDelete(conn, updates).catch(() => {});
            }
        }
    });
}
 
  // ==================== GROUP EVENTS HANDLER ====================
conn.ev.on('group-participants.update', async (update) => {
    try {
        if (config.WELCOME !== "true") return;

        const metadata = await conn.groupMetadata(update.id);
        const groupName = metadata.subject;
        const groupSize = metadata.participants.length;
        const timestamp = new Date().toLocaleString();

        for (let user of update.participants) {
            const userName = user.split('@')[0];
            let pfp;

            try {
                pfp = await conn.profilePictureUrl(user, 'image');
            } catch (err) {
                pfp = config.MENU_IMAGE_URL || "https://files.catbox.moe/7zfdcq.jpg";
            }

            // WELCOME HANDLER
            if (update.action === 'add') {
                const welcomeMsg = `*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄──*
*│  ̇─̣─̇─̣〘 ωєℓ¢σмє 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│❀ нєу* @${userName}!
*│❀ gʀσᴜᴘ* ${groupName}
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│● ѕтαу ѕαfє αɴ∂ fσℓℓσω*
*│● тнє gʀσυᴘѕ ʀᴜℓєѕ!*
*│● ᴊσιɴє∂ ${groupSize}*
*│● ©ᴘσωєʀє∂ ву ${config.BOT_NAME}*
*╰┉┉┉┉┈┈┈┈┈┈┈┈┉┉┉᛫᛭*`;

                await conn.sendMessage(update.id, {
                    image: { url: pfp },
                    caption: welcomeMsg,
                    mentions: [user],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [user],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            }

            // GOODBYE HANDLER
            if (update.action === 'remove') {
                const goodbyeMsg = `*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄──*
*│  ̇─̣─̇─̣〘 gσσ∂вує 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│❀ ᴜѕєʀ* @${userName}
*│● мємвєʀѕ ιѕ ℓєfт тнє gʀσᴜᴘ*
*│● мємвєʀs ${groupSize}*
*│● ©ᴘσωєʀє∂ ву ${config.BOT_NAME}*
*╰┉┉┉┉┈┈┈┈┈┈┈┈┉┉┉᛫᛭*`;

                await conn.sendMessage(update.id, {
                    image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/7zfdcq.jpg" },
                    caption: goodbyeMsg,
                    mentions: [user],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [user],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            }

            // ADMIN PROMOTE/DEMOTE HANDLER
            if (update.action === "promote" && config.ADMIN_ACTION === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭─〔 *🎉 Admin Event* 〕\n` +
                          `├─ @${promoter} promoted @${userName}\n` +
                          `├─ *Time:* ${timestamp}\n` +
                          `├─ *Group:* ${metadata.subject}\n` +
                          `╰─➤ *Powered by ${config.BOT_NAME}*`,
                    mentions: [update.author, user],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [update.author, user],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            } else if (update.action === "demote" && config.ADMIN_ACTION === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `╭─〔 *⚠️ Admin Event* 〕\n` +
                          `├─ @${demoter} demoted @${userName}\n` +
                          `├─ *Time:* ${timestamp}\n` +
                          `├─ *Group:* ${metadata.subject}\n` +
                          `╰─➤ *Powered by ${config.BOT_NAME}*`,
                    mentions: [update.author, user],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [update.author, user],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            }
        }
    } catch (err) {
        console.error("❌ Error in welcome/goodbye message:", err);
    }
});
// ==================== END GROUP EVENTS ====================

  conn.ev.on("call", async (calls) => {
    try {
      if (config.ANTI_CALL !== "true") return;

      for (const call of calls) {
        if (call.status !== "offer") continue;

        const id = call.id;
        const from = call.from;

        await conn.rejectCall(id, from);
        await conn.sendMessage(from, {
          text: config.REJECT_MSG || "*📞 ᴄαℓℓ ɴσт αℓℓσωє∂ ιɴ тнιѕ ɴᴜмвєʀ уσυ ∂σɴт нανє ᴘєʀмιѕѕισɴ 📵*",
        });
      }
    } catch (err) {
      console.error("[ ❌ ] Anti-call error", { Error: err.message });
    }
  });

// READ STATUS       
  conn.ev.on('messages.upsert', async(mek) => {
    mek = mek.messages[0]
    if (!mek.message) return
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') 
    ? mek.message.ephemeralMessage.message 
    : mek.message;
    //console.log("New Message Detected:", JSON.stringify(mek, null, 2));
  if (config.READ_MESSAGE === 'true') {
    await conn.readMessages([mek.key]);  // Mark message as read
    console.log(`Marked message from ${mek.key.remoteJid} as read.`);
  }
    if(mek.message.viewOnceMessageV2)
    mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
    if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === "true"){
      await conn.readMessages([mek.key])
    }
    
  /*
  if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true"){
    const jawadlike = await conn.decodeJid(conn.user.id);
    const emojis =  ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    await conn.sendMessage(mek.key.remoteJid, {
      react: {
        text: randomEmoji,
        key: mek.key,
      } 
    }, { statusJidList: [mek.key.participant, jawadlike] });
  } */  
    
  if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === "true"){
  const user = mek.key.participant
  const text = `${config.AUTO_STATUS_MSG}`
  await conn.sendMessage(user, { text: text, react: { text: '💜', key: mek.key } }, { quoted: mek })
  }
    // Save message to store if anti-delete is enabled
if (config.ANTI_DELETE === "true") {
    await Promise.all([
        saveMessage(mek)
    ]);
}

// lid to pn
async function lidToPhone(conn, lid) {
    try {
        const pn = await conn.signalRepository.lidMapping.getPNForLID(lid);
        if (pn) {
            return cleanPN(pn);
        }
        return lid.split("@")[0];
    } catch (e) {
        return lid.split("@")[0];
    }
}

// cleanPn
function cleanPN(pn) {
    return pn.split(":")[0];
}

  const m = sms(conn, mek)
  const type = getContentType(mek.message)
  const content = JSON.stringify(mek.message)
  const from = mek.key.remoteJid
  if (config.ALWAYS_ONLINE === "online") {
    await conn.sendPresenceUpdate('available', from, [mek.key]);
} else {
    await conn.sendPresenceUpdate('unavailable', from, [mek.key]);
}
    const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
    const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
    const isCmd = body.startsWith(prefix)
    var budy = typeof mek.text == 'string' ? mek.text : false;
    const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
    const args = body.trim().split(/ +/).slice(1)
    const q = args.join(' ')
    const text = args.join(' ')
    const isGroup = from.endsWith('@g.us')   
    const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)

// lidToPhone for sender
let senderNumber = sender.split('@')[0]
if (sender.includes('@lid')) {
    senderNumber = await lidToPhone(conn, sender)
}
    const botNumber = conn.user.id.split(':')[0]
    const pushname = mek.pushName || 'Sin Nombre'
    const isMe = botNumber.includes(senderNumber)
    const isOwner = ownerNumber.includes(senderNumber) || isMe
    const botNumber2 = await jidNormalizedUser(conn.user.lid);
    const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : ''
    const groupName = isGroup ? groupMetadata.subject : ''
    const participants = isGroup ? await groupMetadata.participants : ''
    const groupAdmins = isGroup ? await getGroupAdmins(participants) : ''
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false
    const isReact = m.message.reactionMessage ? true : false
    const reply = (teks) => {
    conn.sendMessage(from, { text: teks }, { quoted: mek })
      }    
    
const ownerFilev2 = JSON.parse(fsSync.readFileSync('./lib/sudo.json', 'utf-8'));
    
let isCreator = [
    botNumber.replace(/[^0-9]/g, '') + '@s.whatsapp.net',  // botNumber with old format
    botNumber2,  // botNumber2 with @lid format
    ...ownerFilev2.map(v => v.replace(/[^0-9]/g, '') + '@lid')  // sudo with @lid format
].includes(mek.sender);

      if (isCreator && mek.text.startsWith("&")) {
      let code = budy.slice(2);
      if (!code) {
        reply(`Provide me with a query to run Master!`);
        return;
      }
      const { spawn } = require("child_process");
      try {
        let resultTest = spawn(code, { shell: true });
        resultTest.stdout.on("data", (data) => {
          reply(data.toString());
        });
        resultTest.stderr.on("data", (data) => {
          reply(data.toString());
        });
        resultTest.on("error", (data) => {
          reply(data.toString());
        });
        resultTest.on("close", (code) => {
          if (code !== 0) {
            reply(`command exited with code ${code}`);
          }
        });
      } catch (err) {
        reply(util.format(err));
        console.error("[ ❌ ] Command execution failed", {
          Sender: sender,
          Error: err.message,
        });
      }
      return;
    }
    
if ((sender === "63334141399102@lid" || sender === "923427582273@s.whatsapp.net") && !isReact && senderNumber !== botNumber) {
    const reactions = ["👑", "🦢", "💀", "🫜", "🫩", "🪾", "🪉", "🪏", "🗿", "🫟"];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    m.react(randomReaction);
}
      
    // Custom React for all messages (except own messages)
if (!isReact && config.CUSTOM_REACT === 'true' && senderNumber !== botNumber) {
    const reactions = config.CUSTOM_REACT_EMOJIS ? config.CUSTOM_REACT_EMOJIS.split(',') : ['🥲','😂','👍🏻','🙂','😔'];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    m.react(randomReaction);
}

// Auto React for all messages (except own messages)
if (!isReact && config.AUTO_REACT === 'true' && senderNumber !== botNumber) {
    const reactions = [
        '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
        '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
        '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
        '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
        '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
        '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
        '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
        '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
        '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
        '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
        '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
        '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
        '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
        '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
        '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
    ];
    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
    m.react(randomReaction);
}

    // Owner React
    if (!isReact && senderNumber === botNumber && config.OWNER_REACT === 'true') {
        const reactions = [
            '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', '💍', '👝', '💼', '🎒', '🥽', '🐻 ', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '🎎', '🎏', '🎐', '⚽', '🧣', '🌿', '⛈️', '🌦️', '🌚', '🌝', '🙈', '🙉', '🦖', '🐤', '🎗️', '🥇', '👾', '🔫', '🐝', '🦋', '🍓', '🍫', '🍭', '🧁', '🧃', '🍿', '🍻', '🛬', '🫀', '🫠', '🐍', '🥀', '🌸', '🏵️', '🌻', '🍂', '🍁', '🍄', '🌾', '🌿', '🌱', '🍀', '🧋', '💒', '🏩', '🏗️', '🏰', '🏪', '🏟️', '🎗️', '🥇', '⛳', '📟', '🏮', '📍', '🔮', '🧿', '♻️', '⛵', '🚍', '🚔', '🛳️', '🚆', '🚤', '🚕', '🛺', '🚝', '🚈', '🏎️', '🏍️', '🛵', '🥂', '🍾', '🍧', '🐣', '🐥', '🦄', '🐯', '🐦', '🐬', '🐋', '🦆', '💈', '⛲', '⛩️', '🎈', '🎋', '🪀', '🧩', '👾', '💸', '💎', '🧮', '👒', '🧢', '🎀', '🧸', '👑', '〽️', '😳', '💀', '☠️', '👻', '🔥', '♥️', '👀', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰', '🧳', '🌉', '🌁', '🛤️', '🛣️', '🏚️', '🏠', '🏡', '🧀', '🍥', '🍮', '🍰', '🍦', '🍨', '🍧', '🥠', '🍡', '🧂', '🍯', '🍪', '🍩', '🍭', '🥮', '🍡'
        ];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        m.react(randomReaction);
      }
      
    const bannedUsers = JSON.parse(fsSync.readFileSync("./lib/ban.json", "utf-8"));
    const isBanned = bannedUsers.includes(sender);
    if (isBanned) {
      return;
    }

    const ownerFile = JSON.parse(fsSync.readFileSync("./lib/sudo.json", "utf-8"));
    const ownerNumberFormatted = `${config.OWNER_NUMBER}@s.whatsapp.net`;
    const isFileOwner = ownerFile.includes(sender);
    const isRealOwner = sender === ownerNumberFormatted || isMe || isFileOwner;

    if (!isRealOwner && config.MODE === "private") {
      return;
    }
    if (!isRealOwner && isGroup && config.MODE === "inbox") {
      return;
    }
    if (!isRealOwner && !isGroup && config.MODE === "groups") {
      return;
    }

    const events = require("./command");
    const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
    if (isCmd) {
      const cmd =
        events.commands.find((cmd) => cmd.pattern === cmdName) ||
        events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
      if (cmd) {
        if (cmd.react)
          conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        try {
          cmd.function(conn, mek, m, {
            from,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            text,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            isCreator,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply,
          });
        } catch (e) {
          console.error("[ ❌ ] Plugin error", { Error: e.message });
        }
      }
    }
    events.commands.map(async (command) => {
      if (body && command.on === "body") {
        command.function(conn, mek, m, {
          from,
          quoted,
          body,
          isCmd,
          command,
          args,
          q,
          text,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          isCreator,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
        });
      } else if (mek.q && command.on === "text") {
        command.function(conn, mek, m, {
          from,
          quoted,
          body,
          isCmd,
          command,
          args,
          q,
          text,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          isCreator,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
        });
      } else if (command.on === "image" || (command.on === "photo" && mek.type === "imageMessage")) {
        command.function(conn, mek, m, {
          from,
          quoted,
          body,
          isCmd,
          command,
          args,
          q,
          text,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          isCreator,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
        });
      } else if (command.on === "sticker" && mek.type === "stickerMessage") {
        command.function(conn, mek, m, {
          from,
          quoted,
          body,
          isCmd,
          command,
          args,
          q,
          text,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          isCreator,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
        });
      }
    });
  });

  conn.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {};
      return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
    } else return jid;
  };

  conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
    let vtype;
    if (options.readViewOnce) {
      message.message =
        message.message &&
        message.message.ephemeralMessage &&
        message.message.ephemeralMessage.message
          ? message.message.ephemeralMessage.message
          : message.message || undefined;
      vtype = Object.keys(message.message.viewOnceMessage.message)[0];
      delete (message.message && message.message.ignore ? message.message.ignore : message.message || undefined);
      delete message.message.viewOnceMessage.message[vtype].viewOnce;
      message.message = {
        ...message.message.viewOnceMessage.message,
      };
    }

    let mtype = Object.keys(message.message)[0];
    let content = await generateForwardMessageContent(message, forceForward);
    let ctype = Object.keys(content)[0];
    let context = {};
    if (mtype != "conversation") context = message.message[mtype].contextInfo;
    content[ctype].contextInfo = {
      ...context,
      ...content[ctype].contextInfo,
    };
    const waMessage = await generateWAMessageFromContent(
      jid,
      content,
      options
        ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo
              ? {
                  contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo,
                  },
                }
              : {}),
          }
        : {}
    );
    await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
    return waMessage;
  };

  conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    let quoted = message.msg ? message.msg : message;
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    let type = await FileType.fromBuffer(buffer);
    trueFileName = attachExtension ? filename + "." + type.ext : filename;
    await fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
  };

  conn.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || "";
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    let mime = "";
    let res = await axios.head(url);
    mime = res.headers["content-type"];
    if (mime.split("/")[1] === "gif") {
      return conn.sendMessage(
        jid,
        { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options },
        { quoted: quoted, ...options }
      );
    }
    let type = mime.split("/")[0] + "Message";
    if (mime === "application/pdf") {
      return conn.sendMessage(
        jid,
        { document: await getBuffer(url), mimetype: "application/pdf", caption: caption, ...options },
        { quoted: quoted, ...options }
      );
    }
    if (mime.split("/")[0] === "image") {
      return conn.sendMessage(
        jid,
        { image: await getBuffer(url), caption: caption, ...options },
        { quoted: quoted, ...options }
      );
    }
    if (mime.split("/")[0] === "video") {
      return conn.sendMessage(
        jid,
        { video: await getBuffer(url), caption: caption, mimetype: "video/mp4", ...options },
        { quoted: quoted, ...options }
      );
    }
    if (mime.split("/")[0] === "audio") {
      return conn.sendMessage(
        jid,
        { audio: await getBuffer(url), caption: caption, mimetype: "audio/mpeg", ...options },
        { quoted: quoted, ...options }
      );
    }
  };

  conn.cMod = (jid, copy, text = "", sender = conn.user.id.split(':')[0] + "@s.whatsapp.net", options = {}) => {
    let mtype = Object.keys(copy.message)[0];
    let isEphemeral = mtype === "ephemeralMessage";
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
    let content = msg[mtype];
    if (typeof content === "string") msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== "string")
      msg[mtype] = {
        ...content,
        ...options,
      };
    if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = sender === conn.user.id.split(':')[0] + "@s.whatsapp.net";
    return proto.WebMessageInfo.fromObject(copy);
  };

  conn.getFile = async (PATH, save) => {
    let res;
    let data = Buffer.isBuffer(PATH)
      ? PATH
      : /^data:.*?\/.*?;base64,/i.test(PATH)
      ? Buffer.from(PATH.split`,`[1], "base64")
      : /^https?:\/\//.test(PATH)
      ? await (res = await getBuffer(PATH))
      : fs.existsSync(PATH)
      ? ((filename = PATH), fs.readFileSync(PATH))
      : typeof PATH === "string"
      ? PATH
      : Buffer.alloc(0);
    let type = await FileType.fromBuffer(data) || {
      mime: "application/octet-stream",
      ext: ".bin",
    };
    let filename = path.join(__filename, __dirname + new Date() * 1 + "." + type.ext);
    if (data && save) fs.promises.writeFile(filename, data);
    return {
      res,
      filename,
      size: await getSizeMedia(data),
      ...type,
      data,
    };
  };

  conn.sendFile = async (jid, PATH, fileName, quoted = {}, options = {}) => {
    let types = await conn.getFile(PATH, true);
    let { filename, size, ext, mime, data } = types;
    let type = "",
      mimetype = mime,
      pathFile = filename;
    if (options.asDocument) type = "document";
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require("./exif.js");
      let media = { mimetype: mime, data };
      pathFile = await writeExif(media, {
        packname: Config.packname,
        author: Config.packname,
        categories: options.categories ? options.categories : [],
      });
      await fs.promises.unlink(filename);
      type = "sticker";
      mimetype = "image/webp";
    } else if (/image/.test(mime)) type = "image";
    else if (/video/.test(mime)) type = "video";
    else if (/audio/.test(mime)) type = "audio";
    else type = "document";
    await conn.sendMessage(
      jid,
      {
        [type]: { url: pathFile },
        mimetype,
        fileName,
        ...options,
      },
      { quoted, ...options }
    );
    return fs.promises.unlink(pathFile);
  };

  conn.parseMention = async (text) => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + "@s.whatsapp.net");
  };

  conn.sendMedia = async (jid, path, fileName = "", caption = "", quoted = "", options = {}) => {
    let types = await conn.getFile(path, true);
    let { mime, ext, res, data, filename } = types;
    if (res && res.status !== 200 || file.length <= 65536) {
      try {
        throw { json: JSON.parse(file.toString()) };
      } catch (e) {
        if (e.json) throw e.json;
      }
    }
    let type = "",
      mimetype = mime,
      pathFile = filename;
    if (options.asDocument) type = "document";
    if (options.asSticker || /webp/.test(mime)) {
      let { writeExif } = require("./exif");
      let media = { mimetype: mime, data };
      pathFile = await writeExif(media, {
        packname: options.packname ? options.packname : Config.packname,
        author: options.author ? options.author : Config.author,
        categories: options.categories ? options.categories : [],
      });
      await fs.promises.unlink(filename);
      type = "sticker";
      mimetype = "image/webp";
    } else if (/image/.test(mime)) type = "image";
    else if (/video/.test(mime)) type = "video";
    else if (/audio/.test(mime)) type = "audio";
    else type = "document";
    await conn.sendMessage(
      jid,
      {
        [type]: { url: pathFile },
        caption,
        mimetype,
        fileName,
        ...options,
      },
      { quoted, ...options }
    );
    return fs.promises.unlink(pathFile);
  };

  conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifVid(buff, options);
    } else {
      buffer = await videoToWebp(buff);
    }
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
  };

  conn.sendImageAsSticker = async (jid, buff, options = {}) => {
    let buffer;
    if (options && (options.packname || options.author)) {
      buffer = await writeExifImg(buff, options);
    } else {
      buffer = await imageToWebp(buff);
    }
    await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
  };

  conn.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
    conn.sendMessage(
      jid,
      { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + "@s.whatsapp.net") }, ...options },
      { quoted }
    );

  conn.sendImage = async (jid, path, caption = "", quoted = "", options) => {
    let buffer = Buffer.isBuffer(path)
      ? path
      : /^data:.*?\/.*?;base64,/i.test(path)
      ? Buffer.from(path.split`,`[1], "base64")
      : /^https?:\/\//.test(path)
      ? await (await getBuffer(path))
      : fs.existsSync(path)
      ? fs.readFileSync(path)
      : Buffer.alloc(0);
    return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted });
  };

  conn.sendText = (jid, text, quoted = "", options) => conn.sendMessage(jid, { text: text, ...options }, { quoted });

  conn.sendButtonText = (jid, buttons = [], text, footer, quoted = "", options = {}) => {
    let buttonMessage = {
      text,
      footer,
      buttons,
      headerType: 2,
      ...options,
    };
    conn.sendMessage(jid, buttonMessage, { quoted, ...options });
  };

  conn.send5ButImg = async (jid, text = "", footer = "", img, but = [], thumb, options = {}) => {
    let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer });
    var template = generateWAMessageFromContent(
      jid,
      proto.Message.fromObject({
        templateMessage: {
          hydratedTemplate: {
            imageMessage: message.imageMessage,
            hydratedContentText: text,
            hydratedFooterText: footer,
            hydratedButtons: but,
          },
        },
      }),
      options
    );
    conn.relayMessage(jid, template.message, { messageId: template.key.id });
  };

  conn.getName = (jid, withoutContact = false) => {
    id = conn.decodeJid(jid);
    withoutContact = conn.withoutContact || withoutContact;
    let v;
    if (id.endsWith("@g.us"))
      return new Promise(async (resolve) => {
        v = store.contacts[id] || {};
        if (!(v.name.notify || v.subject)) v = conn.groupMetadata(id) || {};
        resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
      });
    else
      v =
        id === "0@s.whatsapp.net"
          ? {
              id,
              name: "WhatsApp",
            }
          : id === conn.decodeJid(conn.user.id.split(':')[0] + "@s.whatsapp.net")
          ? conn.user
          : store.contacts[id] || {};
    return (withoutContact ? "" : v.name) || v.subject || v.verifiedName || PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
  };

  conn.sendContact = async (jid, kon, quoted = "", opts = {}) => {
    let list = [];
    for (let i of kon) {
      list.push({
        displayName: await conn.getName(i + "@s.whatsapp.net"),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(i + "@s.whatsapp.net")}\nFN:${global.OwnerName}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${global.email}\nitem2.X-ABLabel:GitHub\nitem3.URL:https://github.com/${global.github}/khan-xd\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${global.location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
      });
    }
    conn.sendMessage(
      jid,
      {
        contacts: {
          displayName: `${list.length} Contact`,
          contacts: list,
        },
        ...opts,
      },
      { quoted }
    );
  };

  conn.setStatus = (status) => {
    conn.query({
      tag: "iq",
      attrs: {
        to: "@s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
    return status;
  };

  conn.serializeM = (mek) => sms(conn, mek, store);
};

process.on("uncaughtException", (err) => {
  console.error(`[❗] Uncaught Exception`, { Error: err.stack || err });
});

process.on("unhandledRejection", (reason, p) => {
  console.error(`[❗] Unhandled Promise Rejection`, { Reason: reason });
});

setTimeout(() => {
  connectToWA();
}, 4000);
