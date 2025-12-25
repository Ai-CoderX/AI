// Jawad TechX

const { cmd } = require('../command');
const config = require('../config');
const converter = require('../lib/converter');

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
      'https://files.catbox.moe/pw4yuu.mp3',
      'https://files.catbox.moe/tuueyw.mp3',
      'https://files.catbox.moe/q56rza.mp3',
      'https://files.catbox.moe/ldrebe.mp3',
      'https://files.catbox.moe/cpjqjd.mp3',
      'https://files.catbox.moe/v5c4fd.mp3',
      'https://files.catbox.moe/naub62.mp3',
      'https://files.catbox.moe/ez7wvh.mp3',
      'https://files.catbox.moe/3ruryr.mp3',
      'https://files.catbox.moe/vxfry5.mp3',
      'https://files.catbox.moe/hk2fjw.mp3',
      'https://files.catbox.moe/pvymqf.mp3',
      'https://files.catbox.moe/md2jm5.mp3',
      'https://files.catbox.moe/ypx92a.mp3',
      'https://files.catbox.moe/7tv2do.mp3',
      'https://files.catbox.moe/sr8k3y.mp3'
    ];
    
    // Select random audio
    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
    
    // Fetch audio from URL
    const audioResponse = await fetch(randomClip);
    const audioBuffer = await audioResponse.buffer();
    
    // Convert audio to PTT (voice message format)
    const pttAudio = await converter.toPTT(audioBuffer, 'mp3');
    
    // Send audio reply as voice message
    await conn.sendMessage(m.chat, {
      audio: pttAudio,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m });

  } catch (e) {
    console.error('Error in mention reply:', e);
  }
});
