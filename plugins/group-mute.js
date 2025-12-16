const config = require('../config')
const { cmd } = require('../command')

cmd({
  pattern: "mute",
  alias: ["lock", "close"],
  desc: "Mute the group (admins only)",
  category: "group",
  react: "🔇",
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
    if (!isBotAdmins) return reply("❌ I must be admin to mute the group.");
    if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

    // Mute the group for 1 year (maximum)
    await conn.groupSettingUpdate(from, 'announcement');
    reply("*🔇 Group has been muted!* \nOnly admins can send messages now.");

  } catch (err) {
    console.error(err);
    reply("❌ Failed to mute group. Something went wrong.");
  }
});


