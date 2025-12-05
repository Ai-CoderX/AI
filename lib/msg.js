const config = require('../config');
const { proto, downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys")
const fs = require('fs')

const downloadMediaMessage = async(m, filename) => {
    if (!m || !m.msg) {
        throw new Error('Invalid message object');
    }
    
    if (m.type === 'viewOnceMessage') {
        m.type = m.msg.type
    }
    
    if (m.type === 'imageMessage') {
        var nameJpg = filename ? filename + '.jpg' : 'undefined.jpg'
        const stream = await downloadContentFromMessage(m.msg, 'image')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameJpg, buffer)
        return fs.readFileSync(nameJpg)
    } else if (m.type === 'videoMessage') {
        var nameMp4 = filename ? filename + '.mp4' : 'undefined.mp4'
        const stream = await downloadContentFromMessage(m.msg, 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameMp4, buffer)
        return fs.readFileSync(nameMp4)
    } else if (m.type === 'audioMessage') {
        var nameMp3 = filename ? filename + '.mp3' : 'undefined.mp3'
        const stream = await downloadContentFromMessage(m.msg, 'audio')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameMp3, buffer)
        return fs.readFileSync(nameMp3)
    } else if (m.type === 'stickerMessage') {
        var nameWebp = filename ? filename + '.webp' : 'undefined.webp'
        const stream = await downloadContentFromMessage(m.msg, 'sticker')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
        fs.writeFileSync(nameWebp, buffer)
        return fs.readFileSync(nameWebp)
    } else if (m.type === 'documentMessage') {
        var ext = m.msg.fileName ? m.msg.fileName.split('.').pop().toLowerCase().replace('jpeg', 'jpg').replace('png', 'jpg').replace('m4a', 'mp3') : 'bin'
        var nameDoc = filename ? filename + '.' + ext : 'undefined.' + ext
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
}

const sms = (conn, m, store) => {
    if (!m) return m
    
    let M = proto.WebMessageInfo
    
    // Handle message key properties
    if (m.key) {
        m.id = m.key.id
        m.isBot = m.id.startsWith('BAES') && m.id.length === 16
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16
        m.chat = m.key.remoteJid
        m.fromMe = m.key.fromMe
        m.isGroup = m.chat && m.chat.endsWith('@g.us')
        m.sender = m.fromMe ? conn.user.id.split(':')[0]+'@s.whatsapp.net' : 
                   m.isGroup ? m.key.participant : m.key.remoteJid
    }
    
    // Handle message content
    if (m.message) {
        m.mtype = getContentType(m.message)
        
        // Safely extract message content
        if (m.mtype === 'viewOnceMessage' && m.message[m.mtype] && m.message[m.mtype].message) {
            m.msg = m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
        } else if (m.mtype && m.message[m.mtype]) {
            m.msg = m.message[m.mtype]
        } else {
            m.msg = {}
        }
        
        try {
            m.body = (m.mtype === 'conversation') ? m.message.conversation : 
                     (m.mtype == 'imageMessage' && m.message.imageMessage && m.message.imageMessage.caption) ? m.message.imageMessage.caption : 
                     (m.mtype == 'videoMessage' && m.message.videoMessage && m.message.videoMessage.caption) ? m.message.videoMessage.caption : 
                     (m.mtype == 'extendedTextMessage' && m.message.extendedTextMessage && m.message.extendedTextMessage.text) ? m.message.extendedTextMessage.text : 
                     (m.mtype == 'buttonsResponseMessage' && m.message.buttonsResponseMessage) ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (m.mtype == 'listResponseMessage' && m.message.listResponseMessage) ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                     (m.mtype == 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage) ? m.message.templateButtonReplyMessage.selectedId : 
                     (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.text) : '';
        } catch (error) {
            console.error('Error extracting message body:', error)
            m.body = ''
        }
        
        // Safely handle quoted messages and contextInfo
        let contextInfo = m.msg && m.msg.contextInfo ? m.msg.contextInfo : null
        m.quoted = contextInfo ? contextInfo.quotedMessage : null
        m.mentionedJid = contextInfo ? (contextInfo.mentionedJid || []) : []
       
        if (m.quoted) {
            let type = getContentType(m.quoted)
            m.quoted = m.quoted[type]
            
            if (!m.quoted) {
                m.quoted = {}
            } else {
                if (['productMessage'].includes(type)) {
                    type = getContentType(m.quoted)
                    m.quoted = m.quoted[type] || {}
                }
                
                if (typeof m.quoted === 'string') {
                    m.quoted = { text: m.quoted }
                }
                
                // Handle viewOnceMessageV2
                if (type === 'viewOnceMessageV2') {
                    console.log("View Once Message detected")
                    // Handle view once message if needed
                } else {
                    m.quoted.mtype = type
                    m.quoted.id = contextInfo ? contextInfo.stanzaId : null
                    m.quoted.chat = contextInfo ? (contextInfo.remoteJid || m.chat) : m.chat
                    m.quoted.isBot = m.quoted.id ? m.quoted.id.startsWith('BAES') && m.quoted.id.length === 16 : false
                    m.quoted.isBaileys = m.quoted.id ? m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16 : false
                    m.quoted.sender = contextInfo ? conn.decodeJid(contextInfo.participant) : null
                    m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.id)
                    m.quoted.text = m.quoted.text || m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || ''
                    m.quoted.mentionedJid = contextInfo ? (contextInfo.mentionedJid || []) : []
                    
                    m.getQuotedObj = m.getQuotedMessage = async () => {
                        if (!m.quoted.id) return false
                        let q = await store.loadMessage(m.chat, m.quoted.id, conn)
                        return exports.sms(conn, q, store)
                    }
                    
                    let vM = m.quoted.fakeObj = M.fromObject({
                        key: {
                            remoteJid: m.quoted.chat,
                            fromMe: m.quoted.fromMe,
                            id: m.quoted.id
                        },
                        message: m.quoted,
                        ...(m.isGroup ? { participant: m.quoted.sender } : {})
                    })
                    
                    let { chat, fromMe, id } = m.quoted
                    const key = {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: m.quoted.id,
                        participant: m.quoted.sender
                    }
                    
                    m.quoted.delete = async() => {
                        if (conn.sendMessage) {
                            return await conn.sendMessage(m.chat, { delete: key })
                        }
                    }

                    m.forwardMessage = (jid, forceForward = true, options = {}) => {
                        if (conn.copyNForward) {
                            return conn.copyNForward(jid, vM, forceForward, {contextInfo: {isForwarded: false}}, options)
                        }
                    }

                    m.quoted.download = () => {
                        if (conn.downloadMediaMessage) {
                            return conn.downloadMediaMessage(m.quoted)
                        }
                    }
                }
            }
        }
    }
    
    // Add download function if message has URL
    if (m.msg && m.msg.url) {
        m.download = () => {
            if (conn.downloadMediaMessage) {
                return conn.downloadMediaMessage(m.msg)
            }
        }
    }
    
    // Extract text content
    m.text = m.msg && (m.msg.text || m.msg.caption) || 
             m.message && m.message.conversation || 
             m.msg && (m.msg.contentText || m.msg.selectedDisplayText || m.msg.title) || ''
    
    /**
     * Reply to this message
     */
    m.reply = async (content, opt = { packname: "Secktor", author: "SamPandey001" }, type = "text") => {
        // Helper function to check if string is URL
        const isUrl = (str) => {
            try {
                new URL(str)
                return true
            } catch {
                return false
            }
        }
        
        switch (type.toLowerCase()) {
            case "text":
                return await conn.sendMessage(m.chat, { text: content }, { quoted: m })
            case "image":
                if (Buffer.isBuffer(content)) {
                    return await conn.sendMessage(m.chat, { image: content, ...opt }, { quoted: m })
                } else if (isUrl(content)) {
                    return await conn.sendMessage(m.chat, { image: { url: content }, ...opt }, { quoted: m })
                }
                break
            case "video":
                if (Buffer.isBuffer(content)) {
                    return await conn.sendMessage(m.chat, { video: content, ...opt }, { quoted: m })
                } else if (isUrl(content)) {
                    return await conn.sendMessage(m.chat, { video: { url: content }, ...opt }, { quoted: m })
                }
                break
            case "audio":
                if (Buffer.isBuffer(content)) {
                    return await conn.sendMessage(m.chat, { audio: content, ...opt }, { quoted: m })
                } else if (isUrl(content)) {
                    return await conn.sendMessage(m.chat, { audio: { url: content }, ...opt }, { quoted: m })
                }
                break
            default:
                return await conn.sendMessage(m.chat, { text: content }, { quoted: m })
        }
    }
    
    /**
     * Copy this message
     */
    m.copy = () => exports.sms(conn, M.fromObject(M.toObject(m)))
    
    /**
     * Copy and forward
     */
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => {
        if (conn.copyNForward) {
            return conn.copyNForward(jid, m, forceForward, options)
        }
    }
    
    /**
     * Send sticker
     */
    m.sticker = (stik, id = m.chat, option = { mentions: [m.sender] }) => {
        return conn.sendMessage(id, { 
            sticker: stik, 
            contextInfo: { mentionedJid: option.mentions } 
        }, { quoted: m })
    }
    
    /**
     * Reply with image
     */
    m.replyimg = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => {
        return conn.sendMessage(id, { 
            image: img, 
            caption: teks, 
            contextInfo: { mentionedJid: option.mentions } 
        }, { quoted: m })
    }
    
    /**
     * Reply with image URL
     */
    m.imgurl = (img, teks, id = m.chat, option = { mentions: [m.sender] }) => {
        return conn.sendMessage(id, { 
            image: { url: img }, 
            caption: teks, 
            contextInfo: { mentionedJid: option.mentions } 
        }, { quoted: m })
    }
    
    /**
     * Send document
     */
    m.senddoc = (doc, type, id = m.chat, option = { 
        mentions: [m.sender], 
        filename: config.ownername || 'document', 
        mimetype: type,
        externalAdRepl: {
            title: config.ownername || 'Document',
            body: ' ',
            thumbnail: null,
            mediaType: 1,
            sourceUrl: '',
        } 
    }) => {
        return conn.sendMessage(id, { 
            document: doc, 
            mimetype: option.mimetype, 
            fileName: option.filename, 
            contextInfo: {
                externalAdReply: option.externalAdRepl,
                mentionedJid: option.mentions
            } 
        }, { quoted: m })
    }
    
    /**
     * Send contact
     */
    m.sendcontact = (name, info, number) => {
        var vcard = 'BEGIN:VCARD\n' + 
                    'VERSION:3.0\n' + 
                    'FN:' + name + '\n' + 
                    'ORG:' + info + ';\n' + 
                    'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 
                    'END:VCARD'
        return conn.sendMessage(m.chat, { 
            contacts: { 
                displayName: name, 
                contacts: [{ vcard }] 
            } 
        }, { quoted: m })
    }
    
    /**
     * React to message
     */
    m.react = (emoji) => {
        return conn.sendMessage(m.chat, { 
            react: { 
                text: emoji, 
                key: m.key 
            } 
        })
    }

    return m
}

module.exports = { sms, downloadMediaMessage }
