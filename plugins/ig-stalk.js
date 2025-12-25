const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "igstalk",
  desc: "Get Instagram profile details",
  category: "other",
  react: "📸",
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  try {
    if (!args[0]) {
      return reply("❌ *Usage:* `.igstalk <instagram_username>`");
    }

    const username = args[0].replace("@", "");
    const url = `https://api.deline.web.id/stalker/igstalk?username=${username}`;

    const { data } = await axios.get(url);

    if (!data.status) {
      return reply("❌ *User not found or private account*");
    }

    const res = data.result;

    let caption = `
📸 *INSTAGRAM STALK*

👤 *Username:* ${res.username}
📛 *Full Name:* ${res.fullname || "N/A"}
📝 *Bio:* ${res.biography || "N/A"}

👥 *Followers:* ${res.followers}
➡️ *Following:* ${res.following}
🖼️ *Posts:* ${res.posts}

🔐 *Private:* ${res.is_private ? "Yes" : "No"}
✅ *Verified:* ${res.is_verified ? "Yes" : "No"}

⚡ *Powered By Khan-MD*
`;

    await conn.sendMessage(
      from,
      {
        image: { url: res.profile_pic },
        caption: caption
      },
      { quoted: mek }
    );

  } catch (err) {
    console.error(err);
    reply("❌ *Error fetching Instagram data*");
  }
});
