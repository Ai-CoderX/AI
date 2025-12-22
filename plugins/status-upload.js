// Created By JawadTechX

const { cmd } = require("../command");
const config = require("../config");
const converter = require('../lib/converter');

cmd({
  pattern: "status",
  alias: ["uploadstatus", "story"],
  react: "🪄",
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
        text: "*🍁 Please reply to any media*"
      }, { quoted: message });
    }

    const statusJid = 'status@broadcast';
    
    // Get the correct user JID for status
    // Extract base JID without device suffix
    const userJid = client.user.id.split(':')[0] + "@s.whatsapp.net";
    const statusJidList = [userJid];
    
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
          mimetype: match.quoted.mimetype || "video/mp4"
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

    console.log(`Uploading status to: ${statusJid}`);
    console.log(`Status JID List: ${JSON.stringify(statusJidList)}`);
    console.log(`Message type: ${mtype}`);

    // Upload to status
    await client.sendMessage(statusJid, messageContent, {
      backgroundColor: '#000000',
      font: 0,
      statusJidList: statusJidList,
      broadcast: true
    });

    // Add success reaction
    await client.sendMessage(from, { react: { text: '✅', key: message.key } });
    
    await client.sendMessage(from, {
      text: "*✅ Status uploaded successfully*"
    }, { quoted: message });
    
  } catch (error) {
    console.error("Status Upload Error:", error);
    console.error("Error details:", error.stack);
    // Add error reaction
    await client.sendMessage(from, { react: { text: '❌', key: message.key } });
    
    await client.sendMessage(from, {
      text: "❌ Error uploading status:\n" + error.message
    }, { quoted: message });
  }
});
