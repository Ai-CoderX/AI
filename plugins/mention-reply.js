const { cmd } = require('../command');
const config = require('../config');

cmd({
  'on': "body"
}, async (conn, m, store, { isGroup, botNumber2 }) => {
  try {
    const mek = m.mek || m;
    
    // Ignore bot's own messages
    if (mek.key?.fromMe) return;
    
    // Check conditions
    if (config.MENTION_REPLY !== 'true' || !isGroup || !botNumber2) return;
    
    // Check if botNumber2 is mentioned
    const mentioned = m.mentionedJid || [];
    if (!mentioned.includes(botNumber2)) return;
    
    // Random audio clips
    const voiceClips = [
      'https://files.catbox.moe/xv42ur.mp3',
      'https://files.catbox.moe/fac856.mp3'
      // Add more URLs here
    ];
    
    // Random thumbnail images
    const thumbnailImages = [
      'https://files.catbox.moe/zw53ly.jpg',
      'https://files.catbox.moe/wkje7f.jpg',
      'https://files.catbox.moe/9f0vjf.jpg'
    ];
    
    // Select random audio and thumbnail
    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
    const randomThumbnail = thumbnailImages[Math.floor(Math.random() * thumbnailImages.length)];
    
    // Send audio reply
    await conn.sendMessage(m.chat, {
      audio: { url: randomClip },
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: "Mention Reply",
          body: "Bot mentioned!",
          thumbnailUrl: randomThumbnail,
          mediaType: 1, // 1 = Image
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('Error in mention reply:', e);
  }
});
