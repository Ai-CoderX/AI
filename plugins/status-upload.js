const { cmd } = require("../command");
const config = require("../config");
const converter = require('../lib/converter');
const crypto = require('crypto');
const { generateWAMessageContent, generateWAMessageFromContent, proto } = require("@whiskeysockets/baileys");

cmd({
  pattern: "status",
  alias: ["uploadstatus", "story"],
  react: "📤",
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

// WORKING STATUS UPLOAD FUNCTION
async function uploadToStatus(client, content) {
  try {
    // Generate message secret (REQUIRED)
    const messageSecret = crypto.randomBytes(32);
    
    // Get upload function
    const upload = client.waUploadToServer || client.upload;
    if (!upload) {
      throw new Error("No upload function found");
    }
    
    // Generate message content
    const waMsg = await generateWAMessageContent(content, {
      upload: upload,
      backgroundColor: '#000000',
      font: 0
    });
    
    // Create status V3 message (CURRENT WhatsApp format)
    const statusMessage = {
      messageContextInfo: { 
        messageSecret: messageSecret 
      },
      statusMessageV3: {
        message: {
          ...waMsg,
          messageContextInfo: { 
            messageSecret: messageSecret 
          }
        }
      }
    };
    
    // Send to status
    const statusJid = 'status@broadcast';
    const msg = generateWAMessageFromContent(statusJid, statusMessage, {});
    
    // Send with relay
    await client.relayMessage(statusJid, msg.message, { 
      messageId: msg.key.id 
    });
    
    return true;
  } catch (error) {
    console.error("Upload status error:", error);
    
    // Try alternative method
    return await uploadToStatusAlternative(client, content);
  }
}

// ALTERNATIVE METHOD (if first fails)
async function uploadToStatusAlternative(client, content) {
  try {
    console.log("Trying alternative status upload method...");
    
    const messageSecret = crypto.randomBytes(32);
    const upload = client.waUploadToServer || client.upload;
    
    // Generate content
    const waMsg = await generateWAMessageContent(content, {
      upload: upload,
      backgroundColor: '#000000',
      font: 0
    });
    
    // Method 2: Direct status message structure
    const statusMsg = {
      messageContextInfo: { messageSecret: messageSecret },
      statusMessage: {
        message: {
          ...waMsg,
          messageContextInfo: { messageSecret: messageSecret }
        }
      }
    };
    
    const statusJid = 'status@broadcast';
    const msg = generateWAMessageFromContent(statusJid, statusMsg, {});
    
    await client.relayMessage(statusJid, msg.message, { 
      messageId: msg.key.id 
    });
    
    return true;
  } catch (error) {
    console.error("Alternative method failed:", error);
    
    // Method 3: Try direct send with special options
    try {
      const options = {
        backgroundColor: '#000000',
        font: 0,
        broadcast: true,
        statusJidList: [client.user.id.split(':')[0] + '@s.whatsapp.net']
      };
      
      // Try regular sendMessage as last resort
      await client.sendMessage('status@broadcast', content, options);
      return true;
    } catch (finalError) {
      console.error("All methods failed:", finalError);
      throw new Error(`All status upload methods failed: ${finalError.message}`);
    }
  }
}
