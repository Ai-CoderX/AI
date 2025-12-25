// Jawad Tech

const { cmd } = require('../command');
const config = require('../config');
const converter = require('../lib/converter');

// Only ONE const for voice clips - shared by both features
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

// 1. Auto reply when bot is mentioned in group
cmd({
  on: "body"
}, async (conn, m, store, { isGroup, botNumber2 }) => {
  try {
    const mek = m.mek || m;
    if (mek.key?.fromMe) return;

    if (config.MENTION_REPLY !== 'true' || !isGroup || !botNumber2) return;

    const mentioned = m.mentionedJid || [];
    if (!mentioned.includes(botNumber2)) return;

    // Use the shared voiceClips directly
    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

    // FIXED: Use arrayBuffer and convert to Buffer
    const audioResponse = await fetch(randomClip);
    const arrayBuffer = await audioResponse.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    
    const pttAudio = await converter.toPTT(audioBuffer, 'mp3');

    await conn.sendMessage(m.chat, {
      audio: pttAudio,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m });

  } catch (e) {
    console.error('Error in mention reply:', e);
  }
});

// 2. Command: .mention / .mreply / .voice / .randomvoice
cmd({
  pattern: "mee",
  alias: ["me"],
  desc: "Send a random voice message",
  category: "other",
  react: "🎵",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    // Use the same shared voiceClips directly
    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];

    // FIXED: Use arrayBuffer and convert to Buffer
    const audioResponse = await fetch(randomClip);
    const arrayBuffer = await audioResponse.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    
    const pttAudio = await converter.toPTT(audioBuffer, 'mp3');

    await conn.sendMessage(from, {
      audio: pttAudio,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m });

  } catch (e) {
    console.error('Error in mention command:', e);
    await reply(`❌ Error: ${e.message}`);
  }
});
