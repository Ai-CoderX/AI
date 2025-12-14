const config = require('../config')
const { cmd, commands } = require('../command')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions')

cmd({
    pattern: "tagall",
    alias: ["gc_tagall", "mentionall", "everyone"],
    desc: "To Tag all Members in Group",
    react: "⚡",
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

        // ✅ Add 3-second delay before processing
        await sleep(1500);

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
        
        // ✅ Single set of symbols for both sections
        const symbols = ['⬡', '⬦', '⬨', '⬫', '⬭', '⬯', '◈', '◉', '◊', '◎'];
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];

        // ✅ Create the formatted message with unified styling
        let teks = `*╭───${randomSymbol} ɢʀᴏᴜᴘ ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ ${randomSymbol}───*
*┋ ${randomSymbol} ɢʀᴏᴜᴘ: ${groupName}*
*┋ ${randomSymbol} ᴍᴇᴍʙᴇʀs: ${totalMembers}*
*┋ ${randomSymbol} ᴍᴇssᴀɢᴇ: ${message}*
*┋*
*┋ 📢 ᴛᴀᴘ 'ʀᴇᴀᴅ ᴍᴏʀᴇ' ᴛᴏ sᴇᴇ ᴀʟʟ ᴍᴇᴍʙᴇʀs*
*╰─────────────────────⊷*
${readmore}
*╭───${randomSymbol} ᴍᴇɴᴛɪᴏɴs ${randomSymbol}───*`;

        // ✅ Add members without asterisks (plain text for mentions section)
        for (let mem of participants) {
            if (!mem.id) continue;
            teks += `\n${randomSymbol} @${mem.id.split('@')[0]}`;
        }

        teks += `\n*╰───────────────────⊷*\n> ${config.DESCRIPTION}`;

        // ✅ Create mentions array
        let mentions = [];
        for (let mem of participants) {
            if (mem.id) {
                mentions.push(mem.id);
            }
        }

        // ✅ Send the message with mentions
        await conn.sendMessage(
            from, 
            { 
                text: teks, 
                mentions: mentions
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
