const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd, commands } = require('../command');

// Auto Typing Presence
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isOwner, isGroup }) => {
    if (config.AUTO_TYPING === 'true') {
        // Work for both inbox and groups
        await conn.sendPresenceUpdate('composing', from);
    } 
    else if (config.AUTO_TYPING === 'inbox') {
        // Work only for inbox (private chats)
        if (!isGroup) {
            await conn.sendPresenceUpdate('composing', from);
        }
    }
    else if (config.AUTO_TYPING === 'group') {
        // Work only for groups
        if (isGroup) {
            await conn.sendPresenceUpdate('composing', from);
        }
    }
    // Any other value (including 'false') will disable auto typing
});

// Auto Recording Presence
cmd({
    on: "body"
}, async (conn, mek, m, { from, body, isOwner, isGroup }) => {       
    if (config.AUTO_RECORDING === 'true') {
        // Work for both inbox and groups
        await conn.sendPresenceUpdate('recording', from);
    }
    else if (config.AUTO_RECORDING === 'inbox') {
        // Work only for inbox (private chats)
        if (!isGroup) {
            await conn.sendPresenceUpdate('recording', from);
        }
    }
    else if (config.AUTO_RECORDING === 'group') {
        // Work only for groups
        if (isGroup) {
            await conn.sendPresenceUpdate('recording', from);
        }
    }
    // Any other value (including 'false') will disable auto recording
});
