const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage } = require('./store');
const config = require('../config');

const getMessageContent = (mek) => {
    if (mek.message?.conversation) return mek.message.conversation;
    if (mek.message?.extendedTextMessage?.text) return mek.message.extendedTextMessage.text;
    return '';
};

const DeletedText = async (conn, mek, jid, deleteInfo, isGroup, update) => {
    const messageContent = getMessageContent(mek);
    const alertText = `*⚠️ Deleted Message Alert 🚨*\n${deleteInfo}\n*╰▢ MESSAGE :* Content Below 🔽\n\n${messageContent}`;

    const mentionedJid = [];
    if (isGroup) {
        if (update.key.participant) mentionedJid.push(update.key.participant);
        if (mek.key.participant) mentionedJid.push(mek.key.participant);
    } else {
        if (mek.key.participant) mentionedJid.push(mek.key.participant);
        else if (mek.key.remoteJid) mentionedJid.push(mek.key.remoteJid);
    }

    await conn.sendMessage(
        jid,
        {
            text: alertText,
            contextInfo: {
                mentionedJid: mentionedJid.length ? mentionedJid : undefined,
            },
        },
        { quoted: mek }
    );
};

const DeletedMedia = async (conn, mek, jid, deleteInfo, messageType) => {
    // First send the alert text message
    const alertText = `*⚠️ Deleted Message Alert 🚨*\n${deleteInfo}\n*╰▢ MESSAGE :* Content Below 🔽`;
    
    // Send the alert text
    await conn.sendMessage(jid, { text: alertText }, { quoted: mek });

    // Then send the original media
    if (messageType === 'stickerMessage') {
        // For stickers - use the method from your example
        const stickerMessage = structuredClone(mek.message);
        await conn.relayMessage(jid, stickerMessage, {});
    } else if (messageType === 'imageMessage' || messageType === 'videoMessage' || messageType === 'documentMessage') {
        // For images/videos/documents - send with original caption
        const mediaMessage = structuredClone(mek.message);
        
        // Keep original caption if it exists
        if (messageType === 'imageMessage' && mediaMessage.imageMessage?.caption) {
            mediaMessage.imageMessage.caption = mediaMessage.imageMessage.caption;
        } else if (messageType === 'videoMessage' && mediaMessage.videoMessage?.caption) {
            mediaMessage.videoMessage.caption = mediaMessage.videoMessage.caption;
        } else if (messageType === 'documentMessage' && mediaMessage.documentMessage?.caption) {
            mediaMessage.documentMessage.caption = mediaMessage.documentMessage.caption;
        }
        
        // Add contextInfo to preserve quoted message if needed
        if (mediaMessage[messageType]) {
            mediaMessage[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.key.participant || mek.key.remoteJid,
                quotedMessage: mek.message,
            };
        }
        
        await conn.relayMessage(jid, mediaMessage, {});
    } else if (messageType === 'audioMessage' || messageType === 'voiceMessage') {
        // For audio and voice messages - forward as is
        await conn.relayMessage(jid, mek.message, {});
    }
};

const AntiDelete = async (conn, updates) => {
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    
    for (const update of updates) {
        if (update.update.message === null) {
            const store = await loadMessage(update.key.id);

            if (store && store.message) {
                const mek = store.message;
                
                // DON'T RECOVER if message was sent by the bot
                if (mek.key.fromMe) continue;
                
                // DON'T RECOVER if bot is the one deleting
                const deleterJid = update.key.participant || update.key.remoteJid;
                if (deleterJid === botNumber) continue;
                
                const isGroup = isJidGroup(store.jid);

                let deleteInfo, jid;
                if (isGroup) {
                    try {
                        const sender = mek.key.participant?.split('@')[0] || 'Unknown';
                        const deleter = update.key.participant?.split('@')[0] || 'Unknown';

                        deleteInfo = `*╭────⬡ KHAN-MD ⬡────*\n*├▢ SENDER :* @${sender}\n*├▢ DELETER :* @${deleter}\n*├▢ ACTION :* Deleted a Message`;
                        jid = config.ANTI_DELETE_PATH === "inbox" ? botNumber : store.jid;
                    } catch (e) {
                        console.error('Error getting group metadata:', e);
                        continue;
                    }
                } else {
                    const senderNumber = mek.key.participant?.split('@')[0] || mek.key.remoteJid?.split('@')[0] || 'Unknown';
                    const deleterNumber = update.key.participant?.split('@')[0] || update.key.remoteJid?.split('@')[0] || 'Unknown';
                    
                    deleteInfo = `*╭────⬡ KHAN-MD ⬡────*\n*├▢ SENDER :* @${senderNumber}\n*├▢ DELETER :* @${deleterNumber}\n*├▢ ACTION :* Deleted a Message`;
                    jid = config.ANTI_DELETE_PATH === "inbox" ? botNumber : update.key.remoteJid || store.jid;
                }

                const messageType = mek.message ? Object.keys(mek.message)[0] : null;
                
                if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
                    await DeletedText(conn, mek, jid, deleteInfo, isGroup, update);
                } else if (messageType && [
                    'imageMessage', 
                    'videoMessage', 
                    'stickerMessage', 
                    'documentMessage', 
                    'audioMessage',
                    'voiceMessage'
                ].includes(messageType)) {
                    await DeletedMedia(conn, mek, jid, deleteInfo, messageType);
                }
            }
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete,
};
