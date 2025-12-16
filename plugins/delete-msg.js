const { cmd } = require("../command");

cmd(
    {
        pattern: "del",
        desc: "Delete messages (creator only)",
        category: "owner",
        react: "🗑️",
        filename: __filename,
        use: "<reply to message>",
    },
    async (conn, mek, m, { args, q, reply, from, quoted, isGroup, isCreator, sender }) => {
        try {
            // Get the original message object
            const mek = m.mek || m;
            
            // Only creator can use this command
            if (!isCreator) {
                await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
                return reply("❌ This command is only for the bot creator!");
            }

            // Check if it's a quoted message
            if (!quoted) {
                await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
                return reply("🍁 Please reply to a message to delete it.");
            }

            // ⏳ React - processing
            await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

            // Get the quoted message object
            const quotedMsg = m.quoted || quoted;
            
            // Get the message key
            const messageKey = {
                remoteJid: from,
                fromMe: quotedMsg.key?.fromMe || false,
                id: quotedMsg.key?.id,
                participant: quotedMsg.key?.participant
            };

            // Check if bot is admin in group (for group mode)
            const isBotGroupAdmin = isGroup ? m.isBotAdmins : false;
            
            // Check if the quoted message is from bot itself
            const isBotMessage = quotedMsg.key?.fromMe || false;

            // GROUP MODE
            if (isGroup) {
                // Case 1: Bot replied to its own message
                if (isBotMessage) {
                    try {
                        // Delete for everyone (bot's own message)
                        await conn.sendMessage(from, {
                            delete: {
                                remoteJid: from,
                                fromMe: true,
                                id: quotedMsg.key.id,
                                participant: quotedMsg.key.participant
                            }
                        });
                        // ✅ React - success
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } catch (error) {
                        await conn.sendMessage(from, {
                            delete: {
                                remoteJid: from,
                                fromMe: true,
                                id: quotedMsg.key.id
                            }
                        });
                        // ✅ React - success (fallback)
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    }
                }
                // Case 2: Bot is admin and deleting others' messages
                else if (isBotGroupAdmin) {
                    try {
                        // Delete for everyone as admin
                        await conn.sendMessage(from, {
                            delete: {
                                remoteJid: from,
                                fromMe: false,
                                id: quotedMsg.key.id,
                                participant: quotedMsg.key.participant
                            }
                        });
                        // ✅ React - success
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } catch (error) {
                        // Fallback: delete only for bot
                        await conn.chatModify({
                            delete: true,
                            lastMessages: [{ key: quotedMsg.key, messageTimestamp: quotedMsg.messageTimestamp }]
                        }, from);
                        // ⚠️ React - partial success
                        await conn.sendMessage(from, { react: { text: '⚠️', key: m.key } });
                    }
                }
                // Case 3: Bot is not admin in group
                else {
                    // Delete only for bot
                    await conn.chatModify({
                        delete: true,
                        lastMessages: [{ key: quotedMsg.key, messageTimestamp: quotedMsg.messageTimestamp }]
                    }, from);
                    // ✅ React - success
                    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                }
            }
            // INBOX (PRIVATE CHAT) MODE
            else {
                // Case 1: Bot replied to its own message
                if (isBotMessage) {
                    try {
                        // Delete for everyone in inbox
                        await conn.sendMessage(from, {
                            delete: {
                                remoteJid: from,
                                fromMe: true,
                                id: quotedMsg.key.id
                            }
                        });
                        // ✅ React - success
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    } catch (error) {
                        // Fallback method
                        await conn.chatModify({
                            delete: true,
                            lastMessages: [{ key: quotedMsg.key, messageTimestamp: quotedMsg.messageTimestamp }]
                        }, from);
                        // ✅ React - success
                        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                    }
                }
                // Case 2: Bot deleting others' messages in inbox
                else {
                    // In inbox, can only delete for bot itself
                    await conn.chatModify({
                        delete: true,
                        lastMessages: [{ key: quotedMsg.key, messageTimestamp: quotedMsg.messageTimestamp }]
                    }, from);
                    // ✅ React - success
                    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
                }
            }

        } catch (error) {
            console.error("❌ Error in .del command:", error);
            // ❌ React - error
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        }
    }
);
