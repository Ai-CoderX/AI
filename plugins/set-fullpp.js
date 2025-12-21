// jawi

const { cmd } = require("../command");
const { Jimp } = require("jimp"); // For v1.6.0+

cmd({
  pattern: "fullpp",
  alias: ["setpp", "setdp", "pp", "setppbot"],
  react: "🖼️",
  desc: "Owner Only - Set full image as bot's profile picture",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    // Authorization: Bot itself or owner only
    const botNumber = client.decodeJid ? client.decodeJid(client.user.id) : client.user.id;
    const isBot = message.sender === botNumber;

    if (!isBot && !isCreator) {
      return await client.sendMessage(from, {
        text: "*❌ This command can only be used by the bot itself or owner.*"
      }, { quoted: message });
    }

    // Must reply to an image
    if (!message.quoted || !message.quoted.mtype || !message.quoted.mtype.includes("image")) {
      return await client.sendMessage(from, {
        text: "*⚠️ Please reply to an image to set as profile picture.*"
      }, { quoted: message });
    }

    // Loading reaction
    await client.sendMessage(from, { 
      react: { text: "⏳", key: message.key } 
    });

    try {
      // Download replied image
      const media = await message.quoted.download();
      if (!media) throw new Error("Failed to download image");

      // Read image directly from Buffer (Jimp v1.6.0+ supports Buffer natively)
      let image = await Jimp.read(media);

      // Make it square by centering on transparent background
      const size = Math.max(image.bitmap.width, image.bitmap.height);
      if (image.bitmap.width !== image.bitmap.height) {
        const squareImage = new Jimp(size, size, 0x00000000); // Transparent background
        const x = Math.floor((size - image.bitmap.width) / 2);
        const y = Math.floor((size - image.bitmap.height) / 2);
        squareImage.composite(image, x, y);
        image = squareImage;
      }

      // Resize to WhatsApp's recommended profile picture size
      image.resize(640, Jimp.AUTO); // Keeps aspect ratio, but since it's square now, it will be 640x640
      // Or force exactly 640x640 (safe)
      image.resize(640, 640);

      // Improve quality before sending (WhatsApp will recompress anyway)
      image.quality(90);

      // Convert to JPEG buffer
      const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

      // Update bot's profile picture
      await client.updateProfilePicture(botNumber, buffer);

      // Success reaction & message
      await client.sendMessage(from, { 
        react: { text: "✅", key: message.key } 
      });

      return await client.sendMessage(from, {
        text: "*✅ Profile Picture Updated successfully!*",
        contextInfo: {
          mentionedJid: [message.sender],
          forwardingScore: 999,
          isForwarded: true
        }
      }, { quoted: message });

    } catch (error) {
      await client.sendMessage(from, { 
        react: { text: "❌", key: message.key } 
      });

      return await client.sendMessage(from, {
        text: `*❌ Error processing image:*\n${error.message || error}`
      }, { quoted: message });
    }

  } catch (error) {
    console.error("fullpp Command Error:", error);

    try {
      await client.sendMessage(from, { 
        react: { text: "❌", key: message.key } 
      });
    } catch (e) {}

    await client.sendMessage(from, {
      text: `*🔥 Unexpected error:*\n${error.message || error}`
    }, { quoted: message });
  }
});
