const config = require('../config');

const reactions = ['🌼','❤️','💐','🔥','🏵️','❄️','🧊','🐳','💥','🥀','❤‍🔥','🥹','😩','🫣','🤭','👻','👾','🫶','😻','🙌','🫂','🫀','👩‍🦰','🧑‍🦰','👩‍⚕️','🧑‍⚕️','🧕','👩‍🏫','👨‍💻','👰‍♀️','🦹🏻‍♀️','🧟‍♀️','🧟','🧞‍♀️','🧞','🙅‍♀️','💁‍♂️','💁‍♀️','🙆‍♀️','🙋‍♀️','🤷','🤷‍♀️','🤦','🤦‍♀️','💇‍♀️','💇','💃','🚶‍♀️','🚶','🧶','🧤','👑','💍','👝','💼','🎒','🥽','🐻','🐼','🐭','🐣','🪿','🦆','🦊','🦋','🦄','🪼','🐋','🐳','🦈','🐍','🕊️','🦦','🦚','🌱','🍃','🎍','🌿','☘️','🍀','🍁','🪺','🍄','🍄‍🟫','🪸','🪨','🌺','🪷','🪻','🥀','🌹','🌷','💐','🌾','🌸','🌼','🌻','🌝','🌚','🌕','🌎','💫','🔥','☃️','❄️','🌨️','🫧','🍟','🍫','🧃','🧊','🪀','🤿','🏆','🥇','🥈','🥉','🎗️','🤹','🤹‍♀️','🎧','🎤','🥁','🧩','🎯','🚀','🚁','🗿','🎙️','⌛','⏳','💸','💎','⚙️','⛓️','🔪','🧸','🎀','🪄','🎈','🎁','🎉','🏮','🪩','📩','💌','📤','📦','📊','📈','📑','📉','📂','🔖','🧷','📌','📝','🔏','🔐','🩷','❤️','🧡','💛','💚','🩵','💙','💜','🖤','🩶','🤍','🤎','❤‍🔥','❤‍🩹','💗','💖','💘','💝','❌','✅','🔰','〽️','🌐','🌀','⤴️','⤵️','🔴','🟢','🟡','🟠','🔵','🟣','⚫','⚪','🟤','🔇','🔊','📢','🔕','♥️','🕐','🚩','🇵🇰'];

const AutoReact = async (conn, messages) => {
    try {
        const mek = messages.messages[0];
        if (!mek || !mek.message || mek.key.fromMe) return;

        const from = mek.key.remoteJid;
        const sender = mek.key.participant || mek.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const botNumber = conn.user.id.split(':')[0];
        const isGroup = from.endsWith('@g.us');

        // Skip if sender is bot itself
        if (senderNumber === botNumber) return;

        // Mode: 'true' - react to everyone
        if (config.AUTO_REACT === 'true') {
            const random = reactions[Math.floor(Math.random() * reactions.length)];
            await conn.sendMessage(from, {
                react: {
                    text: random,
                    key: mek.key,
                },
            });
            return;
        }

        // Mode: 'custom' - use custom emoji list
        if (config.AUTO_REACT === 'custom') {
            const def = ['🥲','😂','👍🏻','🙂','😔'];
            const list = config.CUSTOM_REACT_EMOJIS ? 
                config.CUSTOM_REACT_EMOJIS.split(',').map(e => e.trim()) : def;
            const random = list[Math.floor(Math.random() * list.length)];
            await conn.sendMessage(from, {
                react: {
                    text: random,
                    key: mek.key,
                },
            });
            return;
        }

        // Mode: 'inbox' - only react to PMs
        if (config.AUTO_REACT === 'inbox') {
            if (isGroup) return;
            const random = reactions[Math.floor(Math.random() * reactions.length)];
            await conn.sendMessage(from, {
                react: {
                    text: random,
                    key: mek.key,
                },
            });
            return;
        }

        // Mode: 'group' - only react in groups
        if (config.AUTO_REACT === 'group') {
            if (!isGroup) return;
            const random = reactions[Math.floor(Math.random() * reactions.length)];
            await conn.sendMessage(from, {
                react: {
                    text: random,
                    key: mek.key,
                },
            });
            return;
        }

        // Mode: 'owner' - only react to bot's own messages
        if (config.AUTO_REACT === 'owner') {
            if (!config.OWNER_REACT || senderNumber !== botNumber) return;
            const random = reactions[Math.floor(Math.random() * reactions.length)];
            await conn.sendMessage(from, {
                react: {
                    text: random,
                    key: mek.key,
                },
            });
            return;
        }

    } catch (error) {
        // Silent error handling
    }
};

module.exports = AutoReact;
