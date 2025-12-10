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

const saveContact = async (jid, name) => {
  // Dynamically import Baileys
  const baileys = await import('@whiskeysockets/baileys');
  const { isJidGroup, isJidBroadcast, isJidNewsletter } = baileys;
  
  if (!jid || !name || isJidGroup(jid) || isJidBroadcast(jid) || isJidNewsletter(jid)) return;
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
  if (!id || !jid || !message) return;
  
  // Dynamically import Baileys for BufferJSON
  const baileys = await import('@whiskeysockets/baileys');
  const { BufferJSON } = baileys;
  
  await saveContact(message.sender, message.pushName);
  const messages = await readJSON('message.json');
  const index = messages.findIndex((msg) => msg.id === id && msg.jid === jid);
  const timestamp = message.messageTimestamp ? message.messageTimestamp * 1000 : Date.now();
  
  if (index > -1) {
    // Use BufferJSON for proper serialization
    const jsonStr = JSON.stringify(message, BufferJSON.replacer);
    const serializedMessage = JSON.parse(jsonStr, BufferJSON.reviver);
    messages[index].message = serializedMessage;
    messages[index].timestamp = timestamp;
  } else {
    // Use BufferJSON for proper serialization
    const jsonStr = JSON.stringify(message, BufferJSON.replacer);
    const serializedMessage = JSON.parse(jsonStr, BufferJSON.reviver);
    messages.push({ id, jid, message: serializedMessage, timestamp });
  }
  await writeJSON('message.json', messages);
};

const loadMessage = async (id) => {
  if (!id) return null;
  const messages = await readJSON('message.json');
  const messageData = messages.find((msg) => msg.id === id) || null;
  
  if (!messageData) return null;
  
  // Dynamically import Baileys for proto
  const baileys = await import('@whiskeysockets/baileys');
  const { proto, BufferJSON } = baileys;
  
  try {
    // Deserialize using BufferJSON
    const jsonStr = JSON.stringify(messageData.message, BufferJSON.replacer);
    const deserialized = JSON.parse(jsonStr, BufferJSON.reviver);
    
    // Create proto message using .create() instead of .fromObject()
    const message = proto.WebMessageInfo.create(deserialized);
    return {
      id: messageData.id,
      jid: messageData.jid,
      message: message,
      timestamp: messageData.timestamp
    };
  } catch (error) {
    console.error('Error loading message:', error);
    return messageData; // Return raw data if deserialization fails
  }
};

const getName = async (jid) => {
  const contacts = await readJSON('contact.json');
  const contact = contacts.find((contact) => contact.jid === jid);
  return contact ? contact.name : jid.split('@')[0].replace(/_/g, ' ');
};

const saveGroupMetadata = async (jid, client) => {
  // Dynamically import Baileys
  const baileys = await import('@whiskeysockets/baileys');
  const { isJidGroup, BufferJSON } = baileys;
  
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
  
  // Use BufferJSON for participant serialization
  const jsonStr = JSON.stringify(participants, BufferJSON.replacer);
  const serializedParticipants = JSON.parse(jsonStr, BufferJSON.reviver);
  await writeJSON(`${jid}_participants.json`, serializedParticipants);
};

const getGroupMetadata = async (jid) => {
  // Dynamically import Baileys
  const baileys = await import('@whiskeysockets/baileys');
  const { isJidGroup, BufferJSON } = baileys;
  
  if (!isJidGroup(jid)) return null;
  const metadataList = await readJSON('metadata.json');
  const metadata = metadataList.find((meta) => meta.jid === jid);
  if (!metadata) return null;

  try {
    const participantsData = await readJSON(`${jid}_participants.json`);
    // Deserialize using BufferJSON
    const jsonStr = JSON.stringify(participantsData, BufferJSON.replacer);
    const participants = JSON.parse(jsonStr, BufferJSON.reviver);
    return { ...metadata, participants };
  } catch (error) {
    return { ...metadata, participants: [] };
  }
};

const saveMessageCount = async (message) => {
  if (!message) return;
  const jid = message.key.remoteJid;
  const sender = message.key.participant || message.sender;
  
  // Dynamically import Baileys
  const baileys = await import('@whiskeysockets/baileys');
  const { isJidGroup } = baileys;
  
  if (!jid || !sender || !isJidGroup(jid)) return;

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
  // Dynamically import Baileys
  const baileys = await import('@whiskeysockets/baileys');
  const { isJidGroup } = baileys;
  
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
  // Dynamically import Baileys
  const baileys = await import('@whiskeysockets/baileys');
  const { isJidGroup } = baileys;
  
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
  // Dynamically import Baileys
  const baileys = await import('@whiskeysockets/baileys');
  const { isJidGroup } = baileys;
  
  const messages = await readJSON('message.json');
  const distinctJids = [...new Set(messages.map((msg) => msg.jid))];

  const summaries = await Promise.all(
    distinctJids.map(async (jid) => {
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

  return summaries.sort(
    (a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp)
  );
};

const saveMessageV1 = saveMessage;
const saveMessageV2 = async (message) => {
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
