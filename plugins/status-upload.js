//

const { cmd } = require("../command");
const config = require("../config");
const converter = require('../lib/converter');
const crypto = require('crypto');

cmd({
  pattern: "status",
  alias: ["uploadstatus", "story"],
  react: "🚀",
  desc: "Upload media to your status - Creator Only",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner command.*"
      }, { quoted: message });
    }

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a media message*\n\nSupported formats:\n• Images\n• Videos\n• Audio/Voice messages"
      }, { quoted: message });
    }

    // Add processing reaction
    await client.sendMessage(from, { react: { text: '⏳', key: message.key } });

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    
    let messageContent = {};

    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "image/jpeg"
        };
        break;
        
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: match.quoted.text || '',
          mimetype: match.quoted.mimetype || "video/mp4",
          gifPlayback: match.quoted.gifPlayback || false
        };
        break;
        
      case "audioMessage":
        // Convert any audio to PTT format for status
        const ext = match.quoted.mimetype?.includes('mp3') ? 'mp3' : 
                   match.quoted.mimetype?.includes('m4a') ? 'm4a' : 
                   match.quoted.mimetype?.includes('ogg') ? 'ogg' : 'mp3';
        
        const pttBuffer = await converter.toPTT(buffer, ext);
        
        messageContent = {
          audio: pttBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true
        };
        break;
        
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    // FIXED: Use proper status upload method
    await uploadToStatus(client, messageContent);

    // Add success reaction
    await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    
    await client.sendMessage(from, {
      text: "✅ Status uploaded successfully!"
    }, { quoted: message });
    
  } catch (error) {
    console.error("Status Upload Error:", error);
    // Add error reaction
    await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    
    await client.sendMessage(from, {
      text: "❌ Error uploading status:\n" + error.message
    }, { quoted: message });
  }
});

// SINGLE ROBUST METHOD FOR STATUS UPLOAD
async function uploadToStatus(client, content) {
  try {
    // Generate 32-byte random secret (CRITICAL for status messages)
    const messageSecret = crypto.randomBytes(32);
    
    // Use the client's upload function
    const upload = client.waUploadToServer || client.upload;
    if (!upload) {
      throw new Error("Upload function not found in client");
    }
    
    // Generate WhatsApp message content with proper formatting
    const waMsg = await client.generateWAMessageContent(content, {
      upload: upload,
      backgroundColor: '#000000',
      font: 0
    });
    
    // Create the special status message structure
    const statusMessage = {
      messageContextInfo: { 
        messageSecret: messageSecret 
      },
      ephemeralMessage: {
        message: {
          ...waMsg,
          messageContextInfo: { 
            messageSecret: messageSecret 
          }
        },
        messageEphemeralDuration: 86400 // 24 hours in seconds
      }
    };
    
    // Send to status broadcast
    const statusJid = 'status@broadcast';
    const msg = client.generateWAMessageFromContent(statusJid, statusMessage, {});
    
    // Relay the message (not regular sendMessage)
    await client.relayMessage(statusJid, msg.message, { 
      messageId: msg.key.id 
    });
    
    return true;
  } catch (error) {
    console.error("Status upload failed:", error);
    throw new Error(`Failed to upload status: ${error.message}`);
  }
}
