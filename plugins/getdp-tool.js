const { cmd } = require("../command");
const { lidToPhone, cleanPN } = require("../lib/fixlid"); // Adjust path if needed

cmd({
    pattern: "getpp",
    alias: ["profile", "getdp"],
    react: "🖼️",
    desc: "Sends the profile picture of a user by phone number, mention, or reply (owner only)",
    category: "owner",
    use: ".getpp <phone number> OR reply to a message OR mention someone",
    filename: __filename
},
async (conn, mek, m, { from, isCreator, reply, sender }) => {
    try {
        if (!isCreator) {
            return reply("📛 Only the owner can use this command.");
        }

        let targetJid = null;

        // 1. First check: Direct phone number argument
        if (m.args && m.args.length > 0 && m.args[0].match(/[0-9]/)) {
            let phone = m.args[0].replace(/[^0-9]/g, "");
            if (phone.length >= 8 && phone.length <= 15) { // Validate phone length[citation:2]
                targetJid = phone + "@s.whatsapp.net";
            } else {
                return reply("❌ Invalid phone number format. Please provide a valid number (8-15 digits).");
            }
        }
        // 2. Second check: Mentioned user
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetJid = m.mentionedJid[0];
        }
        // 3. Third check: Quoted message sender
        else if (m.quoted) {
            targetJid = m.quoted.sender;
        }
        // 4. No valid target found
        else {
            return reply("❓ Please provide:\n• A phone number (e.g., .getpp 923427582273)\n• Reply to someone's message\n• Or mention someone in a group");
        }

        // Handle LID conversion if needed[citation:1][citation:4][citation:6]
        if (targetJid && targetJid.includes('@lid')) {
            try {
                let phoneNumber = await lidToPhone(conn, targetJid);
                if (phoneNumber && phoneNumber !== targetJid.split("@")[0]) {
                    targetJid = phoneNumber + "@s.whatsapp.net";
                } else {
                    // If conversion fails, keep the LID and try anyway
                    // WhatsApp might still have a profile picture for LID contacts[citation:8]
                }
            } catch (lidError) {
                console.log("LID conversion error:", lidError);
                // Continue with original LID
            }
        }

        // Ensure JID has proper format
        if (!targetJid.includes('@')) {
            targetJid = targetJid + "@s.whatsapp.net";
        }

        // Fetch profile picture
        let ppUrl;
        let userName = "User";
        
        try {
            // Try to get profile picture URL
            ppUrl = await conn.profilePictureUrl(targetJid, "image");
            
            // Try to get contact name
            try {
                const contact = await conn.getContact(targetJid);
                userName = contact.notify || contact.vname || contact.name || targetJid.split("@")[0];
            } catch (contactError) {
                userName = targetJid.split("@")[0];
            }

            // Send the profile picture
            await conn.sendMessage(from, { 
                image: { url: ppUrl }, 
                caption: `> Profile Pic Downloaded Successfully`
            });

            // Send reaction
            await conn.sendMessage(from, { 
                react: { text: "✅", key: mek.key } 
            });

        } catch (fetchError) {
            // Handle different error scenarios
            if (fetchError.message && fetchError.message.includes("404") || 
                fetchError.message && fetchError.message.includes("not found")) {
                return reply(`❌ Profile picture not found for ${targetJid.split("@")[0]}\n\nThis number may:\n• Have no profile picture\n• Have a private profile\n• Not exist on WhatsApp`);
            } else if (fetchError.message && fetchError.message.includes("401") || 
                      fetchError.message && fetchError.message.includes("unauthorized")) {
                return reply(`🔒 Profile picture is private for ${targetJid.split("@")[0]}`);
            } else {
                console.error("getpp fetch error:", fetchError);
                return reply(`❌ Error fetching profile picture:\n${fetchError.message || "Unknown error"}`);
            }
        }

    } catch (e) {
        console.error("getpp command error:", e);
        reply("❌ An error occurred while processing the command. Please try again later.");
    }
});
