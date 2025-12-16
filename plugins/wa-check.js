const { cmd } = require('../command');
const { checkBanStatus } = require('../lib/wacheck');

cmd({
    pattern: "bancheck",
    alias: ["check", "wacheck"],
    desc: "Check if a WhatsApp number is banned or restricted",
    category: "tools",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, q, reply, react, isCreator }) => {
    try {
        // Add owner restriction
        if (!isCreator) {
            return await conn.sendMessage(from, {
                text: "*📛 This is an owner command.*\nOnly the bot owner can use this command."
            }, { quoted: mek });
        }

        if (!q) {
            await react("❌");
            return reply(`*⚠️ Please enter a phone number with country code!*\n\nExample:\n.bancheck 9234*********`);
        }

        // Clean the input: remove spaces, dashes, etc., keep only digits
        const rawNumber = q.replace(/[^0-9]/g, '');

        // Basic validation: must be at least 9 digits, usually 10-15
        if (rawNumber.length < 9 || rawNumber.length > 15) {
            await react("❌");
            return reply("❌ *Invalid number format.*\nPlease enter a valid international phone number (9-15 digits).");
        }

        // Construct JID
        const targetJid = rawNumber + "@s.whatsapp.net";

        await react("🔍");

        const result = await checkBanStatus(targetJid);

        let message = `*WhatsApp Account Status Check* 🔍\n\n`;
        message += `*Number:* ${rawNumber}\n`;
        message += `*Status:* ${result.status}\n\n`;

        if (result.isBanned) {
            message += `❌ *Banned:* Yes\n`;
            if (result.details) {
                message += `Violation Type: ${result.details.violation_type || 'Unknown'}\n`;
                message += `Appeal Available: ${result.details.in_app_ban_appeal ? 'Yes ✅' : 'No ❌'}\n`;
            }
        } else if (result.isNeedOfficialWa) {
            message += `⚠️ *Restricted:* Yes\n`;
            message += `Requires official WhatsApp app\n`;
        } else {
            message += `✅ *Account Status:* Active\n`;
            message += `✅ *Not Banned*\n`;
            message += `✅ *No Restrictions*\n`;
        }

        message += `\n_Powered by JawadTechX_`;

        await conn.sendMessage(from, { text: message }, { quoted: mek });

    } catch (e) {
        console.error("Error in bancheck command:", e);
        await react("❌");
        reply("❌ An error occurred while checking the number.\nPlease try again later.");
    }
});
