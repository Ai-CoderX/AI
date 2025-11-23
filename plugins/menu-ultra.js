const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const fs = require('fs');
const path = require('path');

// Helper function for small caps text
const toSmallCaps = (text) => {
    if (!text || typeof text !== 'string') return '';
    const smallCapsMap = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
        'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
        's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ',
        'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
        'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
        'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ'
    };
    return text.split('').map(char => smallCapsMap[char] || char).join('');
};

// Format category with your exact styles
const formatCategory = (category, cmds) => {
    // Filter out commands with empty or undefined patterns
    const validCmds = cmds.filter(cmd => cmd.pattern && cmd.pattern.trim() !== '');
    
    if (validCmds.length === 0) return ''; // Skip empty categories
    
    let title = `\n\`『 ${category.toUpperCase()} 』\`\n╭───────────────────⊷\n`;
    let body = validCmds.map(cmd => {
        const commandName = cmd.pattern || '';
        return `*┋ ⬡ ${toSmallCaps(commandName)}*`;
    }).join('\n');
    let footer = `\n╰───────────────────⊷`;
    return `${title}${body}${footer}`;
};

// Format menu options with same font style as category
const formatMenuOptions = (categories) => {
    let menuOptions = '';
    let optionNumber = 1;
    
    categories.forEach(cat => {
        // Capitalize first letter of category and convert to small caps
        const displayName = toSmallCaps(cat.charAt(0).toUpperCase() + cat.slice(1));
        const menuText = toSmallCaps(' Menu'); // Add "Menu" in small caps
        menuOptions += `*┋ ⬡ ${optionNumber}. ${displayName}${menuText}*\n`;
        optionNumber++;
    });
    
    return menuOptions;
};

const commonContextInfo = (sender) => ({
    mentionedJid: [sender],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363354023106228@newsletter',
        newsletterName: config.BOT_NAME,
        serverMessageId: 143
    }
});

// Get all categories and organize them
const getCategorizedCommands = () => {
    let totalCommands = Object.keys(commands).length;
    
    // Get all unique categories and filter out undefined/null categories
    const categories = [...new Set(Object.values(commands).map(c => c.category))].filter(cat => 
        cat && cat.trim() !== '' && cat !== 'undefined'
    );
    
    // Organize commands by category and filter out empty categories
    const categorized = {};
    categories.forEach(cat => {
        const categoryCommands = Object.values(commands).filter(c => c.category === cat);
        // Only add category if it has valid commands
        const validCommands = categoryCommands.filter(cmd => cmd.pattern && cmd.pattern.trim() !== '');
        if (validCommands.length > 0) {
            categorized[cat] = validCommands;
        }
    });

    return { categorized, totalCommands };
};

cmd({
    pattern: "menu",
    alias: ["m", "help"],
    desc: "Show all bot commands in selection menu",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, sender, pushname, reply }) => {
    try {
        const { categorized, totalCommands } = getCategorizedCommands();
        
        // Create menu options from ALL available categories
        const availableCategories = Object.keys(categorized);
        const menuOptions = formatMenuOptions(availableCategories);

        const caption = `*╭┈───〔 ${config.BOT_NAME} 〕┈───⊷*
*├▢ 🇵🇸 Owner:* ${config.OWNER_NAME}
*├▢ 🪄 Prefix:* ${config.PREFIX}
*├▢ 🎐 Version:* 5.0.0 Bᴇᴛᴀ
*├▢ ☁️ Platform:* Heroku
*├▢ 📜 Plugins:* ${totalCommands}
*├▢ ⏰ Runtime:* ${runtime(process.uptime())}
*╰───────────────────⊷*
*╭───⬡ SELECT MENU ⬡───*
${menuOptions}*╰───────────────────⊷*

> *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴛᴏ sᴇʟᴇᴄᴛ ᴍᴇɴᴜ (1-${availableCategories.length})*`;

        // Send menu image with caption
        const sentMsg = await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://i.ibb.co/ns3bgQyx/IMG-20251016-WA0020.jpg' },
            caption: caption,
            contextInfo: commonContextInfo(sender)
        }, { quoted: mek });

        // Send audio voice message
        const audioPath = path.join(__dirname, '../assets/menux.m4a');
        if (fs.existsSync(audioPath)) {
            await conn.sendMessage(from, {
                audio: { url: audioPath },
                mimetype: 'audio/mp4',
                ptt: false
            }, { quoted: mek });
        } else {
            console.log("Menu audio file not found");
        }

        const messageID = sentMsg.key.id;

        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                await conn.sendMessage(senderID, {
                    react: { text: '⬇️', key: receivedMsg.key }
                });

                const selectedNumber = parseInt(receivedText);
                if (selectedNumber >= 1 && selectedNumber <= availableCategories.length) {
                    const selectedCategory = availableCategories[selectedNumber - 1];
                    const categoryCommands = categorized[selectedCategory];
                    
                    // Capitalize first letter for display
                    const displayName = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
                    
                    // Build category menu with same style as menu2
                    const categorySection = formatCategory(selectedCategory, categoryCommands);
                    
                    let categoryMenu = `*╭┈───〔 ${displayName} Menu 〕┈───⊷*\n`;
                    categoryMenu += `*├▢ 📜 Category:* ${selectedCategory}\n`;
                    categoryMenu += `*├▢ 🔢 Total Commands:* ${categoryCommands.length}\n`;
                    categoryMenu += `*╰───────────────────⊷*`;
                    categoryMenu += `${categorySection}\n\n`;
                    categoryMenu += `> *ᴜsᴇ ${config.PREFIX}ᴍᴇɴᴜ ᴛᴏ sᴇᴇ ᴀʟʟ ᴍᴇɴᴜs ᴀɢᴀɪɴ*`;

                    await conn.sendMessage(senderID, {
                        image: { url: config.MENU_IMAGE_URL || 'https://ibb.co/wrzgnwN5' },
                        caption: categoryMenu,
                        contextInfo: commonContextInfo(receivedMsg.key.participant || receivedMsg.key.remoteJid)
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(senderID, {
                        text: `❌ *Invalid selection! Please reply with a valid number (1-${availableCategories.length}).*`,
                        contextInfo: commonContextInfo(receivedMsg.key.participant || receivedMsg.key.remoteJid)
                    }, { quoted: receivedMsg });
                }
            }
        });

    } catch (e) {
        console.error(e);
        reply(`❌ Error:\n${e}`);
    }
});
