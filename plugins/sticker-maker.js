// JawadTechXD 

const { cmd } = require('../command');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const Config = require('../config');
const StickerMaker = require('../lib/sticker-maker');
const crypto = require('crypto'); // Added missing import

// Mega Sticker Command
cmd(
    {
        pattern: 'sticker',
        alias: ['s', 'take', 'rename', 'stake', 'vsticker', 'gsticker', 'g2s', 'gs', 'v2s', 'vs'],
        desc: 'Create stickers from images, videos, GIFs with custom pack names',
        category: 'tools',
        react: "⚡",
        use: '<reply media> | <pack name>',
        filename: __filename,
    },
    async (conn, mek, m, { quoted, args, q, reply, from }) => {
        if (!mek.quoted) return reply(`*Reply to any Image, Video, GIF, or Sticker*`);
        
        let mime = mek.quoted.mtype;
        
        // Determine pack name: use provided text or default from config
        let pack = q ? q : (Config.STICKER_NAME || "Jawad TechX");
        
        try {
            let media, stickerBuffer;
            
            // Handle different media types
            if (mime === "imageMessage" || mime === "stickerMessage") {
                // For images and stickers - use wa-sticker-formatter directly
                media = await mek.quoted.download();
                
                let sticker = new Sticker(media, {
                    pack: pack, 
                    type: StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: crypto.randomBytes(4).toString('hex'),
                    quality: 75,
                    background: 'transparent',
                });
                stickerBuffer = await sticker.toBuffer();
                
            } else if (mime === "videoMessage") {
                // For videos - convert to WebP first
                media = await mek.quoted.download();
                const webpBuffer = await StickerMaker.videoToWebp(media);
                
                let sticker = new Sticker(webpBuffer, {
                    pack: pack,
                    type: StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: crypto.randomBytes(4).toString('hex'),
                    quality: 75,
                    background: 'transparent',
                });
                stickerBuffer = await sticker.toBuffer();
                
            } else {
                return reply("*Please reply to an image, video, GIF, or sticker*");
            }
            
            // Send the sticker
            return conn.sendMessage(mek.chat, { sticker: stickerBuffer }, { quoted: mek });
            
        } catch (error) {
            console.error("Sticker creation error:", error);
            return reply(`*Error creating sticker: ${error.message}*`);
        }
    }
);

// attp command remains unchanged
cmd({
    pattern: "attp",
    desc: "Convert text to a GIF sticker.",
    react: "✨",
    category: "tools", 
    use: ".attp HI",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("*Please provide text!*");

        const gifBuffer = await StickerMaker.fetchGif(`https://api-fix.onrender.com/api/maker/attp?text=${encodeURIComponent(args[0])}`);
        const stickerBuffer = await StickerMaker.gifToSticker(gifBuffer);

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
    } catch (error) {
        console.error("ATTP error:", error);
        reply(`❌ ${error.message}`);
    }
});


cmd({
    pattern: "attp2",
    desc: "Convert text to animated sticker with new API",
    react: "✨",
    category: "tools", 
    use: ".attp2 YOUR_TEXT",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("*Please provide text!*");

        // Use the new API endpoint
        const apiUrl = `https://api.deline.web.id/maker/attp?text=${encodeURIComponent(args[0])}`;
        
        // Download the GIF from the API
        const gifBuffer = await StickerMaker.fetchGif(apiUrl);
        
        // Convert GIF to sticker
        const stickerBuffer = await StickerMaker.gifToSticker(gifBuffer);
        
        // Send the sticker
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
        
    } catch (error) {
        console.error("ATTP2 error:", error);
        reply(`❌ ${error.message}`);
    }
});


// Command (Image to Sticker)
cmd({
    pattern: "gurl",
    alias: ["sgirl"],
    desc: "Create sticker with cewekbrat style",
    react: "👩",
    category: "tools", 
    use: ".gurl YOUR_TEXT",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("*Please provide text!*");

        // Get image from API
        const apiUrl = `https://api.deline.web.id/maker/cewekbrat?text=${encodeURIComponent(args[0])}`;
        
        // Download the image
        const imageBuffer = await StickerMaker.fetchGif(apiUrl); // Reusing fetchGif for image
        
        // Convert image to sticker using wa-sticker-formatter
        const sticker = new Sticker(imageBuffer, {
            pack: "Jawad Tech",
            type: StickerTypes.FULL,
            categories: ["✨", "🎀"],
            id: crypto.randomBytes(4).toString('hex'),
            quality: 50,
            background: 'transparent',
        });
        
        const stickerBuffer = await sticker.toBuffer();
        
        // Send the sticker
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
        
    } catch (error) {
        console.error("GURL error:", error);
        reply(`❌ ${error.message}`);
    }
});

// Brat Command (Image to Sticker)
cmd({
    pattern: "brat",
    alias: ["attp3"],
    desc: "Create sticker with brat style",
    react: "👨",
    category: "other", 
    use: ".brat YOUR_TEXT",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("*Please provide text!*");

        // Get image from API
        const apiUrl = `https://api.deline.web.id/maker/brat?text=${encodeURIComponent(args[0])}`;
        
        // Download the image
        const imageBuffer = await StickerMaker.fetchGif(apiUrl);
        
        // Convert image to sticker
        const sticker = new Sticker(imageBuffer, {
            pack: "KHAN MD 🦇",
            type: StickerTypes.FULL,
            categories: ["🔥", "⚡"],
            id: crypto.randomBytes(4).toString('hex'),
            quality: 50,
            background: 'transparent',
        });
        
        const stickerBuffer = await sticker.toBuffer();
        
        // Send the sticker
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
        
    } catch (error) {
        console.error("BRAT error:", error);
        reply(`❌ ${error.message}`);
    }
});

// Brat Video Command (Video to Sticker)
cmd({
    pattern: "bratvideo",
    alias: ["bratvid", "bratsticker"],
    desc: "Create video sticker with brat style",
    react: "🎬",
    category: "other", 
    use: ".bratvideo YOUR_TEXT",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (!args[0]) return reply("*Please provide text!*");

        // Get video from API
        const apiUrl = `https://api.deline.web.id/maker/bratvid?text=${encodeURIComponent(args[0])}`;
        
        // Download the video
        const videoBuffer = await StickerMaker.fetchGif(apiUrl);
        
        // Convert video to WebP sticker
        const webpBuffer = await StickerMaker.videoToWebp(videoBuffer);
        
        // Convert WebP to sticker
        const sticker = new Sticker(webpBuffer, {
            pack: "🦇 JawadTechXD",
            type: StickerTypes.FULL,
            categories: ["🎬", "✨"],
            id: crypto.randomBytes(4).toString('hex'),
            quality: 50,
            background: 'transparent',
        });
        
        const stickerBuffer = await sticker.toBuffer();
        
        // Send the sticker
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: mek });
        
    } catch (error) {
        console.error("BratVideo error:", error);
        reply(`❌ ${error.message}`);
    }
});
