const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

cmd({
  pattern: "prompt",
  alias: ["imgtoprompt", "img2prompt"],
  react: '🤖',
  desc: "Extract AI prompt from image",
  category: "ai",
  use: ".imagetoprompt [reply to image]",
  filename: __filename
}, async (conn, message, m,  { reply, mek }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType || !mimeType.startsWith('image/')) {
      return reply("Please reply to an image file (JPEG/PNG)");
    }

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    const fileSize = formatBytes(mediaBuffer.length);
    
    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else {
      return reply("Unsupported image format. Please use JPEG or PNG");
    }

    const tempFilePath = path.join(os.tmpdir(), `imgprompt_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
    form.append('reqtype', 'fileupload');

    const uploadResponse = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    const imageUrl = uploadResponse.data;
    fs.unlinkSync(tempFilePath); // Clean up temp file

    if (!imageUrl) {
      throw "Failed to upload image to Catbox";
    }

    // Analyze the image using the API
    const apiUrl = `https://api.deline.web.id/ai/toprompt?url=${encodeURIComponent(imageUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.status || !response.data.result) {
      return reply("Error: Could not extract prompt from this image.");
    }

    const originalPrompt = response.data.result.original;
    
    if (!originalPrompt) {
      return reply("No prompt found in this image.");
    }

    await conn.sendMessage(m.chat, {
      text: `*🖼️ Extracted Prompt:*\n\n${originalPrompt}\n\n> *Powered by JawadTechX*`
    }, { quoted: m });

  } catch (error) {
    console.error("Image to Prompt Error:", error);
    reply(`An error occurred: ${error.response?.data?.message || error.message || "Unknown error"}`);
  }
});
