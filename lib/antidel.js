const { isJidGroup } = require('@whiskeysockets/baileys');
const { loadMessage } = require('../data');
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
    // First send the alert message for ALL media types
    const alertText = `*⚠️ Deleted Message Alert 🚨*\n${deleteInfo}\n*╰▢ MESSAGE :* Content Below 🔽`;
    await conn.sendMessage(jid, { text: alertText }, { quoted: mek });

    // Then send the actual media using the same method as document (which is already perfect)
    if (messageType === 'imageMessage' || messageType === 'videoMessage' || messageType === 'documentMessage') {
        // For images/videos/documents - use the same method that works perfectly for documents
        const antideletedmek = structuredClone(mek.message);
        if (antideletedmek[messageType]) {
            // Keep original caption handling as it is (already perfect)
            antideletedmek[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.key.participant || mek.key.remoteJid,
                quotedMessage: mek.message,
            };
        }
        await conn.relayMessage(jid, antideletedmek, {});
    } 
    else if (messageType === 'audioMessage' || messageType === 'voiceMessage') {
        // Handle both audio and voice messages
        const antideletedmek = structuredClone(mek.message);
        if (antideletedmek[messageType]) {
            antideletedmek[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.key.participant || mek.key.remoteJid,
                quotedMessage: mek.message,
            };
            // Set ptt for voice messages
            if (messageType === 'voiceMessage') {
                antideletedmek[messageType].ptt = true;
            }
        }
        await conn.relayMessage(jid, antideletedmek, {});
    }
    else if (messageType === 'stickerMessage') {
        // Handle stickers
        const antideletedmek = structuredClone(mek.message);
        if (antideletedmek[messageType]) {
            antideletedmek[messageType].contextInfo = {
                stanzaId: mek.key.id,
                participant: mek.key.participant || mek.key.remoteJid,
                quotedMessage: mek.message,
            };
        }
        await conn.relayMessage(jid, antideletedmek, {});
    }
};

const AntiDelete = async (conn, updates) => {
    // NOTE: ANTI_DELETE check is now handled in main.js
    // This function will only be called when ANTI_DELETE is "true"

    for (const update of updates) {
        if (update.update.message === null) {
            const store = await loadMessage(update.key.id);

            if (store && store.message) {
                const mek = store.message;
                const isGroup = isJidGroup(store.jid);

                let deleteInfo, jid;
                if (isGroup) {
                    try {
                        const sender = mek.key.participant?.split('@')[0] || 'Unknown';
                        const deleter = update.key.participant?.split('@')[0] || 'Unknown';

                        deleteInfo = `*╭────⬡ KHAN-MD ⬡────*\n*├▢ SENDER :* @${sender}\n*├▢ ACTION :* Deleted a Message`;
                        // FIXED: Proper JID formatting for inbox
                        jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id.split(':')[0] + "@s.whatsapp.net" : store.jid;
                    } catch (e) {
                        console.error('Error getting group metadata:', e);
                        continue;
                    }
                } else {
                    const senderNumber = mek.key.participant?.split('@')[0] || mek.key.remoteJid?.split('@')[0] || 'Unknown';
                    const deleterNumber = update.key.participant?.split('@')[0] || update.key.remoteJid?.split('@')[0] || 'Unknown';
                    
                    deleteInfo = `*╭────⬡ KHAN-MD ⬡────*\n*├▢ SENDER :* @${senderNumber}\n*├▢ ACTION :* Deleted a Message`;
                    // FIXED: Proper JID formatting for inbox
                    jid = config.ANTI_DEL_PATH === "inbox" ? conn.user.id.split(':')[0] + "@s.whatsapp.net" : update.key.remoteJid || store.jid;
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
