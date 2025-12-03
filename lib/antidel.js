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
    // First send the alert message for ALL media types
    const alertText = `*⚠️ Deleted Message Alert 🚨*\n${deleteInfo}\n*╰▢ MESSAGE :* Content Below 🔽`;
    await conn.sendMessage(jid, { text: alertText }, { quoted: mek });

    // Then send the actual media
    if (messageType === 'imageMessage') {
        const imageMsg = mek.message.imageMessage;
        const caption = imageMsg.caption || config.DESCRIPTION || '';
        await conn.sendMessage(
            jid,
            {
                image: { url: imageMsg.url || '' },
                caption: caption,
                mimetype: imageMsg.mimetype
            },
            { quoted: mek }
        );
    } 
    else if (messageType === 'videoMessage') {
        const videoMsg = mek.message.videoMessage;
        const caption = videoMsg.caption || config.DESCRIPTION || '';
        await conn.sendMessage(
            jid,
            {
                video: { url: videoMsg.url || '' },
                caption: caption,
                mimetype: videoMsg.mimetype
            },
            { quoted: mek }
        );
    }
    else if (messageType === 'stickerMessage') {
        await conn.sendMessage(
            jid,
            {
                sticker: { url: mek.message.stickerMessage.url || '' }
            },
            { quoted: mek }
        );
    }
    else if (messageType === 'audioMessage' || messageType === 'voiceMessage') {
        const audioMsg = mek.message[messageType];
        await conn.sendMessage(
            jid,
            {
                audio: { url: audioMsg.url || '' },
                mimetype: audioMsg.mimetype,
                ptt: messageType === 'voiceMessage'
            },
            { quoted: mek }
        );
    }
    else if (messageType === 'documentMessage') {
        const docMsg = mek.message.documentMessage;
        await conn.sendMessage(
            jid,
            {
                document: { url: docMsg.url || '' },
                fileName: docMsg.fileName || 'document',
                mimetype: docMsg.mimetype,
                caption: config.DESCRIPTION || ''
            },
            { quoted: mek }
        );
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
                        // Use config.ANTI_DELETE_PATH to determine where to send alert
                        jid = config.ANTI_DELETE_PATH === "inbox" ? conn.user.id.split(':')[0] + "@s.whatsapp.net" : store.jid;
                    } catch (e) {
                        console.error('Error getting group metadata:', e);
                        continue;
                    }
                } else {
                    const senderNumber = mek.key.participant?.split('@')[0] || mek.key.remoteJid?.split('@')[0] || 'Unknown';
                    const deleterNumber = update.key.participant?.split('@')[0] || update.key.remoteJid?.split('@')[0] || 'Unknown';
                    
                    deleteInfo = `*╭────⬡ KHAN-MD ⬡────*\n*├▢ SENDER :* @${senderNumber}\n*├▢ ACTION :* Deleted a Message`;
                    // Use config.ANTI_DELETE_PATH to determine where to send alert
                    jid = config.ANTI_DELETE_PATH === "inbox" ? conn.user.id.split(':')[0] + "@s.whatsapp.net" : update.key.remoteJid || store.jid;
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
