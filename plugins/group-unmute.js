const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

cmd({
  pattern: "unmute",
  alias: ["unlock", "open"],
  desc: "Unmute the group (admins only)",
  category: "group",
  react: "🔊",
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
    if (!isBotAdmins) return reply("❌ I must be admin to unmute the group.");
    if (!isAdmins && !isCreator) return reply("🔐 Only group admins or owner can use this command.");

    // Unmute the group
    await conn.groupSettingUpdate(from, 'not_announcement');
    reply("*🔊 Group has been unmuted!* \nEveryone can send messages now.");

  } catch (err) {
    console.error(err);
    reply("❌ Failed to unmute group. Something went wrong.");
  }
});
