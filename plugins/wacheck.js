const fs = require('fs');
const path = require('path');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { parsePhoneNumber } = require('libphonenumber-js');

/**
 * Check if a WhatsApp number is banned or requires official app
 * @param {string} jid - JID (e.g., 628xxx@s.whatsapp.net) or phone number
 * @returns {Promise<object>} Result object
 */
async function checkBanStatus(jid) {
    if (!jid) {
        throw new Error('Please enter a JID or phone number');
    }

    const tempAuthDir = path.join(process.cwd(), '.tmp_bancheck');

    let resultData = {
        isBanned: false,
        isNeedOfficialWa: false,
        number: jid,
        details: null,
        status: 'Active',
        exists: false
    };

    // Extract and format phone number
    let phoneNumber = jid.replace(/@s\.whatsapp\.net.*$/g, '').replace(/[^\d+]/g, '');

    // Indonesian formatting logic (from original Kiur code)
    if (!phoneNumber.startsWith('+')) {
        if (phoneNumber.startsWith('0')) {
            phoneNumber = phoneNumber.substring(1);
        }
        if (!phoneNumber.startsWith('62') && phoneNumber.length > 0) {
            phoneNumber = '62' + phoneNumber;
        }
        phoneNumber = '+' + phoneNumber;
    }

    let sock;
    try {
        const parsedNumber = parsePhoneNumber(phoneNumber);
        if (!parsedNumber.isValid()) {
            throw new Error('Invalid phone number format');
        }

        const countryCode = parsedNumber.countryCallingCode;
        const nationalNumber = parsedNumber.nationalNumber.toString();

        // Use temporary auth state
        const { state } = await useMultiFileAuthState(".tmp_wacheck");
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            auth: state,
            browser: Browsers.ubuntu("Chrome"), // adjust if your Utils.Browsers uses different
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
        });

        const registrationOptions = {
            phoneNumber: phoneNumber,
            phoneNumberCountryCode: countryCode,
            phoneNumberNationalNumber: nationalNumber,
            phoneNumberMobileCountryCode: "510",
            phoneNumberMobileNetworkCode: "10",
            method: "sms",
        };

        await sock.requestRegistrationCode(registrationOptions);

        // Success → not banned
        resultData.status = "Active (not banned)";
        resultData.exists = true;

    } catch (err) {
        if (err?.appeal_token || err?.violation_type) {
            resultData.isBanned = true;
            resultData.details = {
                violation_type: err.violation_type || null,
                in_app_ban_appeal: err.in_app_ban_appeal || null,
                appeal_token: err.appeal_token || null,
            };
            resultData.status = "Banned";
        } else if (err?.reason === 'blocked' || err?.custom_block_screen || String(err).includes('official')) {
            resultData.isNeedOfficialWa = true;
            resultData.status = "Requires official WhatsApp app";
        } else {
            resultData.status = "Unknown / Possibly non-existent number";
        }

    } finally {
        // Always close socket if created
        if (sock) {
            sock.ws?.close();
            sock.ev.removeAllListeners();
        }

        // Clean up temporary auth folder
        try {
            if (fs.existsSync(tempAuthDir)) {
                await fs.promises.rm(tempAuthDir, { recursive: true, force: true });
            }
        } catch (cleanupErr) {
            console.error("Failed to delete temp auth folder:", cleanupErr);
        }
    }

    return resultData;
}

module.exports = { checkBanStatus };
