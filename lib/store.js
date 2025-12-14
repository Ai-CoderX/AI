const { isJidBroadcast, isJidGroup, isJidNewsletter } = require('@whiskeysockets/baileys');
const fs = require('fs/promises')
const path = require('path')
const storeDir = path.join(process.cwd(), 'store');

const readJSON = async (file) => {
  try {
    const filePath = path.join(storeDir, file);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeJSON = async (file, data) => {
  const filePath = path.join(storeDir, file);
  await fs.mkdir(storeDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Function to check if JID should be ignored (excluding groups)
const shouldIgnoreJid = (jid) => {
  if (!jid) return true;
  // Only ignore: broadcast, newsletter, status, and bot's own messages (owner)
  if (isJidBroadcast(jid) || isJidNewsletter(jid)) return true;
  if (jid.includes('@newsletter') || jid.includes('@broadcast') || jid.includes('status@broadcast')) return true;
  return false;
};

const saveContact = async (jid, name) => {
  if (!jid || !name || shouldIgnoreJid(jid)) return;
  const contacts = await readJSON('contact.json');
  const index = contacts.findIndex((contact) => contact.jid === jid);
  if (index > -1) {
    contacts[index].name = name;
  } else {
    contacts.push({ jid, name });
  }
  await writeJSON('contact.json', contacts);
};

const getContacts = async () => {
  try {
    const contacts = await readJSON('contact.json');
    return contacts;
  } catch (error) {
    return [];
  }
};

const saveMessage = async (message) => {
  const jid = message.key.remoteJid;
  const id = message.key.id;
  
  // Don't save messages sent by the bot (owner messages)
  if (message.key.fromMe) return;
  
  if (!id || !jid || !message || shouldIgnoreJid(jid)) return;
  
  await saveContact(message.sender, message.pushName);
  const messages = await readJSON('message.json');
  
  // Filter out messages from this jid
  const otherMessages = messages.filter(msg => msg.jid !== jid);
  
  // Get messages for this jid and add new message
  const chatMessages = messages.filter(msg => msg.jid === jid);
  const timestamp = message.messageTimestamp ? message.messageTimestamp * 1000 : Date.now();
  
  // Add new message
  chatMessages.push({ id, jid, message, timestamp });
  
  // Keep only last 50 messages for this chat
  const limitedChatMessages = chatMessages
    .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
    .slice(0, 50); // Keep only 50 most recent
  
  // Combine with other chats' messages
  const allMessages = [...otherMessages, ...limitedChatMessages];
  
  await writeJSON('message.json', allMessages);
};

const loadMessage = async (id) => {
  if (!id) return null;
  const messages = await readJSON('message.json');
  return messages.find((msg) => msg.id === id) || null;
};

const getName = async (jid) => {
  const contacts = await readJSON('contact.json');
  const contact = contacts.find((contact) => contact.jid === jid);
  return contact ? contact.name : jid.split('@')[0].replace(/_/g, ' ');
};

const saveGroupMetadata = async (jid, client) => {
  if (!isJidGroup(jid)) return;
  const groupMetadata = await client.groupMetadata(jid);
  const metadata = {
    jid: groupMetadata.id,
    subject: groupMetadata.subject,
    subjectOwner: groupMetadata.subjectOwner,
    subjectTime: groupMetadata.subjectTime
      ? new Date(groupMetadata.subjectTime * 1000).toISOString()
      : null,
    size: groupMetadata.size,
    creation: groupMetadata.creation ? new Date(groupMetadata.creation * 1000).toISOString() : null,
    owner: groupMetadata.owner,
    desc: groupMetadata.desc,
    descId: groupMetadata.descId,
    linkedParent: groupMetadata.linkedParent,
    restrict: groupMetadata.restrict,
    announce: groupMetadata.announce,
    isCommunity: groupMetadata.isCommunity,
    isCommunityAnnounce: groupMetadata.isCommunityAnnounce,
    joinApprovalMode: groupMetadata.joinApprovalMode,
    memberAddMode: groupMetadata.memberAddMode,
    ephemeralDuration: groupMetadata.ephemeralDuration,
  };

  const metadataList = await readJSON('metadata.json');
  const index = metadataList.findIndex((meta) => meta.jid === jid);
  if (index > -1) {
    metadataList[index] = metadata;
  } else {
    metadataList.push(metadata);
  }
  await writeJSON('metadata.json', metadataList);

  const participants = groupMetadata.participants.map((participant) => ({
    jid,
    participantId: participant.id,
    admin: participant.admin,
  }));
  await writeJSON(`${jid}_participants.json`, participants);
};

const getGroupMetadata = async (jid) => {
  if (!isJidGroup(jid)) return null;
  const metadataList = await readJSON('metadata.json');
  const metadata = metadataList.find((meta) => meta.jid === jid);
  if (!metadata) return null;

  const participants = await readJSON(`${jid}_participants.json`);
  return { ...metadata, participants };
};

const saveMessageCount = async (message) => {
  if (!message) return;
  const jid = message.key.remoteJid;
  const sender = message.key.participant || message.sender;
  
  // Don't count bot's messages (owner messages)
  if (message.key.fromMe) return;
  
  if (!jid || !sender || shouldIgnoreJid(jid)) return;

  const messageCounts = await readJSON('message_count.json');
  const index = messageCounts.findIndex((record) => record.jid === jid && record.sender === sender);

  if (index > -1) {
    messageCounts[index].count += 1;
  } else {
    messageCounts.push({ jid, sender, count: 1 });
  }

  await writeJSON('message_count.json', messageCounts);
};

const getInactiveGroupMembers = async (jid) => {
  if (!isJidGroup(jid)) return [];
  const groupMetadata = await getGroupMetadata(jid);
  if (!groupMetadata) return [];

  const messageCounts = await readJSON('message_count.json');
  const inactiveMembers = groupMetadata.participants.filter((participant) => {
    const record = messageCounts.find((msg) => msg.jid === jid && msg.sender === participant.id);
    return !record || record.count === 0;
  });

  return inactiveMembers.map((member) => member.id);
};

const getGroupMembersMessageCount = async (jid) => {
  if (!isJidGroup(jid)) return [];
  const messageCounts = await readJSON('message_count.json');
  const groupCounts = messageCounts
    .filter((record) => record.jid === jid && record.count > 0)
    .sort((a, b) => b.count - a.count);

  return Promise.all(
    groupCounts.map(async (record) => ({
      sender: record.sender,
      name: await getName(record.sender),
      messageCount: record.count,
    }))
  );
};

const getChatSummary = async () => {
  const messages = await readJSON('message.json');
  const distinctJids = [...new Set(messages.map((msg) => msg.jid))];

  const summaries = await Promise.all(
    distinctJids.map(async (jid) => {
      if (shouldIgnoreJid(jid)) return null;
      
      const chatMessages = messages.filter((msg) => msg.jid === jid);
      const messageCount = chatMessages.length;
      const lastMessage = chatMessages.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      )[0];
      const chatName = isJidGroup(jid) ? jid : await getName(jid);

      return {
        jid,
        name: chatName,
        messageCount,
        lastMessageTimestamp: lastMessage ? lastMessage.timestamp : null,
      };
    })
  );

  return summaries
    .filter(summary => summary !== null)
    .sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
};

const saveMessageV1 = saveMessage;
const saveMessageV2 = (message) => {
  return Promise.all([saveMessageV1(message), saveMessageCount(message)]);
};

module.exports = {
    saveContact,
    loadMessage,
    getName,
    getChatSummary,
    saveGroupMetadata,
    getGroupMetadata,
    saveMessageCount,
    getInactiveGroupMembers,
    getGroupMembersMessageCount,
    saveMessage: saveMessageV2,
};

// codes by JawadTechX
