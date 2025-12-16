const config = require('../config')
const { cmd } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
  pattern: "revoke",
  alias: ["resetlink", "newlink", "resetinvite"],
  desc: "Reset group invite link",
  category: "group",
  react: "🔄",
  filename: __filename
}, async (conn, mek, m, {
  from,
  isCreator,
  isBotAdmins,
  isAdmins,
  isGroup,
  reply
}) => {
  try {
    if (!isGroup) return reply("⚠️ This command only works in groups.");
    if (!isBotAdmins) return reply("❌ I must be admin to revoke invite link.");
    if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

    // Revoke the invite link
    const newInviteCode = await conn.groupRevokeInvite(from);
    
    // Create the new invite link
    const newLink = `https://chat.whatsapp.com/${newInviteCode}`;
    
    reply(`*✅ Group invite link has been reset!*\n\n*New Link:* ${newLink}`);

  } catch (err) {
    console.error(err);
    reply("❌ Failed to revoke invite link. Something went wrong.");
  }
});
