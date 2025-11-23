// ./lib/reaction.js

// Consolidated reaction list (merged public and owner reactions, deduplicated)
const reactions = [
    '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣',
    '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕',
    '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️',
    '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑',
    '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄',
    '🪼', '🐋', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀',
    '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🌹', '🌷', '🌾',
    '🌸', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '☃️', '🌨️', '🫧', '🍟', '🍫', '🧃',
    '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', '🥁', '🧩',
    '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', '🧸',
    '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈',
    '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '🧡', '💛', '💚',
    '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🩹', '💗', '💖', '💘', '💝', '❌',
    '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣',
    '⚫', '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰', '😇', '💯',
    '👀', '🥰', '😎', '🎎', '🎏', '🎐', '⚽', '🧣', '⛈️', '🌦️', '🙈', '🙉', '🦖',
    '🐤', '🔫', '🐝', '🍓', '🍭', '🧁', '🍿', '🍻', '🛬', '🫠', '💒', '🏩', '🏗️',
    '🏰', '🏪', '🏟️', '⛳', '📟', '📍', '🔮', '🧿', '♻️', '⛵', '🚍', '🚔', '🛳️',
    '🚆', '🚤', '🚕', '🛺', '🚝', '🚈', '🏎️', '🏍️', '🛵', '🥂', '🍾', '🍮', '🍰',
    '🍦', '🍨', '🥠', '🍡', '🧂', '🍯', '🍪', '🍩', '🥮', '🧳', '🌉', '🌁', '🛤️',
    '🛣️', '🏚️', '🏠', '🏡', '🧀'
];

// Remove duplicates and empty strings
const uniqueReactions = [...new Set(reactions.filter(emoji => emoji !== ''))];

// Function to handle public and owner reactions
function handleReaction(m, isReact, senderNumber, botNumber, config) {
    if (!isReact) {
        // Owner-specific reactions (only for own messages)
        if (senderNumber === botNumber && config.OWNER_REACT === 'true') {
            const randomReaction = uniqueReactions[Math.floor(Math.random() * uniqueReactions.length)];
            m.react(randomReaction);
            return;
        }

        // Custom React for all messages (do not react on own messages)
        if (config.CUSTOM_REACT === 'true' && senderNumber !== botNumber) {
            const customReactions = config.CUSTOM_REACT_EMOJIS ? config.CUSTOM_REACT_EMOJIS.split(',') : ['🥲','😂','👍🏻','🙂','😔'];
            const randomReaction = customReactions[Math.floor(Math.random() * customReactions.length)];
            m.react(randomReaction);
            return; // Return early to prevent other reactions
        }
        
        // Public reactions (do not react on own messages)
        if (config.AUTO_REACT === 'true' && senderNumber !== botNumber) {
            const randomReaction = uniqueReactions[Math.floor(Math.random() * uniqueReactions.length)];
            m.react(randomReaction);
        }
    }
}

// Export the function
module.exports = { handleReaction };