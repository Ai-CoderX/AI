const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
    pattern: "tagall",
    alias: ["gc_tagall", "mentionall", "everyone"],
    desc: "To Tag all Members in Group",
    react: "📢",
    category: "group",
    use: '.tagall [message]',
    filename: __filename
},
async (conn, mek, m, { from, participants, reply, isGroup, isAdmins, isCreator, prefix, command, args, body }) => {
    try {
        // ✅ Group check
        if (!isGroup) {
            return reply("❌ This command can only be used in groups.");
        }

        // ✅ Permission check (Admin OR Bot Owner)
        if (!isAdmins && !isCreator) {
            return reply("❌ Only group admins or the bot owner can use this command.");
        }

        // ✅ Fetch group info
        let groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) return reply("❌ Failed to fetch group information.");

        let groupName = groupInfo.subject || "Unknown Group";
        let totalMembers = participants ? participants.length : 0;
        if (totalMembers === 0) return reply("❌ No members found in this group.");

        // ✅ Extract message
        let message = body.slice(body.indexOf(command) + command.length).trim();
        if (!message) message = "ᴀᴛᴛᴇɴᴛɪᴏɴ ᴇᴠᴇʀʏᴏɴᴇ";

        // ✅ Readmore for better formatting
        const readmore = '\u200B'.repeat(4001);
        
        // ✅ Random symbols for info section
        const symbols = ['❖', '◈', '◆', '◇', '▣', '▤', '▥', '▦', '▧', '▨', '▩', '◉', '◊', '◎', '●', '○', '◎', '◐', '◑', '◒', '◓'];
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        // ✅ Random symbols for mention section
        const mentionSymbols = ['⬡', '⬢', '⬣', '⬤', '⬥', '⬦', '⬧', '⬨', '⬩', '⬪', '⬫', '⬬', '⬭', '⬮', '⬯', '◈', '◉', '◊', '◎'];
        const randomMentionSymbol = mentionSymbols[Math.floor(Math.random() * mentionSymbols.length)];

        // ✅ Create the formatted message with readmore
        let teks = `*╭──❖ ɢʀᴏᴜᴘ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ ❖──*
*│*
*│ ${randomSymbol} ɢʀᴏᴜᴘ: ${groupName}*
*│ ${randomSymbol} ᴍᴇᴍʙᴇʀs: ${totalMembers}*
*│ ${randomSymbol} ᴍᴇssᴀɢᴇ: ${message}*
*│*
*│ 📢 ᴛᴀᴘ 'ʀᴇᴀᴅ ᴍᴏʀᴇ' ᴛᴏ sᴇᴇ ᴀʟʟ ᴍᴇᴍʙᴇʀs*
*╰─────────────────────⊷*
${readmore}
*╭───${randomMentionSymbol} ᴍᴇɴᴛɪᴏɴs ${randomMentionSymbol}───*`;

        // ✅ Add members with requested formatting
        for (let mem of participants) {
            if (!mem.id) continue;
            teks += `\n*┋ ${randomMentionSymbol} @${mem.id.split('@')[0]}*`;
        }

        teks += `\n*╰───────────────────⊷*\n> ${config.DESCRIPTION}`;

        // ✅ Send the message with mentions
        await conn.sendMessage(
            from, 
            { 
                text: teks, 
                mentions: participants.map(a => a.id)
            }, 
            { 
                quoted: mek 
            }
        );

    } catch (e) {
        console.error("TagAll Error:", e);
        reply(`❌ *Error Occurred!*\n\n${e.message || e}`);
    }
});
