const crypto = require('crypto');
const config = require('../config');
const axios = require("axios");
const zlib = require('zlib');
const fsSync = require("fs");
const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");
const { File } = require("megajs");

// SESSION VERIFICATION FUNCTION
function verifySession(sessionId) {
    try {
        if (!sessionId) {
            console.log("[ ❌ ] No session ID provided");
            return false;
        }
        
        // For MEGA sessions: IK~[mega-file-id]
        if (sessionId.startsWith('IK~')) {
            console.log("🔍 Verifying MEGA session");
            return true;
        }
        
        // For BASE sessions: JK~[base64-data]
        if (sessionId.startsWith('JK~')) {
            console.log("🔍 Verifying BASE session");
            return true;
        }
        
        console.log("❌ Invalid session format");
        return false;
    } catch (e) {
        console.log("❌ Error in verification:", e.message);
        return false;
    }
}

async function loadSession() {
    const sessionDir = path.join(__dirname, "../sessions");
    const credsPath = path.join(sessionDir, "creds.json");
    
    if (!fsSync.existsSync(sessionDir)) {
        fsSync.mkdirSync(sessionDir, { recursive: true });
    }
    
    try {
        if (!config.SESSION_ID) {
            console.log("[ ⏳ ] No SESSION_ID provided - Falling back to QR or pairing code");
            return null;
        }

        // Verify session format using single function
        if (!verifySession(config.SESSION_ID)) {
            console.log("[ 🚫 ] Session validation failed - Bot cannot start");
            process.exit(1);
        }

        if (config.SESSION_ID.startsWith("JK~")) {
            console.log("[ ⏳ ] Processing BASE session");
            const b64data = config.SESSION_ID.replace("JK~", "");
            const cleanB64 = b64data.replace(/\.\.\./g, '');
            const compressedData = Buffer.from(cleanB64, 'base64');
            const decompressedData = zlib.gunzipSync(compressedData);
            fsSync.writeFileSync(credsPath, decompressedData);
            console.log("[ ✅ ] BASE session decoded and saved successfully");
            return JSON.parse(decompressedData.toString());
        } else if (config.SESSION_ID.startsWith("IK~")) {
            console.log("[ ⏳ ] Processing MEGA session");
            const megaFileId = config.SESSION_ID.replace("IK~", "");
            const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
            const data = await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            fsSync.writeFileSync(credsPath, data);
            console.log("[ ✅ ] MEGA session downloaded successfully");
            return JSON.parse(data.toString());
        } else {
            console.log('❌ Unknown SESSION_ID format. Must start with IK~ or JK~');
            return null;
        }
    } catch (error) {
        console.error('❌ Error loading session', { Error: error.message });
        console.log("[ 🟢 ] Will attempt QR code or pairing code login");
        return null;
    }
}

async function connectWithPairing(conn, useMobile) {
    if (useMobile) {
        console.error("[ ❌ ] Cannot use pairing code with mobile API");
        throw new Error("Cannot use pairing code with mobile API");
    }
    if (!process.stdin.isTTY) {
        console.error("[ ❌ ] Cannot prompt for phone number in non-interactive environment");
        process.exit(1);
    }
    console.log("[ 📡 ] Prompting for phone number for pairing code");
    console.log(" ACTION REQUIRED ");
    console.log("┌" + "─".repeat(46) + "┐");
    console.log("│ " + "Enter WhatsApp number to receive pairing code" + " │");
    console.log("└" + "─".repeat(46) + "┘");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const question = (text) => new Promise((resolve) => rl.question(text, resolve));
    let number = await question("» Enter your number (e.g., +923427582273): ");
    number = number.replace(/[^0-9]/g, "");
    rl.close();
    if (!number) {
        console.error("[ ❌ ] No phone number provided");
        process.exit(1);
    }
    try {
        let code = await conn.requestPairingCode(number);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        console.log("[ ✅ ] Pairing code generated", { Number: number, Code: code });
        console.log("\n" + " SUCCESS " + " Use this pairing code:");
        console.log("┌" + "─".repeat(46) + "┐");
        console.log("│ " + code + " │");
        console.log("└" + "─".repeat(46) + "┘");
        console.log("Enter this code in WhatsApp:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap 'Link a Device'\n4. Enter the code");
    } catch (err) {
        console.error("[ ❌ ] Error getting pairing code", { Error: err.message });
        process.exit(1);
    }
}

module.exports = {
    verifySession,
    loadSession,
    connectWithPairing
};
