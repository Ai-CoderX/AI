const fs = require('fs');
const { cmd } = require('../command');

cmd({
  pattern: "debug",
  alias: ["dbg", "inspect", "raw"],
  react: "🛰️",
  desc: "Ultimate debug tool to inspect any WhatsApp message structure",
  category: "tools",
  filename: __filename
}, async (conn, m) => {
  try {

    // RAW incoming message
    const raw = m.message ? m.message : m;

    // RAW quoted message
    const quoted = m.quoted && m.quoted.message ? m.quoted.message : null;

    // Auto Detect message type
    let msgType = m.mtype || "unknown";

    // Protocol Detection
    let protocol = raw?.protocolMessage?.type || null;

    // Reaction Message
    let reaction = raw?.reactionMessage || null;

    // Forwarded
    let isForwarded = m.message?.extendedTextMessage?.contextInfo?.isForwarded || false;

    // Ephemeral
    let ephemeral = raw?.ephemeralMessage ? true : false;

    // List / Buttons / Carousel
    let uiDetect = {
      hasButtons: !!raw?.buttonsMessage,
      hasList: !!raw?.listMessage,
      hasCarousel: !!raw?.carouselMessage,
      hasInteractive: !!raw?.interactiveMessage
    };

    // Construct final debug data
    const debugData = {
      id: m.id,
      chat: m.chat,
      sender: m.sender,
      fromMe: m.fromMe,
      isGroup: m.isGroup,
      messageType: msgType,
      protocolMessage: protocol,
      reactionMessage: reaction,
      forwarded: isForwarded,
      ephemeral: ephemeral,
      UI: uiDetect,
      raw_message: raw,
      quoted_message: quoted
    };

    // Stringify
    const finalString = JSON.stringify(debugData, null, 2);

    // Save as file
    const filePath = './debug.json';
    fs.writeFileSync(filePath, finalString);

    // Send text output
    await conn.sendMessage(m.chat, {
      text: "🛰 *KHAN-MD Debug Report*\n\n```" + finalString + "```"
    }, { quoted: m });

    // Send file
    await conn.sendMessage(m.chat, {
      document: fs.readFileSync(filePath),
      mimetype: 'application/json',
      fileName: 'debug.json'
    }, { quoted: m });

    // Clean
    fs.unlinkSync(filePath);

  } catch (err) {
    await conn.sendMessage(m.chat, {
      text: "❌ Error:\n```" + err + "```"
    });
  }
});
