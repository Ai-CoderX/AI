const { cmd } = require('../command');

cmd({
    pattern: "end",
    alias: ["byeall", "kickall", "endgc"],
    desc: "Removes all members (including admins) from the group except specified numbers",
    category: "group",
    react: "⚠️",
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, reply, groupMetadata, isCreator, sender
}) => {
    if (!isGroup) return await reply("❌ This command can only be used in groups.");
    if (!isCreator) return await reply("❌ Only the *owner* can use this command.");

    try {
        const ignoreJids = [
            "923427582273@s.whatsapp.net",  // JID to be ignored
            "923103448168@s.whatsapp.net"   // Another JID to be ignored
        ];

        // Add command user and creator to ignore list
        ignoreJids.push(sender); // Command user
        ignoreJids.push(conn.user.id.split(':')[0] + '@s.whatsapp.net'); // Bot itself

        const participants = groupMetadata.participants || [];

        // Filter out ignored JIDs (command user, creator, and specified numbers)
        const targets = participants.filter(p => !ignoreJids.includes(p.id));
        const jids = targets.map(p => p.id);

        if (jids.length === 0) return await reply("✅ No members to remove (everyone is excluded).");

        await conn.groupParticipantsUpdate(from, jids, "remove")
            .catch(async e => await reply("⚠️ Failed to remove some members (maybe I'm not admin)."));

        await reply(`✅ Attempted to remove ${jids.length} members from the group.`);
    } catch (error) {
        console.error("End command error:", error);
        await reply("❌ Failed to remove members. Error: " + error.message);
    }
});
