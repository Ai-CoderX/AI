const config = require('../config');
const { proto, downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys")
const fs = require('fs')

// Utility function to safely handle protobuf objects
const decodeAndHydrate = (message) => {
    if (!message) return null;
    
    try {
        // Use protobuf utilities properly
        if (Buffer.isBuffer(message)) {
            return proto.WebMessageInfo.decode(message);
        } else if (typeof message === 'string') {
            return JSON.parse(message);
        } else {
            // Already decoded or object
            return message;
        }
    } catch (error) {
        console.error('Error decoding message:', error);
        return null;
    }
}

// Create protobuf object properly
const createProtoObject = (obj) => {
    try {
        return proto.WebMessageInfo.create(obj);
    } catch (error) {
        console.error('Error creating proto object:', error);
        return null;
    }
}

const downloadMediaMessage = async(m, filename) => {
    if (!m || !m.msg) {
        throw new Error('Invalid message object');
    }
    
    // Handle viewOnceMessage
    if (m.type === 'viewOnceMessage') {
        m.type = m.msg.type
    }
    
    try {
        if (m.type === 'imageMessage') {
            const nameJpg = filename ? filename + '.jpg' : 'undefined.jpg'
            const stream = await downloadContentFromMessage(m.msg, 'image')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            fs.writeFileSync(nameJpg, buffer)
            return fs.readFileSync(nameJpg)
        } else if (m.type === 'videoMessage') {
            const nameMp4 = filename ? filename + '.mp4' : 'undefined.mp4'
            const stream = await downloadContentFromMessage(m.msg, 'video')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            fs.writeFileSync(nameMp4, buffer)
            return fs.readFileSync(nameMp4)
        } else if (m.type === 'audioMessage') {
            const nameMp3 = filename ? filename + '.mp3' : 'undefined.mp3'
            const stream = await downloadContentFromMessage(m.msg, 'audio')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            fs.writeFileSync(nameMp3, buffer)
            return fs.readFileSync(nameMp3)
        } else if (m.type === 'stickerMessage') {
            const nameWebp = filename ? filename + '.webp' : 'undefined.webp'
            const stream = await downloadContentFromMessage(m.msg, 'sticker')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            fs.writeFileSync(nameWebp, buffer)
            return fs.readFileSync(nameWebp)
        } else if (m.type === 'documentMessage') {
            const ext = m.msg.fileName ? 
                m.msg.fileName.split('.').pop().toLowerCase()
                    .replace('jpeg', 'jpg')
                    .replace('png', 'jpg')
                    .replace('m4a', 'mp3') : 'bin'
            const nameDoc = filename ? filename + '.' + ext : 'undefined.' + ext
            const stream = await downloadContentFromMessage(m.msg, 'document')
            let buffer = Buffer.from([])
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk])
            }
            fs.writeFileSync(nameDoc, buffer)
            return fs.readFileSync(nameDoc)
        } else {
            throw new Error(`Unsupported message type: ${m.type}`)
        }
    } catch (error) {
        console.error('Error downloading media:', error);
        throw error;
    }
}

const sms = (conn, m, store) => {
    if (!m) return m
    
    // Decode and hydrate the message properly
    const decodedMessage = decodeAndHydrate(m);
    if (!decodedMessage) return m;
    
    // Use the decoded message
    m = decodedMessage;
    
    // Handle message key properties
    if (m.key) {
        m.id = m.key.id
        m.isBot = m.id && m.id.startsWith('BAES') && m.id.length === 16
        m.isBaileys = m.id && m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe || false
        m.isGroup = m.chat && m.chat.endsWith('@g.us')
        m.sender = m.fromMe ? 
            (conn.user && conn.user.id ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : '') : 
            (m.isGroup ? m.key.participant : m.key.remoteJid)
    }
    
    // Handle message content
    if (m.message) {
        m.mtype = getContentType(m.message)
        
        // Safely extract message content
        if (m.mtype === 'viewOnceMessage' && m.message[m.mtype] && m.message[m.mtype].message) {
            const viewOnceContentType = getContentType(m.message[m.mtype].message);
            m.msg = m.message[m.mtype].message[viewOnceContentType] || {};
        } else if (m.mtype && m.message[m.mtype]) {
            m.msg = m.message[m.mtype];
        } else {
            m.msg = {};
        }
        
        // Extract message body/text
        try {
            m.body = (m.mtype === 'conversation') ? m.message.conversation || '' : 
                     (m.mtype === 'imageMessage' && m.message.imageMessage && m.message.imageMessage.caption) ? m.message.imageMessage.caption : 
                     (m.mtype === 'videoMessage' && m.message.videoMessage && m.message.videoMessage.caption) ? m.message.videoMessage.caption : 
                     (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage && m.message.extendedTextMessage.text) ? m.message.extendedTextMessage.text : 
                     (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage) ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (m.mtype === 'listResponseMessage' && m.message.listResponseMessage && m.message.listResponseMessage.singleSelectReply) ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                     (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage) ? m.message.templateButtonReplyMessage.selectedId : 
                     (m.mtype === 'messageContextInfo') ? 
                         (m.message.buttonsResponseMessage?.selectedButtonId || 
                          m.message.listResponseMessage?.singleSelectReply?.selectedRowId || 
                          (m.text || '')) : '';
        } catch (error) {
            console.error('Error extracting message body:', error)
            m.body = ''
        }
        
        // Safely handle quoted messages and contextInfo
        const contextInfo = m.msg && m.msg.contextInfo ? m.msg.contextInfo : null;
        m.quoted = contextInfo && contextInfo.quotedMessage ? contextInfo.quotedMessage : null;
        m.mentionedJid = contextInfo && contextInfo.mentionedJid ? [...contextInfo.mentionedJid] : [];
       
        if (m.quoted) {
            const quotedType = getContentType(m.quoted);
            let quotedContent = m.quoted[quotedType];
            
            if (!quotedContent) {
                m.quoted = {};
            } else {
                // Handle productMessage
                if (quotedType === 'productMessage') {
                    const productContentType = getContentType(quotedContent);
                    quotedContent = quotedContent[productContentType] || {};
                }
                
                if (typeof quotedContent === 'string') {
                    quotedContent = { text: quotedContent };
                }
                
                // Handle viewOnceMessageV2
                if (quotedType === 'viewOnceMessageV2') {
                    console.log("View Once Message V2 detected in quote");
                    m.quoted = { 
                        mtype: quotedType,
                        isViewOnce: true,
                        ...quotedContent 
                    };
                } else {
                    m.quoted = {
                        mtype: quotedType,
                        ...quotedContent,
                        id: contextInfo && contextInfo.stanzaId ? contextInfo.stanzaId : null,
                        chat: contextInfo ? (contextInfo.remoteJid || m.chat) : m.chat,
                        isBot: contextInfo && contextInfo.stanzaId ? 
                            (contextInfo.stanzaId.startsWith('BAES') && contextInfo.stanzaId.length === 16) : false,
                        isBaileys: contextInfo && contextInfo.stanzaId ? 
                            (contextInfo.stanzaId.startsWith('BAE5') && contextInfo.stanzaId.length === 16) : false,
                        sender: contextInfo && contextInfo.participant ? 
                            conn.decodeJid(contextInfo.participant) : null,
                        fromMe: contextInfo && contextInfo.participant ? 
                            (conn.decodeJid(contextInfo.participant) === (conn.user && conn.user.id)) : false,
                        text: quotedContent.text || quotedContent.caption || quotedContent.conversation || 
                              quotedContent.contentText || quotedContent.selectedDisplayText || quotedContent.title || '',
                        mentionedJid: contextInfo && contextInfo.mentionedJid ? [...contextInfo.mentionedJid] : []
                    };
                    
                    // Get quoted message function
                    m.getQuotedObj = m.getQuotedMessage = async () => {
                        if (!m.quoted.id || !store || !store.loadMessage) return false;
                        try {
                            const q = await store.loadMessage(m.chat, m.quoted.id, conn);
                            return sms(conn, q, store);
                        } catch (error) {
                            console.error('Error loading quoted message:', error);
                            return false;
                        }
                    };
                    
                    // Create fake object for quoted message
                    const quotedFakeObj = createProtoObject({
                        key: {
                            remoteJid: m.quoted.chat,
                            fromMe: m.quoted.fromMe,
                            id: m.quoted.id,
                            ...(m.isGroup && m.quoted.sender ? { participant: m.quoted.sender } : {})
                        },
                        message: m.quoted
                    });
                    
                    if (quotedFakeObj) {
                        m.quoted.fakeObj = quotedFakeObj;
                    }
                    
                    // Delete quoted message
                    m.quoted.delete = async () => {
                        if (conn && conn.sendMessage) {
                            const key = {
                                remoteJid: m.chat,
                                fromMe: false,
                                id: m.quoted.id,
                                participant: m.quoted.sender
                            };
                            return await conn.sendMessage(m.chat, { delete: key });
                        }
                    };

                    // Forward message
                    m.forwardMessage = (jid, forceForward = true, options = {}) => {
                        if (conn && conn.copyNForward && m.quoted.fakeObj) {
                            return conn.copyNForward(jid, m.quoted.fakeObj, forceForward, {
                                contextInfo: { isForwarded: false },
                                ...options
                            });
                        }
                    };

                    // Download quoted media
                    m.quoted.download = () => {
                        if (conn && conn.downloadMediaMessage) {
                            return conn.downloadMediaMessage(m.quoted);
                        }
                    };
                }
            }
        }
    }
    
    // Add download function if message has URL
    if (m.msg && m.msg.url && conn && conn.downloadMediaMessage) {
        m.download = () => conn.downloadMediaMessage(m.msg);
    }
    
    // Extract text content
    m.text = m.msg ? (m.msg.text || m.msg.caption || '') : 
             m.message && m.message.conversation ? m.message.conversation : 
             m.msg ? (m.msg.contentText || m.msg.selectedDisplayText || m.msg.title || '') : '';
    
    // Helper function to check if string is URL
    const isUrl = (str) => {
        if (typeof str !== 'string') return false;
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    };
    
    /**
     * Reply to this message
     */
    m.reply = async (content, opt = { packname: "Secktor", author: "SamPandey001" }, type = "text") => {
        if (!conn || !conn.sendMessage) {
            console.error('Connection or sendMessage method not available');
            return null;
        }
        
        try {
            switch (type.toLowerCase()) {
                case "text":
                    return await conn.sendMessage(m.chat, { text: content }, { quoted: m, ...opt });
                
                case "image":
                    if (Buffer.isBuffer(content)) {
                        return await conn.sendMessage(m.chat, { image: content, ...opt }, { quoted: m });
                    } else if (isUrl(content)) {
                        return await conn.sendMessage(m.chat, { image: { url: content }, ...opt }, { quoted: m });
                    }
                    break;
                
                case "video":
                    if (Buffer.isBuffer(content)) {
                        return await conn.sendMessage(m.chat, { video: content, ...opt }, { quoted: m });
                    } else if (isUrl(content)) {
                        return await conn.sendMessage(m.chat, { video: { url: content }, ...opt }, { quoted: m });
                    }
                    break;
                
                case "audio":
                    if (Buffer.isBuffer(content)) {
                        return await conn.sendMessage(m.chat, { audio: content, ...opt }, { quoted: m });
                    } else if (isUrl(content)) {
                        return await conn.sendMessage(m.chat, { audio: { url: content }, ...opt }, { quoted: m });
                    }
                    break;
                
                default:
                    return await conn.sendMessage(m.chat, { text: content }, { quoted: m, ...opt });
            }
        } catch (error) {
            console.error('Error in reply function:', error);
            throw error;
        }
    };
    
    /**
     * Copy this message using protobuf create()
     */
    m.copy = () => {
        try {
            const msgObj = createProtoObject(m);
            return sms(conn, msgObj, store);
        } catch (error) {
            console.error('Error copying message:', error);
            return m;
        }
    };
    
    /**
     * Copy and forward
     */
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => {
        if (conn && conn.copyNForward) {
            return conn.copyNForward(jid, m, forceForward, options);
        }
    };
    
    /**
     * Send sticker
     */
    m.sticker = (stik, id = m.chat, option = { mentions: [m.sender] }) => {
        if (!conn || !conn.sendMessage) return null;
        return conn.sendMessage(id, { 
            sticker: stik, 
            contextInfo: { mentionedJid: option.mentions } 
        }, { quoted: m, ...option });
    };
    
    /**
     * Reply with image
     */
    m.replyimg = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => {
        if (!conn || !conn.sendMessage) return null;
        return conn.sendMessage(id, { 
            image: img, 
            caption: teks, 
            contextInfo: { mentionedJid: option.mentions } 
        }, { quoted: m, ...option });
    };
    
    /**
     * Reply with image URL
     */
    m.imgurl = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => {
        if (!conn || !conn.sendMessage) return null;
        return conn.sendMessage(id, { 
            image: { url: img }, 
            caption: teks, 
            contextInfo: { mentionedJid: option.mentions } 
        }, { quoted: m, ...option });
    };
    
    /**
     * Send document
     */
    m.senddoc = (doc, type, id = m.chat, option = {}) => {
        if (!conn || !conn.sendMessage) return null;
        
        const options = {
            mentions: [m.sender],
            filename: config.ownername || 'document',
            mimetype: type,
            externalAdRepl: {
                title: config.ownername || 'Document',
                body: ' ',
                thumbnail: null,
                mediaType: 1,
                sourceUrl: '',
            },
            ...option
        };
        
        return conn.sendMessage(id, { 
            document: doc, 
            mimetype: options.mimetype, 
            fileName: options.filename, 
            contextInfo: {
                externalAdReply: options.externalAdRepl,
                mentionedJid: options.mentions
            } 
        }, { quoted: m, ...options });
    };
    
    /**
     * Send contact
     */
    m.sendcontact = (name, info, number) => {
        if (!conn || !conn.sendMessage) return null;
        
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${info}
TEL;type=CELL;type=VOICE;waid=${number}:+${number}
END:VCARD`;
        
        return conn.sendMessage(m.chat, { 
            contacts: { 
                displayName: name, 
                contacts: [{ vcard }] 
            } 
        }, { quoted: m });
    };
    
    /**
     * React to message
     */
    m.react = (emoji) => {
        if (!conn || !conn.sendMessage || !m.key) return null;
        return conn.sendMessage(m.chat, { 
            react: { 
                text: emoji, 
                key: m.key 
            } 
        });
    };

    return m;
}

module.exports = { sms, downloadMediaMessage };
