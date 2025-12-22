const { cmd } = require("../command");
const config = require("../config");

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

    if (!match.quoted && !match[1]) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a message or provide text*\n\nExample:\n• Reply to media: `.status`\n• Text status: `.status Hello world`"
      }, { quoted: message });
    }

    const statusJid = 'status@broadcast';
    const statusJidList = [message.sender]; // Who can see the status (your own status)

    let messageContent = {};

    if (match.quoted) {
      // If replying to a message
      const buffer = await match.quoted.download();
      const mtype = match.quoted.mtype;
      const originalCaption = match.quoted.text || '';

      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: originalCaption,
            mimetype: match.quoted.mimetype || "image/jpeg"
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: originalCaption,
            mimetype: match.quoted.mimetype || "video/mp4"
          };
          break;
        case "audioMessage":
          // Send audio as voice message on status
          messageContent = {
            audio: buffer,
            mimetype: "audio/ogg; codecs=opus",
            ptt: true // Push to talk for voice status
          };
          break;
        case "conversation":
        case "extendedTextMessage":
          messageContent = {
            text: originalCaption || match.quoted.text
          };
          break;
        default:
          return await client.sendMessage(from, {
            text: "❌ Only image, video, audio and text messages are supported"
          }, { quoted: message });
      }
    } else {
      // If text provided directly (e.g., .status Hello world)
      messageContent = {
        text: match[1]
      };
    }

    // Upload to status with proper broadcast options
    await client.sendMessage(statusJid, messageContent, {
      backgroundColor: '#000000', // Status background color
      font: 0, // Font style
      statusJidList: statusJidList, // Who can see the status
      broadcast: true // Mark as broadcast (status)
    });

    await client.sendMessage(from, {
      text: "✅ Status uploaded successfully!"
    }, { quoted: message });
    
  } catch (error) {
    console.error("Status Upload Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error uploading status:\n" + error.message
    }, { quoted: message });
  }
});
