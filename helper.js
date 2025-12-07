// helper.js
const crypto = require('crypto');
const chalk = require("chalk");
const zlib = require('zlib');
const { File } = require("megajs");
const fsSync = require("fs");
const path = require("path");
const readline = require("readline");

// ==================== SESSION FUNCTIONS ====================

async function loadSession(config) {
  try {
    if (!config.SESSION_ID) {
      console.log(chalk.red("[ ⏳ ] No SESSION_ID provided - Falling back to QR or pairing code"));
      return null;
    }

    // Verify session format using single function
    if (!verifySession(config.SESSION_ID)) {
      console.log(chalk.red("[ 🚫 ] Session validation failed - Bot cannot start"));
      process.exit(1);
    }

    const sessionDir = path.join(__dirname, "./sessions");
    const credsPath = path.join(sessionDir, "creds.json");
    
    if (!fsSync.existsSync(sessionDir)) {
      fsSync.mkdirSync(sessionDir, { recursive: true });
    }

    if (config.SESSION_ID.startsWith("JK~")) {
      console.log(chalk.green("[ ⏳ ] Processing BASE session"));
      const b64data = config.SESSION_ID.replace("JK~", "");
      const cleanB64 = b64data.replace(/\.\.\./g, '');
      const compressedData = Buffer.from(cleanB64, 'base64');
      const decompressedData = zlib.gunzipSync(compressedData);
      fsSync.writeFileSync(credsPath, decompressedData);
      console.log(chalk.green("[ ✅ ] BASE session decoded and saved successfully"));
      return JSON.parse(decompressedData.toString());
    } else if (config.SESSION_ID.startsWith("IK~")) {
      console.log(chalk.green("[ ⏳ ] Processing MEGA session"));
      const megaFileId = config.SESSION_ID.replace("IK~", "");
      const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
      const data = await new Promise((resolve, reject) => {
        filer.download((err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
      fsSync.writeFileSync(credsPath, data);
      console.log(chalk.green("[ ✅ ] MEGA session downloaded successfully"));
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

// ==================== GEN-ID FUNCTIONS ====================

function makeid(num = 4) {
  let result = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var characters9 = characters.length;
  for (var i = 0; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters9));
  }
  return result;
}

// SINGLE SESSION VERIFICATION FUNCTION
function verifySession(sessionId) {
    try {
        if (!sessionId) {
            console.log(chalk.red("[ ❌ ] No session ID provided"));
            return false;
        }
        
        // For MEGA sessions: IK~[mega-file-id]
        if (sessionId.startsWith('IK~')) {
            console.log(chalk.yellow("🔍 Verifying MEGA session"));
            return true;
        }
        
        // For BASE sessions: JK~[base64-data]
        if (sessionId.startsWith('JK~')) {
            console.log(chalk.yellow("🔍 Verifying BASE session"));
            return true;
        }
        
        console.log(chalk.red("❌ Invalid session format"));
        return false;
    } catch (e) {
        console.log(chalk.red("❌ Error in verification:"), e.message);
        return false;
    }
}

// ==================== BYTE FORMATTING ====================

const byteToKB = 1 / 1024;
const byteToMB = byteToKB / 1024;
const byteToGB = byteToMB / 1024;

function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) {
    return (bytes * byteToGB).toFixed(2) + ' GB';
  } else if (bytes >= Math.pow(1024, 2)) {
    return (bytes * byteToMB).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes * byteToKB).toFixed(2) + ' KB';
  } else {
    return bytes.toFixed(2) + ' bytes';
  }
}

// ==================== PAIRING FUNCTION ====================

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
  console.log(chalk.bgYellow.black(" ACTION REQUIRED "));
  console.log(chalk.green("┌" + "─".repeat(46) + "┐"));
  console.log(chalk.green("│ ") + chalk.bold("Enter WhatsApp number to receive pairing code") + chalk.green(" │"));
  console.log(chalk.green("└" + "─".repeat(46) + "┘"));
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (text) => new Promise((resolve) => rl.question(text, resolve));
  let number = await question(chalk.cyan("» Enter your number (e.g., +923427582273): "));
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
    console.log("\n" + chalk.bgGreen.black(" SUCCESS ") + " Use this pairing code:");
    console.log(chalk.bold.yellow("┌" + "─".repeat(46) + "┐"));
    console.log(chalk.bold.yellow("│ ") + chalk.bgWhite.black(code) + chalk.bold.yellow(" │"));
    console.log(chalk.bold.yellow("└" + "─".repeat(46) + "┘"));
    console.log(chalk.yellow("Enter this code in WhatsApp:\n1. Open WhatsApp\n2. Go to Settings > Linked Devices\n3. Tap 'Link a Device'\n4. Enter the code"));
  } catch (err) {
    console.error("[ ❌ ] Error getting pairing code", { Error: err.message });
    process.exit(1);
  }
}

// ==================== EXPORTS ====================

module.exports = {
  loadSession,
  makeid,
  verifySession,
  formatBytes,
  connectWithPairing,
  byteToKB,
  byteToMB,
  byteToGB
};
