const { cmd } = require("../command");
const axios = require("axios");

cmd({
    pattern: "img",
    alias: ["image", "searchimg", "gimage"],
    react: "🖼️",
    desc: "Search and download images from Google",
    category: "search",
    use: ".img <query>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img beautiful sunset");
        }

        await reply(`🔍 Searching for "${query}"...`);
        
        // Using the new API endpoint
        const url = `https://jawad-tech.vercel.app/search/gimage?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        
        // Check if response is valid
        if (!response.data || response.data.status === false || !response.data.result || !Array.isArray(response.data.result)) {
            return reply("❌ No images found or API error. Try different keywords");
        }
        
        const results = response.data.result;
        
        if (results.length === 0) {
            return reply("❌ No images found for your query");
        }
        
        // Get 5 random unique images (remove duplicates by URL)
        const uniqueResults = [];
        const seenUrls = new Set();
        
        for (const image of results) {
            if (image.url && !seenUrls.has(image.url)) {
                seenUrls.add(image.url);
                uniqueResults.push(image);
            }
        }
        
        const selectedImages = uniqueResults
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
        
        let sentCount = 0;
        
        for (const image of selectedImages) {
            try {
                await conn.sendMessage(
                    from,
                    { 
                        image: { url: image.url },
                        caption: `*📷 Result for*: ${query}\n*© Powered by KHAN-MD*`
                    },
                    { quoted: mek }
                );
                sentCount++;
                
                // Add delay between sends
                await new Promise(resolve => setTimeout(resolve, 800));
                
            } catch (sendError) {
                console.error('Error sending image:', sendError);
                // Continue with next image
            }
        }
        
        if (sentCount === 0) {
            return reply("❌ Failed to send images. Please try again later.");
        }
        
        if (sentCount < 5) {
            await reply(`✅ Sent ${sentCount} image(s). Could not send all images due to errors.`);
        }
        
    } catch (error) {
        console.error('Image Search Error:', error);
        
        if (error.response) {
            // API error response
            reply(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
            // No response received
            reply("❌ Network error. Please check your connection and try again.");
        } else {
            // Other errors
            reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
        }
    }
});

cmd({
    pattern: "img2",
    alias: ["image2", "searchimg2"],
    react: "🫧",
    desc: "Search and download images from various sources",
    category: "fun",
    use: ".img <query>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img Imran Khan");
        }

        await reply(`🔍 Searching for "${query}"...`);
        
        // Using the provided API endpoint
        const url = `https://api.hanggts.xyz/search/gimage?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);
        
        // Validate response
        if (!response.data?.status || !response.data.result?.length) {
            return reply("❌ No images found. Try different keywords");
        }
        
        const results = response.data.result;
        
        // Get 5 random images
        const selectedImages = results
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
        
        for (const image of selectedImages) {
            await conn.sendMessage(
                from,
                { 
                    image: { url: image.url },
                    caption: `*📷 Result for*: ${query}\n> *© Powered by KHAN-MD*`
                },
                { quoted: mek }
            );
            
            // Add delay between sends to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
    } catch (error) {
        console.error('Image Search Error:', error);
        reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
    }
});
