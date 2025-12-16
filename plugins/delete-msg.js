const { cmd } = require("../command");

cmd(
    {
        pattern: "del",
        alias: ["delete"],
        desc: "Delete messages (creator only)",
        category: "owner",
        react: "🗑️",
        filename: __filename,
        use: "<reply to message>",
    },
    async (conn, mek, m, { from, quoted, isGroup, isCreator, sender, isBotAdmins, isAdmins, reply, groupAdmins, participants }) => {
        try {
            // React - processing
            await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
            
            // Only creator can use this command
            if (!isCreator) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return reply("❌ This command is only for the bot creator!");
            }

            // Check if it's a quoted message
            if (!quoted) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return reply("🍁 Please reply to a message to delete it.");
            }

            // Get the quoted message object
            const quotedMsg = m.quoted || quoted;
            
            // Create message key for deletion
            const key = {
                remoteJid: from,
                fromMe: quotedMsg.key?.fromMe || false,
                id: quotedMsg.key?.id,
                participant: quotedMsg.key?.participant || quotedMsg.sender
            };

            // Check if the quoted message is from bot itself
            const isBotMessage = quotedMsg.key?.fromMe || false;

            // GROUP MODE
            if (isGroup) {
                // Case 1: Bot replied to its own message
                if (isBotMessage) {
                    try {
                        // Delete bot's own message for everyone
                        key.fromMe = true;
                        await conn.sendMessage(from, { delete: key });
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } catch (error) {
                        // Fallback if above fails
                        await conn.sendMessage(from, { delete: key });
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    }
                }
                // Case 2: Bot is admin and deleting others' messages
                else if (isBotAdmins) {
                    try {
                        // Delete for everyone as admin
                        key.fromMe = false;
                        await conn.sendMessage(from, { delete: key });
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } catch (error) {
                        // Fallback: Try alternative method
                        try {
                            await conn.sendMessage(from, { delete: key });
                            await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                        } catch (err) {
                            await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
                            reply("⚠️ Couldn't delete message. Bot might need admin rights.");
                        }
                    }
                }
                // Case 3: Bot is not admin in group
                else {
                    // Can only delete bot's own messages when not admin
                    if (isBotMessage) {
                        key.fromMe = true;
                        await conn.sendMessage(from, { delete: key });
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } else {
                        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                        reply("❌ Bot is not admin. Can only delete bot's own messages.");
                    }
                }
            }
            // INBOX (PRIVATE CHAT) MODE
            else {
                // Case 1: Bot replied to its own message
                if (isBotMessage) {
                    try {
                        // Delete bot's own message
                        key.fromMe = true;
                        await conn.sendMessage(from, { delete: key });
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } catch (error) {
                        // Fallback
                        await conn.sendMessage(from, { delete: key });
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    }
                }
                // Case 2: Bot deleting others' messages in inbox
                else {
                    // In inbox, bot can try to delete others' messages
                    // WhatsApp might not allow this, but we try
                    try {
                        key.fromMe = false;
                        await conn.sendMessage(from, { delete: key });
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } catch (error) {
                        await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
                        reply("⚠️ Couldn't delete message in private chat.");
                    }
                }
            }

        } catch (error) {
            console.error("❌ Error in .del command:", error);
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            reply(`❌ *Error:* ${error.message}`);
        }
    }
);
