// Credits JawadTechX - KHAN-MD 💜

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const groupName = metadata.subject;
        const groupSize = metadata.participants.length;
        const timestamp = new Date().toLocaleString();

        for (const num of participants) {
            const userName = num.split("@")[0];
            let pfp;

            // WELCOME HANDLER - controlled by config.WELCOME
            if (update.action === 'add' && config.WELCOME === "true") {
                try {
                    pfp = await conn.profilePictureUrl(num, 'image');
                } catch (err) {
                    pfp = config.MENU_IMAGE_URL || "https://files.catbox.moe/7zfdcq.jpg";
                }

                const welcomeMsg = `*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄──*
*│  ̇─̣─̇─̣〘 ωєℓ¢σмє 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│❀ нєу* @${userName}!
*│❀ gʀσᴜᴘ* ${groupName}
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│● ѕтαу ѕαfє αɴ∂ fσℓℓσω*
*│● тнє gʀσυᴘѕ ʀᴜℓєѕ!*
*│● ᴊσιɴє∂ ${groupSize}*
*│● ©ᴘσωєʀє∂ ву ${config.BOT_NAME}*
*╰┉┉┉┉┈┈┈┈┈┈┈┈┉┉┉᛫᛭*`;

                await conn.sendMessage(update.id, {
                    image: { url: pfp },
                    caption: welcomeMsg,
                    mentions: [num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [num],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            }

            // GOODBYE HANDLER - also controlled by config.WELCOME (not separate config.GOODBYE)
            else if (update.action === 'remove' && config.WELCOME === "true") {
                const goodbyeMsg = `*╭ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄─ׂ┄─ׅ─ׂ┄──*
*│  ̇─̣─̇─̣〘 gσσ∂вує 〙̣─̇─̣─̇*
*├┅┅┅┅┈┈┈┈┈┈┈┈┈┅┅┅◆*
*│❀ ᴜѕєʀ* @${userName}
*│● мємвєʀѕ ιѕ ℓєfт тнє gʀσᴜᴘ*
*│● мємвєʀs ${groupSize}*
*│● ©ᴘσωєʀє∂ ву ${config.BOT_NAME}*
*╰┉┉┉┉┈┈┈┈┈┈┈┈┉┉┉᛫᛭*`;

                await conn.sendMessage(update.id, {
                    image: { url: config.MENU_IMAGE_URL || "https://files.catbox.moe/7zfdcq.jpg" },
                    caption: goodbyeMsg,
                    mentions: [num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [num],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            }

            // ADMIN PROMOTE HANDLER - controlled by config.ADMIN_ACTION
            else if (update.action === "promote" && config.ADMIN_ACTION === "true") {
                const promoter = update.author?.split("@")[0] || "Unknown";
                await conn.sendMessage(update.id, {
                    text: `╭─〔 *🎉 Admin Event* 〕\n` +
                          `├─ @${promoter} promoted @${userName}\n` +
                          `├─ *Time:* ${timestamp}\n` +
                          `├─ *Group:* ${groupName}\n` +
                          `╰─➤ *Powered by ${config.BOT_NAME}*`,
                    mentions: [update.author, num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [update.author, num],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            }

            // ADMIN DEMOTE HANDLER - also controlled by config.ADMIN_ACTION
            else if (update.action === "demote" && config.ADMIN_ACTION === "true") {
                const demoter = update.author?.split("@")[0] || "Unknown";
                await conn.sendMessage(update.id, {
                    text: `╭─〔 *⚠️ Admin Event* 〕\n` +
                          `├─ @${demoter} demoted @${userName}\n` +
                          `├─ *Time:* ${timestamp}\n` +
                          `├─ *Group:* ${groupName}\n` +
                          `╰─➤ *Powered by ${config.BOT_NAME}*`,
                    mentions: [update.author, num],
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [update.author, num],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: config.BOT_NAME,
                            newsletterJid: "120363354023106228@newsletter",
                        },
                    }
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
