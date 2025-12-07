const { cmd } = require("../command");

cmd({
    pattern: "raw",
    alias: ["structure", "debug"],
    desc: "Shows raw Baileys message structure",
    category: "utility",
    react: "🔍",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator }) => {
    try {
        // Add the owner check here
        if (!isCreator) {
            return await conn.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: mek });
        }

        const content = JSON.stringify(mek.message);
        
        await conn.sendMessage(from, {
            document: Buffer.from(content),
            mimetype: 'application/json',
            fileName: `raw-message-${Date.now()}.json`
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in raw command:", e);
        reply("Error: " + e.message);
    }
});
