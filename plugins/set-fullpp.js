const { cmd } = require("../command");
const { Jimp } = require("jimp");

cmd({
  pattern: "fullpp",
  alias: ["setpp", "setdp", "pp"],
  react: "🖼️",
  desc: "Set full image as bot's profile picture",
  category: "tools",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    // Get bot's JID
    const botJid = client.user?.id || (client.user.id.split(":")[0] + "@s.whatsapp.net");
    
    if (message.sender !== botJid && !isCreator) {
      return await client.sendMessage(from, {
        text: "*📛 This command can only be used by the bot or its owner.*"
      }, { quoted: message });
    }

    if (!message.quoted || !message.quoted.mtype || !message.quoted.mtype.includes("image")) {
      return await client.sendMessage(from, {
        text: "*⚠️ Please reply to an image to set as profile picture*"
      }, { quoted: message });
    }

    await client.sendMessage(from, {
      text: "*⏳ Step 1/5: Starting image download...*"
    }, { quoted: message });

    // Step 1: Download image
    let imageBuffer;
    try {
      imageBuffer = await message.quoted.download();
      await client.sendMessage(from, {
        text: `*✅ Step 1/5: Downloaded image (${imageBuffer.length} bytes)*`
      }, { quoted: message });
    } catch (downloadError) {
      await client.sendMessage(from, {
        text: `*❌ Download failed:* ${downloadError.message}`
      }, { quoted: message });
      return;
    }

    // Step 2: Read with Jimp
    await client.sendMessage(from, {
      text: "*⏳ Step 2/5: Reading image with Jimp...*"
    }, { quoted: message });
    
    let image;
    try {
      image = await Jimp.read(imageBuffer);
      await client.sendMessage(from, {
        text: `*✅ Step 2/5: Image read successfully (${image.bitmap.width}x${image.bitmap.height})*`
      }, { quoted: message });
    } catch (readError) {
      await client.sendMessage(from, {
        text: `*❌ Jimp.read failed:* ${readError.message}`
      }, { quoted: message });
      return;
    }

    // Step 3: Process image
    await client.sendMessage(from, {
      text: "*⏳ Step 3/5: Processing image...*"
    }, { quoted: message });
    
    let blurredBg, centeredImage;
    try {
      blurredBg = image.clone().cover(640, 640).blur(10);
      centeredImage = image.clone().contain(640, 640);
      blurredBg.composite(centeredImage, 0, 0);
      await client.sendMessage(from, {
        text: "*✅ Step 3/5: Image processed successfully*"
      }, { quoted: message });
    } catch (processError) {
      await client.sendMessage(from, {
        text: `*❌ Image processing failed:* ${processError.message}`
      }, { quoted: message });
      return;
    }

    // Step 4: Get buffer
    await client.sendMessage(from, {
      text: "*⏳ Step 4/5: Creating final image buffer...*"
    }, { quoted: message });
    
    let finalImage;
    try {
      finalImage = await blurredBg.getBufferAsync(Jimp.MIME_JPEG);
      await client.sendMessage(from, {
        text: `*✅ Step 4/5: Buffer created (${finalImage.length} bytes)*`
      }, { quoted: message });
    } catch (bufferError) {
      await client.sendMessage(from, {
        text: `*❌ Buffer creation failed:* ${bufferError.message}`
      }, { quoted: message });
      return;
    }

    // Step 5: Update profile
    await client.sendMessage(from, {
      text: "*⏳ Step 5/5: Updating profile picture...*"
    }, { quoted: message });
    
    try {
      await client.updateProfilePicture(botJid, finalImage);
      await client.sendMessage(from, {
        text: "*✅ Bot's profile picture updated successfully!*"
      }, { quoted: message });
    } catch (updateError) {
      await client.sendMessage(from, {
        text: `*❌ Profile update failed:* ${updateError.message}`
      }, { quoted: message });
    }

  } catch (error) {
    await client.sendMessage(from, {
      text: `*🔥 Unexpected error:*\n${error.message}\n\nStack: ${error.stack}`
    }, { quoted: message });
  }
});
