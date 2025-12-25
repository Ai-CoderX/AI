// Jawad TechX

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
    
    // Random thumbnail images
    const thumbnailImages = [
      'https://files.catbox.moe/huxwtr.jpg',
      'https://files.catbox.moe/4jp7qa.jpg',
      'https://files.catbox.moe/i0ocu2.jpg',
      'https://files.catbox.moe/gvel42.jpg',
      'https://files.catbox.moe/1zt2e1.jpg',
      'https://files.catbox.moe/zw53ly.jpg',
      'https://files.catbox.moe/ejmw1x.jpg',
      'https://files.catbox.moe/ffk4kg.jpg',
      'https://files.catbox.moe/xbccrl.jpg',
      'https://files.catbox.moe/bfk1ct.jpg'
    ];
    
    // Random sad/broken life slogans (improved)
    const slogans = [
      'Silent, but carrying a lot inside 🖤',
      'Pain taught me lessons words never could',
      'Calm face, restless thoughts 🖤',
      'Still standing after everything',
      'Broken moments made me stronger',
      'No noise, just growth 🔥',
      'Scars remind me how far I came',
      'Less talking, more healing',
      'Fighting battles no one sees 🕊️',
      'Choosing peace over chaos'
    ];
    
    // Select random items
    const randomClip = voiceClips[Math.floor(Math.random() * voiceClips.length)];
    const randomThumbnail = thumbnailImages[Math.floor(Math.random() * thumbnailImages.length)];
    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];
    
    // Send audio reply with original format
    await conn.sendMessage(m.chat, {
      audio: { url: randomClip },
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: 'Auto Mention Reply 🥀',
          body: randomSlogan,
          thumbnailUrl: randomThumbnail,
          thumbnailWidth: 600,
          thumbnailHeight: 600,
          mediaType: 1,
          renderLargerThumbnail: false,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (e) {
    console.error('Error in mention reply:', e);
  }
});
