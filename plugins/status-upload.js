const { cmd } = require("../command");
const config = require("../config");
const converter = require('../lib/converter');

cmd({
  pattern: "status",
  alias: ["uploadstatus", "story"],
  react: "📤",
  desc: "Upload media/text to your status - Creator Only",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner command.*"
      }, { quoted: message });
    }

    // Only allow when replying to a message, not direct text
    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message*\n\nExample:\n• Reply to image: `.status`\n• Reply to video: `.status`\n• Reply to audio: `.status`\n• Reply to text: `.status`"
      }, { quoted: message });
    }

    const statusJid = 'status@broadcast';
    let messageContent = {};

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;

    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;

      case "videoMessage":
        // Video limit: 1 minute
        if (match.quoted.seconds > 60) {
          return await client.sendMessage(from, {
            text: "❌ Video too long! Maximum 1 minute allowed."
          }, { quoted: message });
        }
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "video/mp4"
        };
        break;

      case "audioMessage":
        // Audio limit: 1 minute 20 seconds
        if (match.quoted.seconds > 80) {
          return await client.sendMessage(from, {
            text: "❌ Audio too long! Maximum 1 minute 20 seconds allowed."
          }, { quoted: message });
        }
        
        // Convert audio/voice using converter
        const ext = mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const ptt = await converter.toPTT(buffer, ext);
        
        messageContent = {
          audio: ptt,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        };
        break;

      case "conversation":
      case "extendedTextMessage":
        // Text status
        const text = match.quoted.text || match.quoted.body || '';
        if (!text.trim()) {
          return await client.sendMessage(from, {
            text: "❌ No text found in the quoted message."
          }, { quoted: message });
        }
        messageContent = {
          text: text.trim()
        };
        break;

      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, audio and text messages are supported"
        }, { quoted: message });
    }

    // Upload to status
    await client.sendMessage(statusJid, messageContent, {
      backgroundColor: '#000000',
      font: 0,
      broadcast: true
    });

    await client.sendMessage(from, {
      text: "✅ Status uploaded successfully!"
    }, { quoted: message });
    
  } catch (error) {
    console.error("Status Upload Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error: " + error.message
    }, { quoted: message });
  }
});
