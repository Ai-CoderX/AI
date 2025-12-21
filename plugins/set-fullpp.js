const { cmd } = require("../command");
const Jimp = require("jimp");

cmd({
  pattern: "fullpp",
  alias: ["setpp", "setdp", "pp", "setppbot"],
  react: "🖼️",
  desc: "Owner Only - Set full image as bot's profile picture",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    // Authorization (bot or owner only)
    const botNumber = client.decodeJid ? client.decodeJid(client.user.id) : client.user.id;
    const isBot = message.sender === botNumber;
    
    if (!isBot && !isCreator) {
      return await client.sendMessage(from, {
        text: "*❌ This command can only be used by the bot itself or owner.*"
      }, { quoted: message });
    }

    // Check if quoted message is an image
    if (!match.quoted || !match.quoted.mtype || !match.quoted.mtype.includes("image")) {
      return await client.sendMessage(from, {
        text: "*⚠️ Please reply to an image to set as profile picture.*"
      }, { quoted: message });
    }

    // React with loading ⏳
    await client.sendMessage(from, { 
      react: { text: '⏳', key: message.key } 
    });

    try {
      // Download the image (no need for retry mechanism like in example)
      const media = await match.quoted.download();
      if (!media) throw new Error("Failed to download image");

      // Process image with Jimp
      const image = await Jimp.read(media);
      if (!image) throw new Error("Invalid image format");

      // Make square if needed (exact same logic as example)
      const size = Math.max(image.bitmap.width, image.bitmap.height);
      if (image.bitmap.width !== image.bitmap.height) {
        const squareImage = new Jimp(size, size, 0x000000FF);
        squareImage.composite(image, 
          (size - image.bitmap.width) / 2, 
          (size - image.bitmap.height) / 2
        );
        image.clone(squareImage);
      }

      // Resize to WhatsApp requirements
      image.resize(640, 640);
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

      // Update profile picture
      await client.updateProfilePicture(botNumber, buffer);
      
      // React with success ✅
      await client.sendMessage(from, { 
        react: { text: '✅', key: message.key } 
      });

      // Success message
      return await client.sendMessage(from, {
        text: "*✅ Profile Picture Updated successfully!*",
        contextInfo: {
          mentionedJid: [message.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: message });

    } catch (error) {
      // React with error ❌
      await client.sendMessage(from, { 
        react: { text: '❌', key: message.key } 
      });
      
      return await client.sendMessage(from, {
        text: `*❌ Error:* ${error.message}`
      }, { quoted: message });
    }

  } catch (error) {
    console.error("fullpp Error:", error);
    
    // Try to send error reaction if message.key still exists
    try {
      await client.sendMessage(from, { 
        react: { text: '❌', key: message.key } 
      });
    } catch (e) {}
    
    await client.sendMessage(from, {
      text: `*🔥 Unexpected error:*\n${error.message}`
    }, { quoted: message });
  }
});
