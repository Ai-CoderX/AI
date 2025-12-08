// lib/index.js
const { 
    saveContact,
    loadMessage,
    getName,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    saveMessage
} = require('./store');

// Import other functions from lib/functions.js
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
} = require('./functions');

// Import msg functions from lib/msg.js
const { sms, downloadMediaMessage } = require('./msg');

// Import antidelete functions from lib/antidelete.js
const { 
    DeletedText,
    DeletedMedia,
    AntiDelete 
} = require('./antidel');

const { connectWithPairing, verifySession, loadSession } = require('./session');

// Import GroupEvents from groupevents
const GroupEvents = require('./groupevents');

// Import AntiCall from anticall
const AntiCall = require('./anticall');

// Export everything
module.exports = {
    // Store functions
    saveContact,
    loadMessage,
    getName,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    saveMessage,
    
    // Function utilities
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    
    // Message utilities
    sms,
    downloadMediaMessage,
    
    // Anti-delete functions
    DeletedText,
    DeletedMedia,
    AntiDelete,
    
    // New exports
    GroupEvents,
    AntiCall,
    connectWithPairing,
    loadSession,
    verifySession
};
