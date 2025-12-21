const { cmd } = require("../command");

cmd({
  pattern: "fixpp",
  alias: ["newpp"],
  react: "🖼️",
  desc: "Fixed version for Jimp 1.6.0",
  category: "tools",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    // Authorization
    const botJid = client.user?.id || (client.user.id.split(":")[0] + "@s.whatsapp.net");
    if (message.sender !== botJid && !isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 Owner only*"
      }, { quoted: message });
    }

    if (!message.quoted?.mtype?.includes("image")) {
      return await client.sendMessage(from, { 
        text: "*⚠️ Reply to an image*" 
      }, { quoted: message });
    }

    await client.sendMessage(from, { 
      text: "*🔄 Starting fixpp...*" 
    }, { quoted: message });

    // Download image
    const imageBuffer = await message.quoted.download();
    await client.sendMessage(from, { 
      text: `*📥 Downloaded: ${imageBuffer.length} bytes*` 
    }, { quoted: message });

    // IMPORTANT: Try different import methods
    // Method 1: Direct import (most common for v1.6.0)
    const Jimp = (await import('jimp')).default || require('jimp');
    
    // Process image - simplified
    const image = await Jimp.read(imageBuffer);
    
    // Just resize to square (skip blur/composite for now)
    image.resize(640, Jimp.AUTO);
    
    // For Jimp 1.6.0, sometimes getBufferAsync needs to be called differently
    const finalImage = await image.getBufferAsync(Jimp.MIME_JPEG);
    
    await client.sendMessage(from, { 
      text: `*✅ Ready: ${finalImage.length} bytes*` 
    }, { quoted: message });

    // Update profile
    await client.updateProfilePicture(botJid, finalImage);
    await client.sendMessage(from, { 
      text: "*✅ Profile picture updated!*" 
    }, { quoted: message });

  } catch (error) {
    await client.sendMessage(from, {
      text: `*❌ Fixpp error:*\n${error.message}\n\nTry: \`npm install jimp@latest\``
    }, { quoted: message });
  }
});
