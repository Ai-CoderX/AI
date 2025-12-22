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

