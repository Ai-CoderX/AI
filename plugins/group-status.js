const { cmd } = require("../command");
const config = require("../config");
const converter = require('../lib/converter');

cmd({
  pattern: "groupstatus",
  alias: ["statusgc", "swgc"],
  react: "🚀",
  desc: "Upload media to group status - Owner Only",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isGroup, isCreator }) => {
  try {
    // Only allow in groups
    if (!isGroup) {
      return await client.sendMessage(from, {
        text: "*📛 This command can only be used in groups.*"
      }, { quoted: message });
    }

    // Only bot owner can use (like handler.owner = true)
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner command.*"
      }, { quoted: message });
    }

    const quoted = message.quoted;
    const mime = quoted ? quoted.mimetype : '';
    const captionText = match[1] || '';

    if (!mime && !captionText) {
      return await client.sendMessage(from, {
        text: `*🍁 Reply to media or provide text.*\n\nExamples:\n• \`${config.prefix}groupstatus Hello everyone!\`\n• \`${config.prefix}groupstatus\` (reply to image/video/audio)`
      }, { quoted: message });
    }

    // Add processing reaction
    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });

    const jid = from; // Current group JID
    let payload = {};

    if (/image/.test(mime)) {
      const buffer = await quoted.download();
      payload = {
        image: buffer,
        caption: captionText || '',
        mimetype: quoted.mimetype || "image/jpeg"
      };
    } else if (/video/.test(mime)) {
      const buffer = await quoted.download();
      payload = {
        video: buffer,
        caption: captionText || '',
        mimetype: quoted.mimetype || "video/mp4"
      };
    } else if (/audio/.test(mime)) {
      const buffer = await quoted.download();
      
      // Convert any audio to PTT format for status
      const ext = quoted.mimetype?.includes('mp3') ? 'mp3' : 
                 quoted.mimetype?.includes('m4a') ? 'm4a' : 
                 quoted.mimetype?.includes('ogg') ? 'ogg' : 'mp3';
      
      const pttBuffer = await converter.toPTT(buffer, ext);
      
      payload = {
        audio: pttBuffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true
      };
    } else if (captionText) {
      // Text-only status
      payload = {
        text: captionText
      };
    } else {
      return await client.sendMessage(from, {
        text: "❌ Unsupported media type. Only image, video, and audio are supported."
      }, { quoted: message });
    }

    // Send group status - visible to all group members
    await client.sendMessage(jid, payload, {
      backgroundColor: '#000000',
      font: 0,
      broadcast: true
      // No statusJidList = visible to all group members
    });

    // Add success reaction
    await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    
    await client.sendMessage(from, {
      text: "✅ Group status sent successfully!"
    }, { quoted: message });
    
  } catch (error) {
    console.error("Group Status Error:", error);
    // Add error reaction
    await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    
    await client.sendMessage(from, {
      text: `❌ Error: ${error.message}`
    }, { quoted: message });
  }
});
