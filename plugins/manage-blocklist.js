const { cmd } = require('../command');

cmd({
    pattern: "block",
    desc: "Blocks a person",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, m, { reply, q, react, isCreator, botNumber, botNumber2, sender }) => {
    if (!isCreator) {
        await react("❌");
        return reply("Only the bot owner can use this command.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender;
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    } else if (q) {
        // Clean the input - remove @ symbols and spaces, then add JID suffix
        const cleanNumber = q.replace(/[@\s]/g, '');
        jid = cleanNumber.includes('@s.whatsapp.net') ? cleanNumber : cleanNumber + '@s.whatsapp.net';
    } else {
        await react("❌");
        return reply("Please mention a user or reply to their message.");
    }

    // Protection check - don't block bot numbers or sender
    if (jid === botNumber || jid === botNumber2 || jid === sender) {
        await react("❌");
        return reply("I can't block myself or you!");
    }

    try {
        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        reply(`Successfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        reply("Failed to block the user.");
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, m, { reply, q, react, isCreator, botNumber, botNumber2, sender }) => {
    if (!isCreator) {
        await react("❌");
        return reply("Only the bot owner can use this command.");
    }

    let jid;
    if (m.quoted) {
        jid = m.quoted.sender;
    } else if (m.mentionedJid.length > 0) {
        jid = m.mentionedJid[0];
    } else if (q) {
        // Clean the input - remove @ symbols and spaces, then add JID suffix
        const cleanNumber = q.replace(/[@\s]/g, '');
        jid = cleanNumber.includes('@s.whatsapp.net') ? cleanNumber : cleanNumber + '@s.whatsapp.net';
    } else {
        await react("❌");
        return reply("Please mention a user or reply to their message.");
    }

    // Protection check - don't unblock bot numbers or sender (though unblocking sender makes sense)
    // Keeping this check for consistency
    if (jid === botNumber || jid === botNumber2) {
        await react("❌");
        return reply("I can't unblock myself!");
    }

    try {
        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        reply(`Successfully unblocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        reply("Failed to unblock the user.");
    }
});

// Block all members in group
cmd({
    pattern: "blockall",
    alias: ["blockgc", "blockgroup"],
    desc: "Blocks all members in the group",
    category: "group",
    react: "🚫",
    filename: __filename
},
async (conn, m, { 
    reply, 
    react, 
    isCreator, 
    isGroup, 
    from, 
    metadata, 
    botNumber, 
    botNumber2,
    sender 
}) => {
    try {
        if (!isCreator) {
            await react("❌");
            return reply("Only the bot owner can use this command.");
        }

        if (!isGroup) {
            await react("❌");
            return reply("This command only works in groups.");
        }

        await react("⏳");
        
        const groupData = metadata || await conn.groupMetadata(from);
        const participants = groupData.participants || [];
        
        if (participants.length === 0) {
            await react("❌");
            return reply("No members found in this group.");
        }

        // Filter out bot numbers and command sender
        const targets = participants.filter(p => 
            p.id !== botNumber && 
            p.id !== botNumber2 && 
            p.id !== sender
        );

        if (targets.length === 0) {
            await react("❌");
            return reply("No members to block (only bots and yourself in the group).");
        }

        let successCount = 0;
        let failCount = 0;

        // Block each member one by one
        for (const participant of targets) {
            try {
                await conn.updateBlockStatus(participant.id, "block");
                successCount++;
            } catch (error) {
                console.error(`Failed to block ${participant.id}:`, error);
                failCount++;
            }
        }

        await react("✅");
        await reply(`✅ Blocked ${successCount} member(s) from the group.\n❌ Failed: ${failCount}`);
        
    } catch (error) {
        console.error("Blockall command error:", error);
        await react("❌");
        reply("An error occurred while processing the command.");
    }
});

// Unblock all members in group
cmd({
    pattern: "unblockall",
    alias: ["unblockgc", "unblockgroup"],
    desc: "Unblocks all members in the group",
    category: "group",
    react: "🔓",
    filename: __filename
},
async (conn, m, { 
    reply, 
    react, 
    isCreator, 
    isGroup, 
    from, 
    metadata, 
    botNumber, 
    botNumber2,
    sender 
}) => {
    try {
        if (!isCreator) {
            await react("❌");
            return reply("Only the bot owner can use this command.");
        }

        if (!isGroup) {
            await react("❌");
            return reply("This command only works in groups.");
        }

        await react("⏳");
        
        const groupData = metadata || await conn.groupMetadata(from);
        const participants = groupData.participants || [];
        
        if (participants.length === 0) {
            await react("❌");
            return reply("No members found in this group.");
        }

        // Filter out bot numbers (but include sender for unblocking)
        const targets = participants.filter(p => 
            p.id !== botNumber && 
            p.id !== botNumber2
        );

        if (targets.length === 0) {
            await react("❌");
            return reply("No members to unblock (only bots in the group).");
        }

        let successCount = 0;
        let failCount = 0;

        // Unblock each member one by one
        for (const participant of targets) {
            try {
                await conn.updateBlockStatus(participant.id, "unblock");
                successCount++;
            } catch (error) {
                console.error(`Failed to unblock ${participant.id}:`, error);
                failCount++;
            }
        }

        await react("✅");
        await reply(`✅ Unblocked ${successCount} member(s) from the group.\n❌ Failed: ${failCount}`);
        
    } catch (error) {
        console.error("Unblockall command error:", error);
        await react("❌");
        reply("An error occurred while processing the command.");
    }
});
