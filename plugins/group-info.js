const config = require('../config')
const { cmd } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')

cmd({
  pattern: "ginfo",
  alias: ["groupinfo"],
  desc: "Get group information",
  category: "group",
  react: "🥏",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isAdmins,
  isGroup,
  reply,
  metadata,
  participants
}) => {
  try {
    if (!isGroup) return await reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return await reply("❌ I must be admin to fetch group info.");
    if (!isAdmins && !isCreator) return await reply("🔐 Only admins can use this command.");

    const groupData = metadata || await conn.groupMetadata(from);
    
    // Get group admins
    const groupAdmins = participants?.filter(p => p.admin) || [];
    
    let text = `*「 Group Information 」*\n\n`;
    text += `*Name:* ${groupData.subject}\n`;
    text += `*ID:* ${groupData.id}\n`;
    text += `*Participants:* ${groupData.size}\n`;
    text += `*Created:* ${new Date(groupData.creation * 1000).toLocaleDateString()}\n`;
    text += `*Description:* ${groupData.desc?.slice(0, 100) || 'No description'}${groupData.desc?.length > 100 ? '...' : ''}\n\n`;
    text += `*Admins (${groupAdmins.length}):*\n`;
    
    groupAdmins.forEach((admin, i) => {
      text += `${i+1}. @${admin.id.split('@')[0]}\n`;
    });

    // Try to get group picture
    try {
      const ppUrl = await conn.profilePictureUrl(from, 'image');
      await conn.sendMessage(from, {
        image: { url: ppUrl },
        caption: text,
        mentions: groupAdmins.map(a => a.id)
      }, { quoted: mek });
    } catch {
      // Send without image if profile picture fails
      await reply(text, { mentions: groupAdmins.map(a => a.id) });
    }

  } catch (err) {
    console.error(err);
    await reply("❌ Failed to fetch group information.");
  }
});
