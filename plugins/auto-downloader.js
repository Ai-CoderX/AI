const { cmd } = require("../command");
const config = require('../config');
const axios = require('axios');
const { File } = require('megajs');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Platform URLs and their APIs
const platforms = {
    youtube: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-_]{11})/i,
        api: "https://jawad-tech.vercel.app/download/ytdl",
        method: "video"
    },
    facebook: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i,
        api: "https://jawad-tech.vercel.app/downloader",
        method: "video"
    },
    instagram: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(instagram\.com|instagr\.am)\/[^\s]+/i,
        api: "https://jawad-tech.vercel.app/igdl",
        method: "media"
    },
    tiktok: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com)\/[^\s]+/i,
        api: "https://delirius-apiofc.vercel.app/download/tiktok",
        method: "video"
    },
    pinterest: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(pinterest\.com|pin\.it)\/[^\s]+/i,
        api: "https://jawad-tech.vercel.app/download/pinterest",
        method: "media"
    },
    mediafire: {
        pattern: /https?:\/\/(?:www\.)?mediafire\.com\/(file|folder)\/[^\s]+/i,
        api: "https://api.deline.web.id/downloader/mediafire",
        method: "document"
    },
    catbox: {
        pattern: /https?:\/\/files\.catbox\.moe\/[^\s]+/i,
        method: "direct"
    },
    mega: {
        pattern: /https?:\/\/mega\.nz\/(file|folder)\/[^\s]+/i,
        method: "mega"
    }
};

const createCaption = () =>
`*${config.BOT_NAME} Auto Downloader*`;

// No prefix auto-downloader handler
cmd({
    'on': "body"
}, async (client, message, store, {
    from,
    body,
    isGroup,
    isAdmins,
    isBotAdmins,
    isCreator,
    reply,
    sender
}) => {
    try {
        // Direct check of config.AUTO_DOWNLOADER
        if (config.AUTO_DOWNLOADER === "true") {
            // Works for both inbox and groups - no additional check needed
        } 
        else if (config.AUTO_DOWNLOADER === "inbox") {
            if (isGroup) return; // Only works in inbox
        } 
        else if (config.AUTO_DOWNLOADER === "group") {
            if (!isGroup) return; // Only works in groups
        } 
        else if (config.AUTO_DOWNLOADER === "owner") {
            if (!isCreator) return; // Only works for owner
        } 
        else {
            // Anything else ("false", "off", "disable", or any other value) - DISABLE
            return;
        }
        
        // Check if message contains any platform URL
        let matchedPlatform = null;
        let matchedUrl = null;
        for (const [platform, data] of Object.entries(platforms)) {
            const match = body.match(data.pattern);
            if (match) {
                matchedPlatform = platform;
                matchedUrl = match[0];
                break;
            }
        }
        // Skip if no platform matched
        if (!matchedPlatform || !matchedUrl) return;

        // Get platform config
        const platform = platforms[matchedPlatform];
        const caption = createCaption();
        // Show processing reaction
        await client.sendMessage(from, { react: { text: '⏳', key: message.key } });

        try {
            // Handle different platform types
            if (platform.method === "mega") {
                await handleMegaDownload(client, from, matchedUrl, caption, message);
            } else if (platform.method === "direct") {
                await handleDirectDownload(client, from, matchedUrl, matchedPlatform, caption, message);
            } else {
                await handleApiDownload(client, from, matchedUrl, matchedPlatform, caption, message);
            }
            await client.sendMessage(from, { react: { text: '✅', key: message.key } });
        } catch (apiError) {
            console.error(`Auto-downloader error for ${matchedPlatform}:`, apiError);
            await client.sendMessage(from, { react: { text: '❌', key: message.key } });
        }

    } catch (error) {
        console.error("Auto-downloader error:", error);
    }
});

// Handle MEGA.nz downloads
async function handleMegaDownload(client, from, url, caption, message) {
    try {
        const file = File.fromURL(url);
        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        const savePath = path.join(os.tmpdir(), file.name || "mega_download.bin");
        fs.writeFileSync(savePath, data);
        const ext = path.extname(file.name || '').toLowerCase();
        const fileName = file.name || "Downloaded_File";

        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
            await client.sendMessage(from, {
                image: fs.readFileSync(savePath),
                caption: caption
            }, { quoted: message });
        } else if (['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(ext)) {
            await client.sendMessage(from, {
                video: fs.readFileSync(savePath),
                caption: caption
            }, { quoted: message });
        } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) {
            await client.sendMessage(from, {
                audio: fs.readFileSync(savePath),
                mimetype: "audio/mpeg",
                ptt: false
            }, { quoted: message });
        } else {
            await client.sendMessage(from, {
                document: fs.readFileSync(savePath),
                fileName: fileName,
                mimetype: "application/octet-stream",
                caption: caption
            }, { quoted: message });
        }
        fs.unlinkSync(savePath);
    } catch (error) {
        console.error("MEGA download error:", error);
        throw error;
    }
}

// Handle direct file URLs (only for catbox now)
async function handleDirectDownload(client, from, url, platformType, caption, message) {
    try {
        // Only handling catbox now
        if (platformType === "catbox") {
            const fileName = url.split('/').pop().split('?')[0] || "Downloaded_File";
            await client.sendMessage(from, {
                document: { url: url },
                fileName: fileName,
                mimetype: "application/octet-stream",
                caption: caption
            }, { quoted: message });
        }
    } catch (error) {
        console.error("Direct download error:", error);
        throw error;
    }
}

// Handle API-based downloads
async function handleApiDownload(client, from, url, platformType, caption, message) {
    try {
        const platform = platforms[platformType];
        const apiUrl = `${platform.api}?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        // Handle TikTok with the new API response structure
        if (platformType === "tiktok") {
            if (!response.data?.status || !response.data?.data) {
                throw new Error("TikTok API returned error");
            }
            const data = response.data.data;
            
            // Get the first video URL from meta.media array
            if (data.meta?.media?.length > 0) {
                // Try to get HD video first, then WM, then original
                const mediaItem = data.meta.media[0];
                let videoUrl = mediaItem.hd || mediaItem.wm || mediaItem.org;
                
                if (!videoUrl) {
                    throw new Error("No video URL found in media array");
                }
                
                // Ensure we have a valid URL (add https if missing)
                if (videoUrl.startsWith('//')) {
                    videoUrl = 'https:' + videoUrl;
                } else if (!videoUrl.startsWith('http')) {
                    videoUrl = 'https://' + videoUrl;
                }
                
                console.log(`Downloading TikTok video from: ${videoUrl}`);
                
                await client.sendMessage(from, {
                    video: { url: videoUrl },
                    caption: caption
                }, { quoted: message });
            } else {
                throw new Error("No media found in TikTok response");
            }
            return;
        }

        // Handle MediaFire (sends as document)
        if (platformType === "mediafire") {
            if (!response.data || !response.data.status || !response.data.result || !response.data.result.downloadUrl || !response.data.result.fileName) {
                throw new Error("Failed to fetch MediaFire file info");
            }
            const fileInfo = response.data.result;
            const fileName = fileInfo.fileName;
            const fileResponse = await axios.get(fileInfo.downloadUrl, { responseType: 'arraybuffer' });
            const fileBuffer = Buffer.from(fileResponse.data);
            await client.sendMessage(from, {
                document: fileBuffer,
                fileName: fileName,
                mimetype: "application/octet-stream",
                caption: caption
            }, { quoted: message });
            return;
        }

        // Handle Instagram with the new API
        if (platformType === "instagram") {
            // Using the new API: https://jawad-tech.vercel.app/igdl
            if (!response.data?.status || !response.data.result?.length) {
                throw new Error("Failed to fetch Instagram media");
            }
            
            const mediaData = response.data.result;

            // Send all media items
            for (const item of mediaData) {
                const isVideo = item.contentType?.includes('video') || item.format === 'mp4';
                
                if (isVideo) {
                    await client.sendMessage(from, {
                        video: { url: item.url },
                        caption: caption
                    }, { quoted: message });
                } else {
                    await client.sendMessage(from, {
                        image: { url: item.url },
                        caption: caption
                    }, { quoted: message });
                }
                
                // Small delay between sends to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            return;
        }

        // Handle other APIs (YouTube, Facebook, Pinterest)
        if (!response.data?.status) {
            throw new Error("API returned error");
        }
        const data = response.data;

        switch (platformType) {
            case "youtube":
                if (data.result?.mp4) {
                    await client.sendMessage(from, {
                        video: { url: data.result.mp4 },
                        caption: caption
                    }, { quoted: message });
                }
                break;
            case "facebook":
                if (data.result?.length > 0) {
                    const video = data.result.find(v => v.quality === "HD") || data.result.find(v => v.quality === "SD");
                    if (video?.url) {
                        await client.sendMessage(from, {
                            video: { url: video.url },
                            caption: caption
                        }, { quoted: message });
                    }
                }
                break;
            case "pinterest":
                if (data.result?.url) {
                    const isVideo = data.result.type === 'video';
                    if (isVideo) {
                        await client.sendMessage(from, {
                            video: { url: data.result.url },
                            caption: caption
                        }, { quoted: message });
                    } else {
                        await client.sendMessage(from, {
                            image: { url: data.result.url },
                            caption: caption
                        }, { quoted: message });
                    }
                }
                break;
        }
    } catch (error) {
        console.error(`API download error for ${platformType}:`, error);
        throw error;
    }
}
